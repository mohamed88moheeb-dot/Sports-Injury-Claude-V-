/**
 * lib/clinical/hamstringEngine/index.mjs
 * ---------------------------------------------------------------------------
 * Hamstring engine orchestrator (hybrid: deterministic clinical core + RAG).
 *
 *   input -> diagnoseHamstring (accurate, deterministic)
 *         -> buildHamstringPlan (staged, evidence-anchored) OR referral
 *         -> RAG retrieval attaches cited evidence to diagnosis / loading / RTS
 *         -> (optional) LLM refines the narrative, grounded in the same evidence
 *
 * The clinical conclusions and plan structure are deterministic and reliable;
 * retrieval supplies provenance; the LLM (only if ANTHROPIC_API_KEY is set)
 * polishes wording. Diagnosis accuracy never depends on the LLM being present.
 * ---------------------------------------------------------------------------
 */

import { diagnoseHamstring, HAMSTRING_ENTITIES } from './diagnosis.mjs';
import { buildHamstringPlan, hamstringRts } from './planBuilder.mjs';
import { HybridRetriever } from '../../rag/retrieve/hybrid.mjs';
import { callClaude, parseJsonLoose, hasAnthropicKey } from '../../rag/generate/anthropic.mjs';

function retrievalQueries(dx, input) {
  return {
    diagnosis: `hamstring ${dx.muscle} ${input.mechanism || ''} mechanism which muscle prognosis recovery`,
    loading: `hamstring rehabilitation progressive lengthening eccentric loading exercise ${dx.entity.includes('tendinopathy') ? 'tendinopathy tendon loading' : 'strain'}`,
    rts: `hamstring return to sport ${input.sport || ''} criteria eccentric strength sprinting reinjury prevention`,
  };
}

async function maybeRefineWithAI(dx, sections) {
  if (!hasAnthropicKey()) return null;
  const ev = Object.entries(sections).flatMap(([s, hits]) =>
    hits.slice(0, 3).map((h) => `[${h.chunkId}] (${h.source.authors}, ${h.source.year}) ${h.text}`)).join('\n');
  const system = `You are a sports-medicine reasoning aid. Refine the diagnosis reasoning and a one-paragraph plan rationale for a hamstring case, using ONLY the evidence passages. Cite passage ids. Do not change the diagnosis label or invent dosages. Output JSON: {"reasoning": string, "plan_rationale": string, "cite": string[]}.`;
  const user = `DIAGNOSIS: ${dx.entity_title}. Muscle: ${dx.muscle}. Band: ${dx.band_label}.\nEVIDENCE:\n${ev}`;
  const res = await callClaude({ system, user, maxTokens: 700 });
  if (res.ok) { const p = parseJsonLoose(res.text); if (p) return { ...p, model: res.model }; }
  return null;
}

/**
 * @param {object} input normalized hamstring input
 * @param {object} opts { index (RAG index json), useAI }
 */
export async function runHamstring(input, { index = null, useAI = true } = {}) {
  const dx = diagnoseHamstring(input);
  const plan = buildHamstringPlan(dx, input);
  const isReferral = plan === null;

  // RAG retrieval (best-effort; engine still works without an index).
  let retrieval = null, evidenceBase = [], sections = {};
  if (index) {
    try {
      const retriever = new HybridRetriever(index);
      const queries = retrievalQueries(dx, input);
      retrieval = {};
      const seen = new Map();
      for (const [section, q] of Object.entries(queries)) {
        const out = retriever.retrieve(q, { topK: 4 });
        sections[section] = out.results;
        retrieval[section] = {
          query: q, confidence: out.retrieval_confidence,
          hits: out.results.map((h) => ({ chunkId: h.chunkId, source: h.source, scores: h.scores, snippet: h.text.slice(0, 200) })),
        };
        for (const h of out.results) {
          if (!seen.has(h.docId)) seen.set(h.docId, { id: h.docId, ...h.source, used_in: [] });
          const e = seen.get(h.docId);
          if (!e.used_in.includes(section)) e.used_in.push(section);
        }
      }
      evidenceBase = [...seen.values()];
    } catch { retrieval = null; }
  }

  const aiRefinement = (useAI && index && !isReferral) ? await maybeRefineWithAI(dx, sections) : null;

  const confs = retrieval ? Object.values(retrieval).map((r) => r.confidence.score) : [];
  const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null;

  return {
    engine: 'hamstring_engine',
    beta_scope: 'hamstring_beta_testing_only',
    clinical_authority: false,
    input,
    diagnosis: {
      entity: dx.entity,
      entity_title: dx.entity_title,
      muscle: dx.muscle,
      reasoning: aiRefinement?.reasoning || dx.reasoning,
      plan_rationale: aiRefinement?.plan_rationale || null,
      band: dx.band, band_label: dx.band_label,
      tendon_involvement: dx.tendon_involvement,
      recovery: dx.recovery, recovery_drivers: dx.recovery_drivers,
      confidence: dx.confidence,
      cite: aiRefinement?.cite || (sections.diagnosis || []).slice(0, 3).map((h) => h.chunkId),
    },
    cautions: dx.cautions,
    flags: dx.flags,
    review_required: dx.review_required,
    autonomous_plan: !isReferral,
    plan,
    rts_readiness: isReferral ? null : hamstringRts(input),
    retrieval,
    evidence_base: evidenceBase,
    overall_confidence: avgConf == null ? null : {
      score: +avgConf.toFixed(3),
      label: avgConf >= 0.66 ? 'well-supported' : avgConf >= 0.4 ? 'moderately supported' : 'limited evidence',
      distinct_sources: evidenceBase.length,
    },
    mode: aiRefinement ? 'ai_refined' : 'deterministic_grounded',
    model: aiRefinement?.model || null,
    disclaimer: 'Prototype: deterministic clinical core + retrieved evidence; not clinically reviewed.',
  };
}

export { HAMSTRING_ENTITIES } from './diagnosis.mjs';
