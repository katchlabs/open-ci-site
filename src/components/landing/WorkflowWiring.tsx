import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldAlert, Webhook } from 'lucide-react';
import { CodeBlock } from '../CodeBlock';

type WiringMode = 'webhook' | 'oidc';

const WEBHOOK_YAML = `jobs:
  build:
    runs-on: open-ci-linux-x64
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          path: ~/.cargo
          key: cargo-\${{ hashFiles('**/Cargo.lock') }}
      - run: cargo test --workspace`;

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

export function WorkflowWiring() {
  const [mode, setMode] = useState<WiringMode>('webhook');

  return (
    <section id="wiring" className="scroll-mt-20 border-b border-[#1E2636] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F97316]">
              2-Minute Workflow Wiring
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-[#F8FAFC] sm:text-4xl">
              Zero workflow edits, or fail-closed OIDC routing.
            </h2>
            <p className="mt-3 text-base text-[#94A3B8]">
              Pick the admission mode that matches your team's reliability bar —
              or set <code className="text-[#F8FAFC]">admission.mode = "hybrid"</code>{' '}
              to support both across repositories in the same GitHub organization.
            </p>
          </div>

          {/* Interactive mode switcher */}
          <div className="inline-flex rounded-xl border border-[#1E2636] bg-[#111520] p-1 self-start">
            <button
              type="button"
              onClick={() => setMode('webhook')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                mode === 'webhook'
                  ? 'bg-[#F97316] text-[#090B10] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Webhook className="h-3.5 w-3.5" />
              Drop-in Webhooks
            </button>
            <button
              type="button"
              onClick={() => setMode('oidc')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                mode === 'oidc'
                  ? 'bg-[#F97316] text-[#090B10] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Fail-Closed OIDC
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Code panel */}
          <div className="lg:col-span-7">
            <CodeBlock
              code={mode === 'webhook' ? WEBHOOK_YAML : OIDC_YAML}
              language="yaml"
              filename={
                mode === 'webhook'
                  ? '.github/workflows/ci.yml — admission.mode = "webhook"'
                  : '.github/workflows/ci.yml — admission.mode = "oidc"'
              }
            />
          </div>

          {/* Mechanics breakdown */}
          <div className="space-y-4 rounded-2xl border border-[#1E2636] bg-[#111520] p-6 lg:col-span-5">
            {mode === 'webhook' ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 font-mono text-[11px] font-semibold text-[#10B981]">
                  0 workflow boilerplate · Drop-in replacement
                </div>
                <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
                  Direct Webhook Auto-Admission
                </h3>
                <p className="text-sm leading-relaxed text-[#94A3B8]">
                  Point a repo or org <code className="text-[#F8FAFC]">workflow_job</code>{' '}
                  webhook at <code className="text-[#F8FAFC]">/v1/ingress/webhook</code>{' '}
                  and change only <code className="text-[#F8FAFC]">runs-on</code>.
                </p>
                <ul className="space-y-3 pt-1 text-sm text-[#CBD5E1]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>
                      Verifies <code className="text-xs text-[#F8FAFC]">X-Hub-Signature-256</code>{' '}
                      in constant time before parsing JSON.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>
                      Checks capacity guardrails atomically and boots a Spot VM
                      that registers a single-use JIT runner.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>
                      Transparent <code className="text-xs text-[#F8FAFC]">actions/cache@v4</code>{' '}
                      redirects automatically — no custom cache action required.
                    </span>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-3 py-1 font-mono text-[11px] font-semibold text-[#FB923C]">
                  Zero CI outages · Automatic fallback
                </div>
                <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
                  Fail-Closed OIDC Routing
                </h3>
                <p className="text-sm leading-relaxed text-[#94A3B8]">
                  A lightweight zero-dependency TypeScript action exchanges a
                  signed GitHub OIDC JWT for a scoped reservation label.
                </p>
                <ul className="space-y-3 pt-1 text-sm text-[#CBD5E1]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>
                      If your controller is unreachable, draining, or at capacity,
                      jobs route seamlessly to <code className="text-xs text-[#F8FAFC]">ubuntu-latest</code>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>
                      Pins exact 40-char workflow SHAs, <code className="text-xs text-[#F8FAFC]">aud</code>,{' '}
                      <code className="text-xs text-[#F8FAFC]">owner_id</code>, and{' '}
                      <code className="text-xs text-[#F8FAFC]">sub</code> claims via RS256 JWKS.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>
                      Reruns (<code className="text-xs text-[#F8FAFC]">run_attempt &gt; 1</code>)
                      automatically fall back by default so transient Spot
                      preemptions never block a merge.
                    </span>
                  </li>
                </ul>
              </>
            )}

            <div className="pt-3 border-t border-[#1E2636]">
              <Link
                to="/docs/configuration"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#F97316] transition hover:text-[#FB923C]"
              >
                Explore full open-ci.toml reference
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
