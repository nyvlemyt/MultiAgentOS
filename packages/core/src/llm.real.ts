// SDK surface verified: @anthropic-ai/claude-agent-sdk@0.3.150 (sdk.d.ts:1931)
//   PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'dontAsk' | 'auto'
//   query() Options.permissionMode?: PermissionMode  (sdk.d.ts:1591)
//   query() Options.cwd?: string                     (sdk.d.ts:1283)
//   query() Options.resume?: string                  (sdk.d.ts:1654)
//   query() Options.systemPrompt?: string | string[] | { type:'preset'; preset:'claude_code'; append?:string }
//                                                    (sdk.d.ts:1865)
//   SDKResultSuccess.usage: NonNullableUsage          (sdk.d.ts:3434)
//     → input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens
//   SDKResultSuccess.total_cost_usd: number           (sdk.d.ts:3433)
//   SDKResultSuccess.session_id: string               (sdk.d.ts:3443)
//   SDKAssistantMessageError includes 'rate_limit'    (sdk.d.ts:2574)
//   Options.env replaces process.env entirely when set (sdk.d.ts:1342)
//     → must strip ANTHROPIC_API_KEY before passing env to subprocess
//
// Decision (ADR 0001 amendments §Q1): SDK exposes all four autonomy-level modes.
// No ShellMissionRunner needed — permissionMode is a flag on the single claudeCodeLLM runner.
//   manual     → 'plan'         (propose-only, no writes)
//   assisted   → 'default'      (prompts for dangerous ops)
//   autonomous → 'acceptEdits'  (auto-accept file edits)
//   autopilot  → 'acceptEdits'  (bypassPermissions withheld — requires explicit user opt-in)
