import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CodeBlock } from '../CodeBlock';

type WiringMode = 'webhook' | 'oidc';

const WEBHOOK_YAML = `jobs:
  build:
    runs-on: ubuntu-latest
    runs-on: open-ci-linux-x64
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          path: ~/.cargo
          key: cargo-\${{ hashFiles('**/Cargo.lock') }}
      - run: cargo test --workspace`;

const WEBHOOK_DIFF: Record<number, 'add' | 'remove'> = {
  3: 'remove',
  4: 'add',
};

const OIDC_YAML = `jobs:
  route:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    outputs:
      runners: \${{ steps.route.outputs.runners }}
    steps:
      - id: route
        uses: katchlabs/open-ci/actions/route@v0.1.1
        with:
          endpoint: https://ci.example.com/v1/ingress/admit
          audience: open-ci:example-org/example-repo
          pools: '["default"]'
          fallbacks: '{"default": "ubuntu-latest"}'

  build:
    needs: route
    runs-on: \${{ fromJSON(needs.route.outputs.runners).default }}
    steps:
      - uses: actions/checkout@v4
      - run: cargo test --workspace`;

const OIDC_DIFF: Record<number, 'add' | 'remove'> = {
  11: 'add',
  19: 'add',
  20: 'add',
};

const CODE_CHIP =
  'rounded bg-[#ECECE7]/85 px-1.5 py-0.5 font-mono text-[12.5px] text-[#111111]';

export function WorkflowWiring() {
  const [mode, setMode] = useState<WiringMode>('webhook');

  return (
    <section id="workflow" className="scroll-mt-16 border-b border-[#E4E4DF]">
      <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
            03 / WORKFLOW
          </div>
          <h2 className="mt-3 font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-[#111111] sm:text-[38px]">
            One line to switch, or fail-closed OIDC.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: minimal underline tabs + concise explanation (5 cols) */}
          <div className="lg:col-span-5">
            <div
              className="flex gap-6 border-b border-[#E4E4DF]"
              role="tablist"
              aria-label="Workflow admission mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'webhook'}
                onClick={() => setMode('webhook')}
                className={`-mb-px border-b-2 pb-3 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  mode === 'webhook'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#6E6E67] hover:text-[#111111]'
                }`}
              >
                Drop-in webhook
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'oidc'}
                onClick={() => setMode('oidc')}
                className={`-mb-px border-b-2 pb-3 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  mode === 'oidc'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#6E6E67] hover:text-[#111111]'
                }`}
              >
                Fail-closed OIDC
              </button>
            </div>

            {mode === 'webhook' ? (
              <div className="mt-6 space-y-5">
                <p className="text-[15px] leading-[1.65] text-[#555550]">
                  Point a repository or organization{' '}
                  <code className={CODE_CHIP}>workflow_job</code> webhook at{' '}
                  <code className={CODE_CHIP}>/v1/ingress/webhook</code> and
                  update <code className={CODE_CHIP}>runs-on</code>. Standard{' '}
                  <code className={CODE_CHIP}>actions/cache@v4</code> redirects
                  to your in-VPC cache with zero workflow changes.
                </p>

                <dl className="divide-y divide-[#E4E4DF] border-y border-[#E4E4DF] text-[13px]">
                  <div className="grid grid-cols-[132px_1fr] items-baseline gap-3 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Verification
                    </dt>
                    <dd className="text-[#111111]">
                      Constant-time <code className="font-mono text-[12px]">X-Hub-Signature-256</code>
                    </dd>
                  </div>
                  <div className="grid grid-cols-[132px_1fr] items-baseline gap-3 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Provisioning
                    </dt>
                    <dd className="text-[#111111]">
                      Single-use JIT runner per job
                    </dd>
                  </div>
                  <div className="grid grid-cols-[132px_1fr] items-baseline gap-3 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Hybrid mode
                    </dt>
                    <dd className="text-[#111111]">
                      Supports webhook + OIDC in one org
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <p className="text-[15px] leading-[1.65] text-[#555550]">
                  A zero-dependency TypeScript action exchanges a signed GitHub
                  OIDC JWT for a scoped reservation label. If your controller is
                  unreachable, draining, or at capacity, jobs fall back to{' '}
                  <code className={CODE_CHIP}>ubuntu-latest</code> automatically.
                </p>

                <dl className="divide-y divide-[#E4E4DF] border-y border-[#E4E4DF] text-[13px]">
                  <div className="grid grid-cols-[132px_1fr] items-baseline gap-3 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      JWT pinning
                    </dt>
                    <dd className="text-[#111111]">
                      RS256 JWKS · 40-char workflow SHA
                    </dd>
                  </div>
                  <div className="grid grid-cols-[132px_1fr] items-baseline gap-3 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Fallback
                    </dt>
                    <dd className="text-[#111111]">
                      Reruns (<code className="font-mono text-[12px]">attempt &gt; 1</code>) use GitHub
                    </dd>
                  </div>
                  <div className="grid grid-cols-[132px_1fr] items-baseline gap-3 py-3">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Availability
                    </dt>
                    <dd className="text-[#111111]">
                      Controller outage never blocks merges
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/docs/configuration"
                className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[#111111] underline decoration-[#D2D2CA] underline-offset-4 transition-colors hover:decoration-[#111111]"
              >
                Read open-ci.toml reference
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Crisp dark ink code slab with diff highlights (7 cols) */}
          <div className="lg:col-span-7">
            <CodeBlock
              code={mode === 'webhook' ? WEBHOOK_YAML : OIDC_YAML}
              language="yaml"
              showLineNumbers
              diffHighlights={mode === 'webhook' ? WEBHOOK_DIFF : OIDC_DIFF}
              filename={
                mode === 'webhook'
                  ? '.github/workflows/ci.yml  ·  admission.mode = "webhook"'
                  : '.github/workflows/ci.yml  ·  admission.mode = "oidc"'
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
