#!/usr/bin/env node
//
// qmd-mcp-proof.mjs — prove the MultiAgentOS "brain" is a standalone MCP service.
//
// Phase 9 · 0a renforcée, principle 4 ("the brain is a service (MCP), decoupled
// from the cockpit"). This script is a minimal MCP CLIENT — it speaks JSON-RPC
// 2.0 over the qmd MCP server's stdio transport, OUTSIDE the worker, and calls the
// `query` tool. A successful result proves any agent / app / future Jarvis can
// reach the same brain through a stable API, not just the cockpit.
//
// Run: node scripts/qmd-mcp-proof.mjs ["natural language query"]
// Exit 0 with at least one hit = proof passes; non-zero = MCP unreachable/empty.
//
// Newline-delimited JSON-RPC is the MCP stdio framing (one message per line).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUERY = process.argv[2] ?? 'how do I avoid forgetting things between work sessions';
const TIMEOUT_MS = 120_000; // first call warms the ~4.4 GB models

// Resolve qmd to an absolute path so spawn doesn't search PATH at exec time
// (javascript:S4036 — PATH may hold writable dirs). Falls back to the bare name.
function resolveExecutable(cmd) {
  if (isAbsolute(cmd)) return cmd;
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (dir && existsSync(join(dir, cmd))) return join(dir, cmd);
  }
  return cmd;
}

const child = spawn(resolveExecutable('qmd'), ['mcp'], { cwd: ROOT, stdio: ['pipe', 'pipe', 'inherit'] });

const pending = new Map();
let buf = '';
child.stdout.on('data', (chunk) => {
  buf += chunk.toString('utf8');
  let nl;
  while ((nl = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // ignore any non-JSON banner lines
    }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve: res, reject: rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    }
  }
});

let nextId = 1;
function rpc(method, params) {
  const id = nextId++;
  const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
  child.stdin.write(payload);
  return new Promise((res, rej) => {
    pending.set(id, { resolve: res, reject: rej });
  });
}

function notify(method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
}

function fail(msg) {
  console.error(`[qmd-mcp-proof] FAIL: ${msg}`);
  child.kill('SIGTERM');
  process.exit(1);
}

const guard = setTimeout(() => fail(`timed out after ${TIMEOUT_MS} ms`), TIMEOUT_MS);

try {
  await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'mas-mcp-proof', version: '0.0.0' },
  });
  notify('notifications/initialized', {});

  const result = await rpc('tools/call', {
    name: 'query',
    arguments: {
      searches: [{ type: 'vec', query: QUERY }],
      limit: 3,
      rerank: false, // skip the rerank LLM — the embedding hit alone proves the path
    },
  });

  clearTimeout(guard);
  const text = (result?.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');

  console.log(`[qmd-mcp-proof] query: "${QUERY}"`);
  console.log(text.slice(0, 800));

  child.kill('SIGTERM');
  if (result?.isError || !text.trim()) {
    fail('MCP query returned no usable result');
  }
  console.log('[qmd-mcp-proof] OK — brain reachable as an MCP service (outside the worker).');
  process.exit(0);
} catch (err) {
  clearTimeout(guard);
  fail(String(err));
}
