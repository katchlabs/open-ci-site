# Transparent Actions v2 Cache & Auto-NVMe

`open-ci` combines a **built-in GitHub Actions v2 transparent cache server** (`open-ci cache`) with **boot-time local NVMe RAID0/ext4 scratch storage** so standard `actions/cache@v4`, `setup-*`, `Swatinem/rust-cache`, and Docker BuildKit `type=gha` run at regional VPC speeds with zero workflow changes.

---

## How Transparent Actions v2 Caching Works

When `[cache]` is configured in `open-ci.toml` and `OPEN_CI_CACHE_SIGNING_KEY_FILE` is provided to `open-ci cache`:

1. **Zero cache credentials on workers.** For pools with `transparent_cache = true`, `open-ci-server` places `cache_url` (`= cache.public_url`) into the worker's cloud-init stdin envelope. No storage keys or cache secrets are ever minted or shipped to worker VMs.
2. **Runner redirect at bootstrap.** `open-ci agent bootstrap` renames the `ACTIONS_RESULTS_URL` UTF-16 literal in `bin/Runner.Worker.dll` to `ACTIONS_RESULTS_ORL` (identical byte length) so the runner does not overwrite it per job, then launches the runner with `ACTIONS_CACHE_SERVICE_V2=true` and `ACTIONS_RESULTS_URL=<cache_url>/`. If the runner binary lacks that literal, the agent skips redirection and falls back cleanly to GitHub's hosted cache.
3. **Runtime-token authorization.** Official `actions/cache`, `setup-node`/`setup-go`/`setup-python`, `Swatinem/rust-cache`, and BuildKit `type=gha` authenticate to `open-ci cache` using the job's own `ACTIONS_RUNTIME_TOKEN`. The server verifies the RS256 signature against the issuer JWKS (`iss`, `exp`, optional `aud`), checks that `repository_id` is allowlisted in `cache.auth.repositories`, and inspects the `ac` claim for Git ref read/write scopes.
4. **GitHub-identical ref isolation & immutability.** Entries are immutable and keyed by `(repository_id, ref scope, version, key)`. A pull request writes only to `refs/pull/N/merge` and can read `main`'s cache, but can never poison `main`. Duplicate saves return `409 Conflict`.
5. **Results-service passthrough.** Non-`CacheService` Twirp RPCs (such as `ArtifactService` used by `actions/upload-artifact@v4`) are forwarded unchanged to `cache.upstream_results_url` (`https://results-receiver.actions.githubusercontent.com` by default).

> **Container job limitation:** Because the GitHub Actions runner only forwards per-step environment variables into `container:` jobs and Docker container actions, `ACTIONS_RESULTS_URL` is absent inside those containers once redirected. Enable `transparent_cache = true` only on pools whose jobs run steps directly on the VM host.

---

## Pluggable Streaming Backends (`local`, `s3`, `gcs`)

Metadata lives in a local `SQLite` index (`cache.index_path`), while cache archives stream directly through a pluggable `BlobStore` without buffering whole archives in RAM:

| Backend | Configuration | Credentials | Server-Side Assembly |
| --- | --- | --- | --- |
| **Local NVMe / Disk** | `type = "local"`, `path = "/var/lib/open-ci-cache/blobs"` | Filesystem (`0o600` atomic writes) | Local file append / atomic rename |
| **S3 / R2 / MinIO** | `type = "s3"`, `bucket = "..."`, `region = "..."` | `instance` (IMDSv2, default), `environment`, or `assume_role` | Multipart `UploadPartCopy` (add `AbortIncompleteMultipartUpload` lifecycle rule) |
| **Native GCS** | `type = "gcs"`, `bucket = "..."` | `metadata` (VM service account, default), `impersonate`, or `token_file` | Native GCS `compose` API |

### Example `[cache]` Configuration (GCS or S3)

```toml
[cache]
listen = "0.0.0.0:8090"
public_url = "http://10.0.0.5:8090" # Private VPC IP reachable from runner subnets

[cache.auth]
# Find repository ID via: gh api repos/OWNER/REPO --jq .id
repositories = [123456789]

[cache.storage]
type = "gcs"                # "local" | "s3" | "gcs"
bucket = "acme-ci-cache"    # Provision in the same region as your runners
# region = "us-east-1"      # Required for type = "s3"

[cache.storage.credentials]
type = "metadata"           # gcs: "metadata" | "impersonate" | "token_file"
                            # s3:  "instance" | "environment" | "assume_role"

[cache.retention]
max_total_bytes = 53687091200 # 50 GiB LRU budget
max_unused_days = 7           # Matches GitHub's 7-day unused expiry
```

Then opt in per pool:

```toml
[pools.default]
runner_label = "open-ci-linux-x64"
transparent_cache = true
```

---

## Retention & Integrity Guarantees

- **Strict upload lifecycle:** Signed upload URLs (`op=put`) accept bytes only while their reservation is active. Once finalized or expired, every `PUT` is rejected so committed entries can never be mutated.
- **Disconnect-safe commits & timeouts:** Azure blocklist commits run to completion even if the client disconnects, block lists cap at 50,000 blocks, and stalled upstream storage requests time out after 60 seconds without progress.
- **Automatic LRU & TTL sweep:** Background sweeps drop stale upload reservations, evict entries unused for `max_unused_days` (default `7`), and prune least-recently-used entries until total usage fits `max_total_bytes`, deleting orphaned blobs from storage.

---

## Boot-Time Auto-NVMe RAID0 & Kernel Tuning

Packer-built Ubuntu 24.04 runner images (`infra/packer/ubuntu-runner.pkr.hcl`, `x64` and `arm64`) install `/usr/local/sbin/open-ci-setup-nvme.sh` as `open-ci-nvme.service` (`Before=docker.service`):

1. **Safe disk discovery:** Resolves the root block device via `findmnt`/`lsblk` and explicitly excludes network-attached persistent disks (`Elastic Block Store`, `PersistentDisk`) and already-partitioned disks.
2. **Instant `ext4` or RAID0 striping:** Formats a single local NVMe drive with `ext4` (`-O ^has_journal`, `noatime,nodiratime`) or stripes 2+ local NVMe drives into `/dev/md0` RAID0 (`mdadm --chunk=256`).
3. **Docker & Runner wiring:** Mounts at `/mnt/nvme`, creates `/mnt/nvme/docker`, `/mnt/nvme/work`, and `/mnt/nvme/tmp`, and rewrites `/etc/docker/daemon.json` to set `"data-root": "/mnt/nvme/docker"`.
4. **Zero-config agent injection:** `open-ci agent bootstrap` probes `/mnt/nvme/work` and `/mnt/nvme/tmp` for writability and automatically injects `RUNNER_WORKDIR=/mnt/nvme/work` and `TMPDIR=/mnt/nvme/tmp`.
5. **CI kernel tuning:** `/etc/sysctl.d/99-open-ci.conf` raises `fs.inotify.max_user_watches=524288`, `fs.inotify.max_user_instances=1024`, and lowers `vm.swappiness=10`; Docker runs `overlay2` with BuildKit enabled and 10 concurrent pulls/pushes.

---

## Cache Server HTTP & Twirp Endpoints

Run via `open-ci cache --config /etc/open-ci/open-ci.toml` on private runner-reachable VPC networking:

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/healthz` | None | Liveness probe returning `200 OK` (`ok`). |
| `POST` | `/twirp/github.actions.results.api.v1.CacheService/CreateCacheEntry` | `Bearer <ACTIONS_RUNTIME_TOKEN>` | Reserves `(repository, writable ref, version, key)` and returns a signed upload URL; `409` on collision, `403` without writable ref. |
| `POST` | `/twirp/github.actions.results.api.v1.CacheService/FinalizeCacheEntryUpload` | `Bearer <ACTIONS_RUNTIME_TOKEN>` | Verifies uploaded byte length against `sizeBytes` and `max_entry_bytes`, then publishes the immutable entry. |
| `POST` | `/twirp/github.actions.results.api.v1.CacheService/GetCacheEntryDownloadURL` | `Bearer <ACTIONS_RUNTIME_TOKEN>` | Searches readable refs in order (exact then newest prefix per key, up to 64 restore keys) and returns a signed download URL or miss. |
| `POST` | `/twirp/{service}/{method}` | Forwarded unchanged | Non-`CacheService` Twirp RPCs proxied to `cache.upstream_results_url`. |
| `PUT` | `/v1/cache/blobs/{id}` | Signed query (`exp`, `op=put`, `sig`) | Single-shot upload, Azure staged block upload (`?comp=block&blockid=...`), or Azure XML blocklist commit (`?comp=blocklist`). |
| `HEAD` / `GET` | `/v1/cache/blobs/{id}` | Signed query (`exp`, `op=get`, `sig`) | Returns size metadata or streams blob with single `Range: bytes=...` (`206 Partial Content`) support. |
