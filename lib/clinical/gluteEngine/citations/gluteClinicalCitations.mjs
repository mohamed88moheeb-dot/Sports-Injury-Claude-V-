/**
 * lib/clinical/gluteEngine/citations/gluteClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the glutes engine. Verified via live web/PubMed
 * lookups in this session (July 2026) — titles, journals, years, PMIDs and
 * DOIs confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const GLUTE_CITATIONS = Object.freeze({
  'GLUTE-CIT-001': {
    id: 'GLUTE-CIT-001',
    short: 'Grimaldi & Fearon 2015',
    title: 'Gluteal Tendinopathy: Integrating Pathomechanics and Clinical Features in Its Management',
    journal: 'J Orthop Sports Phys Ther',
    year: 2015,
    pmid: '26381486',
    doi: '10.2519/jospt.2015.5829',
    supports: [
      'gluteal tendinopathy (gluteus medius/minimus) is now understood as the primary source of most lateral hip pain previously labelled "trochanteric bursitis" (greater trochanteric pain syndrome, GTPS)',
      'compressive positions/loads (e.g. hip adduction past neutral, deep hip flexion, standing with hip "hitched" out) aggravate gluteal tendinopathy and should be minimised early',
    ],
  },

  'GLUTE-CIT-002': {
    id: 'GLUTE-CIT-002',
    short: 'Mellor 2018 (LEAP)',
    title: 'Education plus exercise versus corticosteroid injection use versus a wait and see approach on global outcome and pain from gluteal tendinopathy: prospective, single blinded, randomised clinical trial',
    journal: 'BMJ',
    year: 2018,
    pmid: '29720374',
    doi: '10.1136/bmj.k1662',
    supports: [
      'education plus a progressive loading exercise programme outperformed corticosteroid injection and a wait-and-see approach for gluteal tendinopathy at 8 weeks',
      'active, education-plus-exercise management is the first-line approach for gluteal tendinopathy',
    ],
  },

  'GLUTE-CIT-003': {
    id: 'GLUTE-CIT-003',
    short: 'Hernando 2015',
    title: 'Deep gluteal syndrome: anatomy, imaging, and management of sciatic nerve entrapments in the subgluteal space',
    journal: 'Skeletal Radiol',
    year: 2015,
    pmid: '25739706',
    doi: '10.1007/s00256-015-2124-6',
    supports: [
      'deep gluteal syndrome describes non-discogenic sciatic nerve entrapment in the subgluteal space, presenting as deep buttock pain often radiating down the leg',
      'this needs its own diagnostic pathway (clinical evaluation + imaging +/- nerve conduction studies) rather than being managed as a simple gluteal muscle strain or tendinopathy',
    ],
  },

  'GLUTE-CIT-004': {
    id: 'GLUTE-CIT-004',
    short: 'Kinsella 2023',
    title: 'Diagnostic Accuracy of Clinical Tests for Assessing Greater Trochanteric Pain Syndrome: A Systematic Review With Meta-analysis',
    journal: 'J Orthop Sports Phys Ther',
    year: 2023,
    pmid: '37561820',
    doi: '10.2519/jospt.2023.11890',
    supports: [
      'greater trochanter palpation combined with a resisted hip abduction test is the recommended clinical test cluster for diagnosing GTPS',
      'single-leg stance held ~30 s and resisted hip abduction both reproduce lateral hip pain in gluteal tendinopathy with high specificity',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = GLUTE_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
