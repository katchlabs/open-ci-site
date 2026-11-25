import overviewMd from '../content/docs/overview.md?raw';
import quickstartMd from '../content/docs/quickstart.md?raw';
import configurationMd from '../content/docs/configuration.md?raw';
import cachingMd from '../content/docs/caching.md?raw';
import architectureMd from '../content/docs/architecture.md?raw';
import securityMd from '../content/docs/security.md?raw';
import engineeringMd from '../content/docs/engineering.md?raw';

export interface DocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface DocPage {
  slug: string;
  path: string;
  title: string;
  shortTitle: string;
  section: 'Getting Started' | 'Core Guides' | 'Reference & Security';
  description: string;
  content: string;
  headings: DocHeading[];
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  let inCodeBlock = false;
  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const text = match[2]
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      headings.push({
        id: slugifyHeading(text),
        text,
        level,
      });
    }
  }
  return headings;
}

const RAW_DOCS: Omit<DocPage, 'headings'>[] = [
  {
    slug: 'overview',
    path: '/docs',
    title: 'Overview & 60-Second Local Demo',
    shortTitle: 'Overview & 60s Demo',
    section: 'Getting Started',
    description:
      'Run the full open-ci control plane locally against MockProvider in 60 seconds and explore the workspace map.',
    content: overviewMd,
  },
  {
    slug: 'quickstart',
    path: '/docs/quickstart',
    title: 'Deployment Quickstart',
    shortTitle: 'AWS / GCP Quickstart',
    section: 'Getting Started',
    description:
      'End-to-end AWS-only, GCP-only, and multi-cloud deployment with Terraform, Packer, systemd, and Caddy.',
    content: quickstartMd,
  },
  {
    slug: 'configuration',
    path: '/docs/configuration',
    title: 'Configuration Reference (open-ci.toml)',
    shortTitle: 'open-ci.toml Reference',
    section: 'Core Guides',
    description:
      'Complete open-ci.toml reference covering single-repo vs org-wide scope, webhook/OIDC/hybrid modes, pools, and guardrails.',
    content: configurationMd,
  },
  {
    slug: 'caching',
    path: '/docs/caching',
    title: 'Transparent Actions v2 Cache & Auto-NVMe',
    shortTitle: 'Caching & Auto-NVMe',
    section: 'Core Guides',
    description:
      'Built-in Actions Cache v2 server (local NVMe, S3/R2/MinIO, native GCS) and boot-time NVMe RAID0 striping.',
    content: cachingMd,
  },
  {
    slug: 'architecture',
    path: '/docs/architecture',
    title: 'Architecture & HTTP API',
    shortTitle: 'Architecture & API',
    section: 'Reference & Security',
    description:
      'Hexagonal Rust workspace layout, SQLite WAL durability, multi-cloud placement backoff, and exact HTTP/Prometheus/SSE endpoints.',
    content: architectureMd,
  },
  {
    slug: 'security',
    path: '/docs/security',
    title: 'Security & Threat Model',
    shortTitle: 'Security & Threat Model',
    section: 'Reference & Security',
    description:
      'Zero-IAM workers, single-use atomic HMAC bootstrap, RS256 OIDC pinning, credential broker isolation, and triple-layer VM expiry.',
    content: securityMd,
  },
  {
    slug: 'engineering',
    path: '/docs/engineering',
    title: 'Engineering & 7-Gate Proof Ladder',
    shortTitle: 'Engineering & verify.sh',
    section: 'Reference & Security',
    description:
      'The Pyramid of Trust, strict Rust safety lints, proptest invariants, and the 7-gate ./scripts/verify.sh verification ladder.',
    content: engineeringMd,
  },
];

export const DOC_PAGES: DocPage[] = RAW_DOCS.map((doc) => ({
  ...doc,
  headings: extractHeadings(doc.content),
}));

export function getDocBySlug(slug?: string): DocPage {
  if (!slug) return DOC_PAGES[0];
  return DOC_PAGES.find((d) => d.slug === slug) ?? DOC_PAGES[0];
}

export interface SearchResult {
  doc: DocPage;
  heading?: DocHeading;
  snippet: string;
}

export function searchDocs(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return DOC_PAGES.map((doc) => ({
      doc,
      snippet: doc.description,
    }));
  }

  const results: SearchResult[] = [];
  for (const doc of DOC_PAGES) {
    const titleMatch =
      doc.title.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q);
    const matchedHeading = doc.headings.find((h) =>
      h.text.toLowerCase().includes(q)
    );
    const contentLower = doc.content.toLowerCase();
    const idx = contentLower.indexOf(q);

    if (titleMatch || matchedHeading || idx >= 0) {
      let snippet = doc.description;
      if (idx >= 0) {
        const start = Math.max(0, idx - 55);
        const end = Math.min(doc.content.length, idx + q.length + 95);
        snippet = doc.content
          .slice(start, end)
          .replace(/[#*`>\n]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (start > 0) snippet = `…${snippet}`;
        if (end < doc.content.length) snippet = `${snippet}…`;
      }
      results.push({
        doc,
        heading: matchedHeading,
        snippet,
      });
    }
  }
  return results;
}
