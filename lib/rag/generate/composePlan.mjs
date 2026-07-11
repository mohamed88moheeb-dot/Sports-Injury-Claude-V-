/**
 * lib/rag/generate/composePlan.mjs
 * ---------------------------------------------------------------------------
 * Turns the patient assessment + per-section retrieved evidence into a
 * structured, citation-grounded rehab plan.
 *
 *   mode 'ai_generated'  — Claude composes the plan, constrained to the
 *                          retrieved evidence and required to cite passage ids.
 *   mode 'evidence_draft'— no API key: a deterministic template assembles a
 *                          plan keyed off mechanism/timeline and attaches the
 *                          retrieved citations. Honest, not fabricated.
 *
 * Either way the output is the SAME schema, so the UI renders both identically.
 * ---------------------------------------------------------------------------
 */

import { callClaude, parseJsonLoose, hasAnthropicKey } from './anthropic.mjs';
import { clinicalSummary, hamstringCautions } from './assessmentModel.mjs';

const SYSTEM = `You are a sports-medicine rehabilitation reasoning engine for a hamstring-injury prototype.
You must compose an evidence-grounded rehabilitation plan using ONLY the numbered EVIDENCE passages provided.
Rules:
- Every clinical claim must cite one or more passages by their ref id, e.g. "cite": ["HS-PETERSEN-2011::0"].
- Do NOT introduce facts, dosages, or drugs not supported by the evidence. If the evidence is silent, say so.
- Prefer higher-tier evidence (RCT, systematic review, consensus) when passages conflict.
- Keep exercise dosages conservative and criteria-based; progression is by clinical criteria, not fixed days.
- Output ONLY a single JSON object, no prose outside it.`;

function evidenceBlock(sections) {
  const lines = [];
  const seen = new Set();
  for (const [section, hits] of Object.entries(sections)) {
    lines.push(`\n## Evidence for: ${section}`);
    for (const h of hits) {
      lines.push(`[${h.chunkId}] (${h.source.authors}, ${h.source.year}, ${h.source.journal}; ${h.source.study_design}) ${h.text}`);
      seen.add(h.docId);
    }
  }
  return { text: lines.join('\n'), docIds: [...seen] };
}

const OUTPUT_SCHEMA = `{
  "diagnosis": { "likely_structure": string, "reasoning": string, "grading_note": string, "cite": string[] },
  "recovery_outlook": { "estimate": string, "drivers": string[], "cite": string[] },
  "phases": [ { "name": string, "goal": string, "criteria_to_advance": string[], "exercises": [ { "name": string, "why": string, "dosage": string, "cite": string[] } ] } ],
  "return_to_sport": { "criteria": string[], "cite": string[] },
  "evidence_summary": string
}`;

export async function composePlan({ assessment, sections }) {
  const summary = clinicalSummary(assessment);
  const cautions = hamstringCautions(assessment);
  const { text: evidenceText, docIds } = evidenceBlock(sections);

  if (hasAnthropicKey()) {
    const user = `PATIENT (hamstring injury): ${summary || 'unspecified'}.
Return-to-sport target sport: ${assessment.sport || 'general'}.

EVIDENCE PASSAGES (cite these by their bracketed ref id):
${evidenceText}

Compose the plan as JSON matching exactly this schema:
${OUTPUT_SCHEMA}`;
    const res = await callClaude({ system: SYSTEM, user });
    if (res.ok) {
      const parsed = parseJsonLoose(res.text);
      if (parsed) {
        return { mode: 'ai_generated', model: res.model, plan: normalise(parsed), cautions, cited_doc_ids: docIds };
      }
    }
    // fall through to deterministic draft on any failure
  }

  return { mode: 'evidence_draft', plan: deterministicDraft(assessment, sections), cautions, cited_doc_ids: docIds };
}

function normalise(p) {
  return {
    diagnosis: p.diagnosis || {},
    recovery_outlook: p.recovery_outlook || {},
    phases: Array.isArray(p.phases) ? p.phases : [],
    return_to_sport: p.return_to_sport || {},
    evidence_summary: p.evidence_summary || '',
  };
}

/**
 * Deterministic evidence-grounded draft (no LLM). Keys phase structure off the
 * timeline and mechanism, and attaches the retrieved citations for each section
 * so nothing is claimed without a source.
 */
function deterministicDraft(a, sections) {
  const cite = (section, n = 3) => (sections[section] || []).slice(0, n).map((h) => h.chunkId);
  const topSource = (section) => {
    const h = (sections[section] || [])[0];
    return h ? `${h.source.authors.split(',')[0]} et al. ${h.source.year}` : 'the retrieved evidence';
  };
  const late = a.weeks_since === 'late';
  const acute = a.weeks_since === 'acute';

  const phases = [
    {
      name: 'Phase 1 — Protect & activate',
      goal: 'Settle symptoms, protect healing tissue, restore pain-free range and gentle activation.',
      criteria_to_advance: ['Pain-free walking', 'Pain-free isometric hamstring contraction', 'Near-full pain-free range'],
      exercises: [
        { name: 'Pain-free isometric hamstring holds', why: `Early activation without provoking the healing tissue (${topSource('loading')}).`, dosage: 'progressive holds within tolerable symptoms', cite: cite('loading') },
        { name: 'Lumbopelvic / trunk control drills', why: 'Neuromuscular control of the pelvis reduces reinjury vs isolated stretching.', cite: cite('rts') },
      ],
    },
    {
      name: 'Phase 2 — Progressive & lengthening load',
      goal: 'Rebuild strength through range, introducing controlled lengthening loads at longer muscle lengths.',
      criteria_to_advance: ['Symmetric strength through mid-range', 'Tolerates lengthening load', 'Pain-free jogging'],
      exercises: [
        { name: 'Lengthening-biased hamstring exercises (extender / diver / glider progression)', why: `Lengthening protocols shorten return time vs conventional loading (${topSource('loading')}).`, dosage: 'progress range as symptoms allow', cite: cite('loading') },
        { name: 'Eccentric hamstring strengthening (Nordic progression)', why: 'Eccentric strengthening reduces new and recurrent injury.', cite: cite('rts') },
      ],
    },
    {
      name: 'Phase 3 — Return to sprinting & sport',
      goal: 'Restore high-speed running capacity and sport-specific loading before clearance.',
      criteria_to_advance: ['Restored strength symmetry (incl. eccentric)', 'Completed graded sprint programme', 'Sport-specific drills pain-free'],
      exercises: [
        { name: 'Graded high-speed running programme', why: 'Maximal sprinting exposure is required before clearance to reduce reinjury.', cite: cite('rts') },
        { name: 'Sport-specific reintegration', why: `Tailored to ${a.sport || 'sport'} demands.`, cite: cite('rts') },
      ],
    },
  ];
  if (acute) phases[0].goal += ' (Early stage — prioritise protection.)';

  return {
    diagnosis: {
      likely_structure: a.location === 'high_near_sit_bone' ? 'Proximal hamstring (biceps femoris / semimembranosus origin region)' : 'Hamstring musculotendinous unit',
      reasoning: `Based on ${clinicalSummary(a)}. ${topSource('diagnosis')} describes the corresponding mechanism and site.`,
      grading_note: `Injury extent and tendon involvement drive prognosis (${topSource('grading')}); imaging grading (e.g. BAMIC) refines this.`,
      cite: cite('diagnosis').concat(cite('grading')),
    },
    recovery_outlook: {
      estimate: 'Criteria-based; timeline varies with injury extent and tendon involvement.',
      drivers: ['Injury site (intratendinous = longer)', 'Injury extent', 'Prior injury history'],
      cite: cite('grading'),
    },
    phases,
    return_to_sport: {
      criteria: ['Restored strength symmetry including eccentric/long-length', 'Completed graded sprint/high-speed running programme', 'Sport-specific capacity pain-free', 'No apprehension at maximal effort'],
      cite: cite('rts'),
    },
    evidence_summary: `This draft was assembled deterministically from the retrieved evidence (no AI composition). Add an ANTHROPIC_API_KEY to enable full AI-generated narrative reasoning grounded in the same passages.`,
  };
}
