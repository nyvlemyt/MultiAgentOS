export {
  FtsRetriever,
  toMatchExpr,
  ensureIndexed,
  type MemoryRetriever,
  type MemoryDoc,
  type MemoryHit,
  type MemoryScope,
  type MemoryQueryOpts,
  type IndexableCorpus,
} from './retriever';
export {
  MemoryStore,
  MemoryWriteForbiddenError,
  MEMORY_KEEPER_AGENT,
  GLOBAL_PROJECT,
  promoteCandidate,
  type RegisterKind,
  type RegisterEntry,
  type NewEntry,
  type MemoryStoreOpts,
} from './registers';
export {
  captureCandidates,
  CAPTURE_DECISION,
  type CaptureCandidate,
  type CandidateType,
} from './capture';
export { runCloseOutRitual, AUTO_CAPTURE_EVENT, type RitualResult } from './auto-capture';
export {
  intakeSource,
  IntakeSecurityError,
  type SourceKind,
  type IntakeSourceInput,
  type IntakeOpts,
  type IntakeResult,
} from './intake';
export {
  classifyCandidate,
  classifyByRulesOnly,
  type ClassifierInput,
  type ClassifierDecision,
  type ClassifierOpts,
  type LlmFallbackInfo,
} from './classifier';
export { seedGlobalKnowledge, type SeedResult } from './seed';
export { buildMemoryContext, MAX_GLOBAL_ITEMS, type MemoryContext } from './context';
