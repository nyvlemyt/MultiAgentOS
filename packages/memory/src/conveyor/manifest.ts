// Parent/child stage (design spec §5 Brique 6 — LlamaIndex document+nodes model).
// A multi-part source (course, book, multi-chapter PDF) splits along its native structure into
// 1 manifest fiche (shared provenance + a MOC table-of-contents) + N atomic children carrying
// `part_of` + `order`. A 12-lesson course becomes 1 manifest + 12 linked children, never 12 orphans.
import type { Trust } from './extractor';

export interface SourcePart {
  heading: string;
  markdown: string;
}

export interface ManifestInput {
  parentId: string;
  sourceKey: string;
  derivedFrom: string;
  title: string;
  trust: Trust;
  parts: SourcePart[];
}

export interface ManifestNode {
  id: string;
  part_of: string | null;
  order: number | null;
  role: 'manifest' | 'child';
  title: string;
  markdown: string;
  source_key: string;
  derived_from: string;
  trust: Trust;
}

export interface BuildManifestOpts {
  /** Child-id strategy. Default: `${parentId}-${order}`. The real slug allocation happens at promotion. */
  childId?: (parentId: string, order: number, heading: string) => string;
}

/** A source is multi-part (needs a manifest) when it splits into ≥2 native parts. */
export function isMultiPart(parts: SourcePart[]): boolean {
  return parts.length >= 2;
}

const defaultChildId = (parentId: string, order: number): string => `${parentId}-${order}`;

/**
 * Split a multi-part source into [manifest, ...children]. Children get 1-based `order` in source
 * sequence and `part_of=parentId`; the manifest carries `part_of=null`, `order=null`, and a MOC
 * body linking every child. Throws if the source is not multi-part (caller must gate with `isMultiPart`).
 */
export function buildManifest(input: ManifestInput, opts: BuildManifestOpts = {}): ManifestNode[] {
  if (!isMultiPart(input.parts)) {
    throw new Error('buildManifest requires a multi-part source (≥2 parts); gate the call with isMultiPart()');
  }
  const makeId = opts.childId ?? defaultChildId;
  const shared = { source_key: input.sourceKey, derived_from: input.derivedFrom, trust: input.trust };

  const children: ManifestNode[] = input.parts.map((part, i) => {
    const order = i + 1;
    return {
      id: makeId(input.parentId, order, part.heading),
      part_of: input.parentId,
      order,
      role: 'child',
      title: part.heading,
      markdown: part.markdown,
      ...shared,
    };
  });

  const toc = children.map((c) => `${c.order}. [[${c.id}]] — ${c.title}`).join('\n');
  const manifest: ManifestNode = {
    id: input.parentId,
    part_of: null,
    order: null,
    role: 'manifest',
    title: input.title,
    markdown: `# ${input.title}\n\n## Contents\n${toc}`,
    ...shared,
  };

  return [manifest, ...children];
}

export interface FileManifestInput {
  parentId: string;
  title: string;
  trust: Trust;
  derivedFrom: string;
  files: { sourceKey: string; heading: string; markdown: string }[];
}

// split/filter/join on a single char class — no anchored quantifier for S5852 to flag
// (mirror of intake.ts slugify).
function slugifyTitle(title: string): string {
  return title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-');
}

/**
 * Build a matière manifest from N≥2 files (decision A: a folder = one matière). The mother carries
 * `matiere:<slug>` + a MOC; each child keeps its OWN per-file source_key so a single updated file
 * supersedes only its child (keyed idempotence). Throws on <2 files — a single file needs no manifest.
 */
export function buildFileManifest(input: FileManifestInput): ManifestNode[] {
  if (input.files.length < 2) {
    throw new Error('buildFileManifest requires ≥2 files; a single file needs no manifest');
  }
  const nodes = buildManifest({
    parentId: input.parentId,
    sourceKey: `matiere:${slugifyTitle(input.title)}`,
    derivedFrom: input.derivedFrom,
    title: input.title,
    trust: input.trust,
    parts: input.files.map((f) => ({ heading: f.heading, markdown: f.markdown })),
  });
  return nodes.map((n) =>
    n.role === 'child' && n.order != null ? { ...n, source_key: input.files[n.order - 1]!.sourceKey } : n,
  );
}
