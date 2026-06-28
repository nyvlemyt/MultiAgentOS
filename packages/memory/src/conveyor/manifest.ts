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
