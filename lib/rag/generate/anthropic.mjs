/**
 * lib/rag/generate/anthropic.mjs
 * ---------------------------------------------------------------------------
 * Thin, dependency-free client for the Anthropic Messages API. Key-optional:
 * if ANTHROPIC_API_KEY is absent the pipeline degrades gracefully to a
 * deterministic, evidence-only draft (see composePlan.mjs). api.anthropic.com
 * is reachable from this environment (it is on the proxy allowlist), so the
 * only thing needed to switch on full AI composition is the env var.
 * ---------------------------------------------------------------------------
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.RAG_MODEL || 'claude-sonnet-5';

export function hasAnthropicKey() {
  return typeof process.env.ANTHROPIC_API_KEY === 'string' && process.env.ANTHROPIC_API_KEY.length > 10;
}

/**
 * Call Claude with a system prompt + user content, requesting JSON output.
 * @returns {Promise<{ok:boolean, text?:string, error?:string, model?:string}>}
 */
export async function callClaude({ system, user, maxTokens = 2400, temperature = 0.2 }) {
  if (!hasAnthropicKey()) return { ok: false, error: 'no_api_key' };
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `anthropic_${res.status}`, detail: body.slice(0, 400) };
    }
    const data = await res.json();
    const text = (data.content || []).map((b) => b.text || '').join('').trim();
    return { ok: true, text, model: data.model || DEFAULT_MODEL };
  } catch (e) {
    return { ok: false, error: 'network_error', detail: String(e).slice(0, 300) };
  }
}

/** Extract the first JSON object from a model response (tolerant of prose/fences). */
export function parseJsonLoose(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(candidate.slice(start, end + 1)); }
  catch { return null; }
}
