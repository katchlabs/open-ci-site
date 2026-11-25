# Deployment Quickstart

This guide takes you from zero to ephemeral Spot/On-Demand GitHub Actions runners on **AWS**, **GCP**, or **both clouds**.

## Choose Your Deployment Path

| Path | Terraform Example | Modules Used | Best For |
| --- | --- | --- | --- |
| **AWS-Only** | [`infra/terraform/examples/aws-controller`](https://github.com/katchlabs/open-ci/tree/main/infra/terraform/examples/aws-controller) | `aws-foundation`, `aws-controller` | Teams running natively on AWS EC2 (`t4g.small` controller + Spot/On-Demand runners + optional BYOC `AssumeRole`). |
| **GCP-Only** | [`infra/terraform/examples/gcp-quickstart`](https://github.com/katchlabs/open-ci/tree/main/infra/terraform/examples/gcp-quickstart) | `gcp-foundation`, `gcp-controller` | Teams running on GCP Compute Engine with Spot VMs, native `maxRunDuration`, and Cloud NAT egress. |
| **Multi-Cloud** | [`infra/terraform/examples/multi-cloud`](https://github.com/katchlabs/open-ci/tree/main/infra/terraform/examples/multi-cloud) | `gcp-foundation`, `gcp-controller`, `aws-foundation` | Spot-resilient fleets spilling automatically between GCP and AWS when a region or instance family stocks out. |

---

## Prerequisites

- **Terraform** `>= 1.6.0` (or OpenTofu) and **Packer** `>= 1.10.0`.
- A **GitHub App** installed on your repository or organization with permissions:
  - Repository-level: `Actions: Read`, `Administration: Read & Write` (for JIT runner registration), and webhook subscription to `workflow_job`.
  - Organization-level: `Actions: Read`, `Self-hosted runners: Read & Write`, and org webhook subscription to `workflow_job`.
- A public DNS record (e.g. `ci.example.com`) that you will point to the controller's public IP for automatic TLS via Caddy.

---

## Step 1: Provision Cloud Infrastructure (Terraform)

### Path A: AWS-Only (`aws-controller`)

```bash
cd infra/terraform/examples/aws-controller
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var='availability_zones=["us-east-1a","us-east-1b"]' \
  -var="domain=ci.example.com" \
  -var="controller_architecture=arm64" \
  -var="controller_instance_type=t4g.small"
```

Optional variables:
- `-var='assume_role_arns=["arn:aws:iam::222222222222:role/open-ci-byoc"]'` for cross-account BYOC runner provisioning.
- `-var="backup_bucket_arn=arn:aws:s3:::my-open-ci-backups"` for encrypted SQLite state backups.
- `-var="janitor_zip_path=/path/to/open-ci-aws-janitor-lambda-aarch64-unknown-linux-gnu.zip"` to deploy the Rust `open-ci-aws-janitor` Lambda (`provided.al2023`, arm64). Download the zip from the release (it contains the required `bootstrap` executable); do not pass the `.tar.gz`.
- `-var="create_spot_service_linked_role=false"` if the account already has `AWSServiceRoleForEC2Spot`. EC2 only launches Spot through the API once that role exists, so leave it `true` in a fresh account.

AWS Spot notes:
- **One janitor per region.** The janitor sweeps only the region it is deployed in. Apply `aws-foundation` (with `janitor_zip_path`) in every region that has AWS placements. IAM names and the Spot service-linked role are account-wide, so each additional region needs a distinct `name_prefix` and `create_spot_service_linked_role = false`.
- **Janitor ceiling.** `janitor_max_lifetime_seconds` (default `3600`) must be at least the largest `pools.*.lifetime_seconds`; the janitor terminates any runner older than this from launch.
- **Controller access.** The controller runs Ubuntu 24.04 with the SSM agent and no inbound SSH. Open a shell with `$(terraform output -raw ssm_session_command)` (requires the AWS CLI Session Manager plugin).

### Path B: GCP-Only (`gcp-quickstart`)

```bash
cd infra/terraform/examples/gcp-quickstart
terraform init
terraform apply \
  -var="project_id=YOUR_GCP_PROJECT" \
  -var="region=us-central1" \
  -var="zone=us-central1-a" \
  -var="domain=ci.example.com"
```

### Path C: Multi-Cloud (`multi-cloud`)

```bash
cd infra/terraform/examples/multi-cloud
terraform init
terraform apply \
  -var="gcp_project_id=YOUR_GCP_PROJECT" \
  -var="gcp_region=us-central1" \
  -var="gcp_zone=us-central1-a" \
  -var="aws_region=us-east-1" \
  -var="domain=ci.example.com"
```

The multi-cloud example's GCP controller reaches AWS without access keys: it exchanges its Google identity token for the `aws_role_arn` output via STS `AssumeRoleWithWebIdentity`. Copy the `aws_role_arn` and `aws_web_identity_audience` outputs into `[aws]` in Step 3.

After `terraform apply` completes, create a DNS `A` record pointing `ci.example.com` to the `controller_ip` output and note the printed subnet IDs, security group ID, and IAM/service account outputs.

---

## Step 2: Obtain Binaries & Bake Runner Images (Packer)

### 2.1 Download or Build the Linux Binary

Download prebuilt `x86_64` and/or `aarch64` release binaries (or build from source with `cargo build --release --locked --bin open-ci --bin open-ci-aws-janitor`):

```bash
# Download x86_64 and aarch64 release archives and verify checksums
RELEASE_URL="https://github.com/katchlabs/open-ci/releases/latest/download"
curl -fsSLO "${RELEASE_URL}/open-ci-x86_64-unknown-linux-gnu.tar.gz"
curl -fsSLO "${RELEASE_URL}/open-ci-aarch64-unknown-linux-gnu.tar.gz"
curl -fsSLO "${RELEASE_URL}/SHA256SUMS.txt"
sha256sum --ignore-missing -c SHA256SUMS.txt

mkdir -p dist/x64 dist/arm64
tar -xzf open-ci-x86_64-unknown-linux-gnu.tar.gz -C dist/x64
tar -xzf open-ci-aarch64-unknown-linux-gnu.tar.gz -C dist/arm64
```

### 2.2 Build Hardened `x64` / `arm64` Ubuntu 24.04 Runner Images

`infra/packer/ubuntu-runner.pkr.hcl` bakes the official pinned `actions/runner` archive (SHA-256 verified), `/usr/local/bin/open-ci`, Docker Engine with BuildKit + `overlay2`, sysctl inotify tuning (`fs.inotify.max_user_watches=524288`), and `open-ci-nvme.service` (`/usr/local/sbin/open-ci-setup-nvme.sh`) for automatic boot-time `ext4`/RAID0 mounting of local ephemeral NVMe SSDs.

```bash
cd infra/packer
packer init ubuntu-runner.pkr.hcl

# AWS AMI (x64 — set -var="arch=arm64" and arm64 binary for Graviton)
packer build \
  -only=open-ci-runner.amazon-ebs.ubuntu_runner \
  -var="arch=x64" \
  -var="aws_region=us-east-1" \
  -var="open_ci_binary_path=../../dist/x64/open-ci" \
  -var="github_runner_sha256=PINNED_RUNNER_ARCHIVE_SHA256" \
  ubuntu-runner.pkr.hcl

# GCP Image (x64 — set -var="arch=arm64" and arm64 binary for Tau T2A / C4A)
packer build \
  -only=open-ci-runner.googlecompute.ubuntu_runner \
  -var="arch=x64" \
  -var="gcp_project_id=YOUR_GCP_PROJECT" \
  -var="gcp_zone=us-central1-a" \
  -var="open_ci_binary_path=../../dist/x64/open-ci" \
  -var="github_runner_sha256=PINNED_RUNNER_ARCHIVE_SHA256" \
  ubuntu-runner.pkr.hcl
```

> **Note:** Look up the exact SHA-256 checksum for your `github_runner_version` (default `2.323.0`) on the [`actions/runner` releases page](https://github.com/actions/runner/releases).

---

## Step 3: Configure `open-ci.toml`, Secrets & Credential Broker

On the controller host (AWS: connect with `$(terraform output -raw ssm_session_command)`), install the binary to `/usr/local/bin/open-ci` and create dedicated system users (`open-ci` for the control plane and cache; `open-ci-broker` in group `open-ci` for credential rotation):

```bash
sudo useradd --system --home-dir /var/lib/open-ci --shell /usr/sbin/nologin open-ci
sudo useradd --system --no-create-home --gid open-ci --shell /usr/sbin/nologin open-ci-broker
sudo install -d -o root -g open-ci -m 0750 /etc/open-ci
sudo install -d -o open-ci -g open-ci -m 0700 /var/lib/open-ci /var/backups/open-ci
sudo install -d -o open-ci-broker -g open-ci -m 0750 /run/open-ci
```

### 3.1 Generate Secrets (`0o600` / `0o640`)

```bash
# Control plane secrets (readable only by open-ci)
openssl rand -hex 32 | sudo tee /etc/open-ci/webhook-secret >/dev/null
openssl rand -hex 32 | sudo tee /etc/open-ci/bootstrap-secret >/dev/null
openssl rand -hex 24 | sudo tee /etc/open-ci/operator-token >/dev/null
# Optional: required if enabling [cache]
openssl rand -hex 32 | sudo tee /etc/open-ci/cache-signing-key >/dev/null

sudo chown open-ci:open-ci /etc/open-ci/{webhook-secret,bootstrap-secret,operator-token,cache-signing-key}
sudo chmod 0600 /etc/open-ci/{webhook-secret,bootstrap-secret,operator-token,cache-signing-key}

# GitHub App private key (readable ONLY by open-ci-broker, never by open-ci)
sudo install -o open-ci-broker -g open-ci-broker -m 0600 /path/to/github-app.pem /etc/open-ci/github-app.pem
```

Create `/etc/open-ci/open-ci.env` (referenced by a systemd drop-in or `EnvironmentFile=`):

```ini
OPEN_CI_GITHUB_TOKEN_FILE=/run/open-ci/github-token
OPEN_CI_WEBHOOK_SECRET_FILE=/etc/open-ci/webhook-secret
OPEN_CI_BOOTSTRAP_SECRET_FILE=/etc/open-ci/bootstrap-secret
OPEN_CI_OPERATOR_TOKEN_FILE=/etc/open-ci/operator-token
# Include if running open-ci cache:
OPEN_CI_CACHE_SIGNING_KEY_FILE=/etc/open-ci/cache-signing-key
# Optional on GCP if reading broker-rotated metadata tokens instead of direct GCE metadata:
# OPEN_CI_GCP_TOKEN_FILE=/run/open-ci/gcp-token
```

### 3.2 Write `/etc/open-ci/open-ci.toml` & `/etc/open-ci/broker.toml`

Start from the [Configuration Reference](/docs/configuration), copy `config/broker.example.toml` to `/etc/open-ci/broker.toml` with your GitHub App `app_id` and `installation_id`, and validate offline:

```bash
sudo -u open-ci /usr/local/bin/open-ci validate --config /etc/open-ci/open-ci.toml
```

---

## Step 4: Start Systemd Units & Caddy TLS Reverse Proxy

Copy the hardened systemd units from [`deploy/systemd/`](https://github.com/katchlabs/open-ci/tree/main/deploy/systemd):

```bash
sudo cp deploy/systemd/open-ci.service \
        deploy/systemd/open-ci-cache.service \
        deploy/systemd/open-ci-credentials.service \
        deploy/systemd/open-ci-credentials.timer \
        deploy/systemd/open-ci-backup.service \
        deploy/systemd/open-ci-backup.timer \
        /etc/systemd/system/

# Attach /etc/open-ci/open-ci.env to open-ci.service via a drop-in
sudo mkdir -p /etc/systemd/system/open-ci.service.d
printf '[Service]\nEnvironmentFile=/etc/open-ci/open-ci.env\n' \
  | sudo tee /etc/systemd/system/open-ci.service.d/env.conf >/dev/null

sudo systemctl daemon-reload

# Rotate initial GitHub App token before starting open-ci.service
sudo systemctl start open-ci-credentials.service

# Enable timers and services (include open-ci-cache.service if [cache] is enabled)
sudo systemctl enable --now \
  open-ci-credentials.timer \
  open-ci-backup.timer \
  open-ci.service
# Optional:
# sudo systemctl enable --now open-ci-cache.service
```

Install Caddy using [`deploy/caddy/Caddyfile.example`](https://github.com/katchlabs/open-ci/blob/main/deploy/caddy/Caddyfile.example), replacing `ci.example.com` with your domain. This exposes **only** the 6 public machine ingress paths (`/healthz`, `/readyz`, `/v1/ingress/webhook`, `/v1/ingress/admit`, `/v1/workers/*/bootstrap`, `/v1/workers/*/usage`) over automatic HTTPS and returns `404` for `/api/v1/*` and `/metrics` on the public interface:

```bash
sudo cp deploy/caddy/Caddyfile.example /etc/caddy/Caddyfile
sudo sed -i 's/ci.example.com/YOUR_DOMAIN/g' /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Verify readiness and operator API from the controller (or over SSH tunnel / WireGuard / Tailscale):

```bash
curl -fsS https://YOUR_DOMAIN/readyz
OPEN_CI_OPERATOR_TOKEN="$(sudo cat /etc/open-ci/operator-token)" \
  open-ci ctl --url http://127.0.0.1:8080 status
```

---

## Step 5: Wire GitHub Webhook & Workflows

1. In your GitHub App or repository/organization webhook settings:
   - **Payload URL:** `https://YOUR_DOMAIN/v1/ingress/webhook`
   - **Content type:** `application/json`
   - **Secret:** contents of `/etc/open-ci/webhook-secret`
   - **Events:** `Workflow jobs` (`workflow_job`)

2. Update a workflow:

**Direct Webhook (`admission.mode = "webhook"` or `"hybrid"`):**

```yaml
jobs:
  test:
    runs-on: open-ci-linux-x64
    steps:
      - uses: actions/checkout@v4
      - run: echo "Running on ${{ runner.name }} (NVMe workdir: $RUNNER_WORKDIR)"
```

**Fail-Closed OIDC (`admission.mode = "oidc"` or `"hybrid"`):**

```yaml
jobs:
  route:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    outputs:
      runners: ${{ steps.route.outputs.runners }}
    steps:
      - id: route
        uses: katchlabs/open-ci/actions/route@v0.1.1
        with:
          endpoint: https://YOUR_DOMAIN/v1/ingress/admit
          audience: open-ci:example-org/example-repo
          pools: '["default"]'
          fallbacks: '{"default": "ubuntu-latest"}'

  test:
    needs: route
    runs-on: ${{ fromJSON(needs.route.outputs.runners).default }}
    steps:
      - uses: actions/checkout@v4
      - run: echo "Running on ${{ runner.name }}"
```

3. Trigger a workflow run and watch workers boot, execute, and self-terminate:

```bash
open-ci ctl --url http://127.0.0.1:8080 status
```

---

## Next Steps

- Review the [Security & Threat Model](/docs/security) before enabling untrusted pull requests.
- Enable the built-in [Actions v2 Cache & NVMe](/docs/caching) pipeline for up to 45% faster builds.
- Read the [Architecture Guide](/docs/architecture) for Prometheus metrics, SSE streams, and multi-cloud placement tuning.
