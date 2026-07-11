/**
 * lib/rag/generate/gemini.mjs
 * ---------------------------------------------------------------------------
 * Thin, dependency-free client for Google's Gemini API (Generative Language
 * API). Key-optional: if GEMINI_API_KEY is absent, callers fall back to their
 * deterministic path. Mirrors the shape of lib/rag/generate/anthropic.mjs so
 * either provider can sit behind the same call sites.
 * ---------------------------------------------------------------------------
 */

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export function hasGeminiKey() {
  return typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 10;
}

/**
 * Call Gemini with a system instruction + user content, requesting JSON output.
 * @param {object} opts
 * @param {string} opts.system
 * @param {string} opts.user
 * @param {number} [opts.maxTokens=2400]
 * @param {number} [opts.temperature=0.2]
 * @param {object} [opts.responseSchema]  optional Gemini structured-output schema
 * @returns {Promise<{ok:boolean, text?:string, error?:string, model?:string}>}
 */
export async function callGemini({ system, user, maxTokens = 2400, temperature = 0.2, responseSchema = null }) {
  if (!hasGeminiKey()) return { ok: false, error: 'no_api_key' };
  const url = `${API_BASE}/${DEFAULT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const generationConfig = {
    temperature,
    maxOutputTokens: maxTokens,
    responseMimeType: 'application/json',
    // This client is used for constrained selection/formatting tasks (pick
    // from a given list, fill a schema) — not open-ended reasoning. Gemini's
    // "thinking" tokens are counted against maxOutputTokens but never appear
    // in the returned text; their length varies per call and can silently
    // eat the whole budget, truncating the actual JSON before it completes
    // (verified: identical prompts intermittently failed only when thinking
    // ran long). Disabling it makes output length predictable and reliable.
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (responseSchema) generationConfig.responseSchema = responseSchema;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `gemini_${res.status}`, detail: body.slice(0, 400) };
    }
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
    if (!text) return { ok: false, error: 'empty_response', detail: JSON.stringify(data).slice(0, 300) };
    return { ok: true, text, model: DEFAULT_MODEL };
  } catch (e) {
    return { ok: false, error: 'network_error', detail: String(e).slice(0, 300) };
  }
}

/** Extract the first JSON object/array from a model response (tolerant of fences/prose). */
export function parseJsonLoose(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const objStart = candidate.indexOf('{');
  const arrStart = candidate.indexOf('[');
  const useArr = arrStart !== -1 && (objStart === -1 || arrStart < objStart);
  const start = useArr ? arrStart : objStart;
  const end = useArr ? candidate.lastIndexOf(']') : candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(candidate.slice(start, end + 1)); }
  catch { return null; }
}
