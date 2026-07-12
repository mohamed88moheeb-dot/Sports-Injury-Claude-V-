/**
 * lib/clinical/groinEngine/citations/groinClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the adductor/groin engine. Verified via live
 * web/PubMed lookups in this session (July 2026) — titles, journals, years,
 * PMIDs and DOIs confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const GROIN_CITATIONS = Object.freeze({
  'GROIN-CIT-001': {
    id: 'GROIN-CIT-001',
    short: 'Weir 2015 (Doha)',
    title: 'Doha agreement meeting on terminology and definitions in groin pain in athletes',
    journal: 'Br J Sports Med',
    year: 2015,
    doi: '10.1136/bjsports-2015-094869',
    supports: [
      'groin pain in athletes is classified into defined clinical entities: adductor-related, iliopsoas-related, inguinal-related and pubic-related, plus hip-related and other causes',
      'adductor-related groin pain: pain on palpation of the adductor tendons/muscle and pain on resisted adduction testing',
      'inguinal-related (possible hernia) and hip-related presentations need their own diagnostic pathway rather than being treated as adductor-related by default',
    ],
  },

  'GROIN-CIT-002': {
    id: 'GROIN-CIT-002',
    short: 'Holmich 1999',
    title: 'Effectiveness of active physical training as treatment for long-standing adductor-related groin pain in athletes: randomised trial',
    journal: 'Lancet',
    year: 1999,
    pmid: '9989713',
    doi: '10.1016/S0140-6736(98)03340-6',
    supports: [
      'an active training programme targeting adductor strength and coordination (the "Holmich protocol") was highly effective for long-standing adductor-related groin pain (median symptom duration 40 weeks in the trial)',
      'active strengthening outperformed passive physiotherapy without active training',
    ],
  },

  'GROIN-CIT-003': {
    id: 'GROIN-CIT-003',
    short: 'Serner 2015',
    title: 'Diagnosis of Acute Groin Injuries: A Prospective Study of 110 Athletes',
    journal: 'Am J Sports Med',
    year: 2015,
    doi: '10.1177/0363546515585123',
    supports: [
      'adductor muscle injuries are the most common acute groin injury in athletes, followed by iliopsoas and proximal rectus femoris injuries',
      'kicking and change-of-direction are the most common acute-injury mechanisms',
      'a meaningful proportion of clinically diagnosed acute groin injuries show no acute imaging findings — clinical assessment remains central',
    ],
  },

  'GROIN-CIT-004': {
    id: 'GROIN-CIT-004',
    short: 'Reiman 2015',
    title: 'Diagnostic accuracy of clinical tests for the diagnosis of hip femoroacetabular impingement/labral tear: a systematic review with meta-analysis',
    journal: 'Br J Sports Med',
    year: 2015,
    pmid: '25515771',
    doi: '10.1136/bjsports-2014-094302',
    supports: [
      'hip flexion-adduction-internal-rotation provocation (FADIR-type testing) plus mechanical symptoms (clicking/catching) raise suspicion for femoroacetabular impingement or labral pathology',
      'hip-joint-related groin pain needs its own diagnostic/imaging pathway rather than being managed as adductor-related pain',
    ],
  },

  'GROIN-CIT-005': {
    id: 'GROIN-CIT-005',
    short: 'Ishoi 2016',
    title: 'Large eccentric strength increase using the Copenhagen Adduction exercise in football: A randomized controlled trial',
    journal: 'Scand J Med Sci Sports',
    year: 2016,
    doi: '10.1111/sms.12585',
    supports: [
      'an 8-week progressive Copenhagen Adduction exercise programme produced a ~36% increase in eccentric hip-adduction strength in footballers',
      'the Copenhagen Adduction exercise is a validated, widely used eccentric adductor-strengthening exercise for both rehab and prevention',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = GROIN_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
