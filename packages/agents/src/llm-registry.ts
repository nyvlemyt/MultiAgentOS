import { mockLLM, type LLMClient } from '@mas/core';

let _llm: LLMClient = mockLLM();

export function initLLM(client: LLMClient): void {
  _llm = client;
}

export function getLLM(): LLMClient {
  return _llm;
}
