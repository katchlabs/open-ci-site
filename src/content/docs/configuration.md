# Configuration Reference (`open-ci.toml`)

`open-ci` parses configuration strictly using `#[serde(deny_unknown_fields)]` — typos or stale keys fail fast at boot or during offline validation (`open-ci validate --config /etc/open-ci/open-ci.toml`).

---

## GitHub Scope: Single-Repo vs Org-Wide

Configure **either** a single repository or an entire GitHub organization:

- **Single repository:**
  ```toml
  repository = "example-org/example-repo"
  ```
- **Organization-wide:**
  ```toml
  organization = "example-org"
  allowed_repositories = ["example-org/*"]
  # Or restrict to an explicit allowlist:
  # allowed_repositories = ["example-org/api", "example-org/web"]
  ```
  When running org-wide, optionally set `github.runner_group_id = 1` (defaults to `1`) for organization-level JIT runner registration.

Both webhook verification and OIDC claim validation enforce `GitHubScope::allows_repository`.

---

## Admission Modes (`admission.mode`)

| Mode | Trigger | Runner Labels | Behavior |
| --- | --- | --- | --- |
| `"oidc"` (default) | `actions/route` calls `POST /v1/ingress/admit` with a GitHub OIDC JWT | Scoped per reservation (`<runner_label>-<reservation_id>`) | Fail-closed: outage, draining, reruns (`fallback_on_rerun = true`), unhealthy providers, or capacity exhaustion route cleanly to `pool.fallback_label`. |
| `"webhook"` | GitHub sends `workflow_job` (`queued`) to `POST /v1/ingress/webhook` | Unscoped (`pool.runner_label`) | Drop-in: zero workflow edits beyond `runs-on: <runner_label>`. Matching queued jobs auto-admit idempotently if guardrails and capacity allow. `/v1/ingress/admit` returns `403`. |
| `"hybrid"` | Both `POST /v1/ingress/admit` and `POST /v1/ingress/webhook` | Scoped for OIDC admissions; unscoped for direct webhook admissions | Supports gradual migration across repositories in the same organization. |

---

## Capacity Envelope & Guardrails

Every admitted run reserves the worst-case footprint of its requested pools:

- `per_run = max_instances_per_run.unwrap_or(max_instances)`
- Total reserved = `admission.background` + `sum(vcpu * per_run, instances * per_run, disk_gb * per_run)` across held admissions.
- Checked atomically against `[admission.capacity]` before returning an admission decision.

Optional `[admission.guardrails]` caps:
- `max_concurrent_runs` — hard cap on concurrent admitted workflow runs.
- `max_admitted_runs` — lifetime rollout budget for gradual canarying.
- `max_admitted_runs_per_utc_day` — daily spend guardrail.
- `admit_until_unix` — automatic rollout expiry timestamp.

---

## Complete Annotated `open-ci.toml`

```toml
# Unified Open CI configuration (GCP + AWS multi-cloud example).
# Replace placeholder repository, project, account, image, and subnet IDs before running live.

repository = "example-org/example-repo"
# Or configure organization-wide runners across multiple repositories instead of `repository`:
# organization = "example-org"
# allowed_repositories = ["example-org/*"] # or explicit list: ["example-org/api", "example-org/web"]

[server]
listen = "127.0.0.1:8080"
public_url = "https://open-ci.example.com"
database_path = "/var/lib/open-ci/open-ci.db"
tick_seconds = 5
request_timeout_seconds = 20
allow_insecure_loopback = false
cors_allowed_origins = []

[github]
api_url = "https://api.github.com"
oidc_issuer = "https://token.actions.githubusercontent.com"
# Optional GitHub runner group ID for org-level JIT runner registration (defaults to 1):
# runner_group_id = 1

# Required when `admission.mode` is "oidc" or "hybrid"; optional when `admission.mode = "webhook"`.
# For org-level OIDC setups, omit `repository_id` and use org patterns in `subjects`
# (e.g. "repo:example-org/*:pull_request").
[github.oidc_trust]
audience = "open-ci:example-org/example-repo"
repository_id = 123456789
owner_id = 987654321
subjects = ["repo:example-org/example-repo:pull_request"]
caller_workflows = [".github/workflows/ci.yml"]
# Allow standard repository workflow paths (or use [github.oidc_trust.workflows] below to pin reusable workflow SHAs).
allowed_workflow_paths = [".github/workflows/ci.yml"]

# Optional: pin trusted reusable workflow commits to exact 40-character Git SHAs.
[github.oidc_trust.workflows]
"example-org/example-repo/.github/workflows/ci.yml@1111111111111111111111111111111111111111" = [
  "1111111111111111111111111111111111111111",
]

[gcp]
project = "your-gcp-project-id"
compute_url = "https://compute.googleapis.com/compute/v1"
image = "projects/your-gcp-project-id/global/images/open-ci-runner-x64-v1"
external_ipv4 = false
network_tier = "PREMIUM"
network_tags = ["open-ci-runner"]
# Optional cross-project/BYOC service account impersonation (uses GCE metadata or OPEN_CI_GCP_TOKEN_FILE as base):
# impersonate_service_account = "open-ci-runner-mgr@customer-project.iam.gserviceaccount.com"

[aws]
account_id = "123456789012"
# Optional cross-account/BYOC STS AssumeRole (resolves base credentials from env or EC2 IMDSv2):
# role_arn = "arn:aws:iam::123456789012:role/open-ci-controller"
# external_id = "your-unique-external-id"
# Or, for a controller running on GCP: keyless federation via the VM's Google identity token
# (STS AssumeRoleWithWebIdentity; see the multi-cloud Terraform outputs). Do not combine with external_id.
# role_arn = "arn:aws:iam::123456789012:role/open-ci-gcp-controller"
# web_identity_audience = "open-ci-aws-federation"

# Optional built-in GitHub Actions v2 transparent cache (`open-ci cache --config ...`).
# Jobs authenticate with their own ACTIONS_RUNTIME_TOKEN; entries are isolated per repository and Git ref.
# Pools opt in with `transparent_cache = true` (not for pools running `container:` jobs or Docker actions).
# [cache]
# public_url = "http://10.0.0.5:8090"          # Private address runner subnets reach the cache on
# [cache.auth]
# repositories = [123456789]                     # Numeric repository IDs (gh api repos/OWNER/REPO --jq .id), or "any"
# [cache.storage]                                # Defaults to type = "local", path = "/var/lib/open-ci-cache/blobs"
# type = "gcs"                                   # "local" | "s3" | "gcs"
# bucket = "your-ci-cache"
# [cache.storage.credentials]                    # gcs: "metadata" (default) | "impersonate" | "token_file"
# type = "metadata"                              # s3:  "instance" (default) | "environment" | "assume_role"
# [cache.retention]
# max_total_bytes = 53687091200                  # 50 GiB LRU budget
# max_unused_days = 7

[admission]
# Admission mode: "oidc" (default, requires actions/route), "webhook" (direct auto-admission), or "hybrid".
mode = "oidc"
max_run_seconds = 3600
fallback_on_rerun = true

[admission.capacity]
vcpu = 64
instances = 24
disk_gb = 1000

[admission.background]
vcpu = 2
instances = 1
disk_gb = 30

[admission.guardrails]
max_concurrent_runs = 4
# Optional caps:
# max_admitted_runs = 100
# max_admitted_runs_per_utc_day = 25
# admit_until_unix = 1893456000

[pools.default]
runner_label = "open-ci-linux-x64"
fallback_label = "ubuntu-latest"
architecture = "x64"
vcpu = 4
disk_gb = 40
max_instances = 8
# Optional: reserve fewer instances per workflow run than pool max_instances
# max_instances_per_run = 4
min_idle_instances = 0
creates_per_tick = 4
lifetime_seconds = 2400
idle_seconds = 120
job_poll_seconds = 15
cloud_discovery_seconds = 60
prefer_cheapest = true
# transparent_cache = true

[pools.default.provider_weights]
gcp = 1
aws = 1

[[pools.default.placements]]
provider = "gcp"
region = "us-west1"
zone = "us-west1-a"
machine_type = "c3-standard-4"
subnet = "projects/your-gcp-project-id/regions/us-west1/subnetworks/open-ci"
spot = true # Set to false for On-Demand / Standard instances

[[pools.default.placements]]
provider = "aws"
region = "us-west-2"
zone = "us-west-2a"
machine_type = "c7i.xlarge"
subnet = "subnet-0123456789abcdef0"
image = "ami-0123456789abcdef0"
security_group = "sg-0123456789abcdef0"
root_device = "/dev/sda1"
spot = true # Set to false for On-Demand EC2 instances
max_spot_price_usd = "0.08"
```

---

## Offline Validation

Run `open-ci validate` in CI or before restarting `open-ci.service` to verify syntax, capacity headroom, placement fields, and OIDC trust policies without touching cloud APIs:

```bash
open-ci validate --config /etc/open-ci/open-ci.toml
```
