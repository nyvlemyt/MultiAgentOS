// Root runs (`pnpm test:coverage`, the 6th verification check) must reproduce the
// semantics of `pnpm -r test`, where every package is its own vitest project with
// its own config. Without this workspace the root runner flattened all packages
// into ONE project: per-package `env` pins were dropped (packages/agents pins
// MAS_RETRIEVAL_BACKEND=fts) and env mutations leaked across files, so dispatch-*
// and retriever tests failed under the root runner only. Coverage still aggregates
// from the root config.
export default ['packages/*'];
