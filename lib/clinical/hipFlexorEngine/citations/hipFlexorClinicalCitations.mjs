/**
 * lib/clinical/hipFlexorEngine/citations/hipFlexorClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the hip flexor engine. Verified via live
 * web/PubMed lookups in this session (July 2026) — titles, journals, years,
 * PMIDs and DOIs confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const HIP_FLEXOR_CITATIONS = Object.freeze({
  'HIPFLEX-CIT-001': {
    id: 'HIPFLEX-CIT-001',
    short: 'Weir 2015 (Doha)',
    title: 'Doha agreement meeting on terminology and definitions in groin pain in athletes',
    journal: 'Br J Sports Med',
    year: 2015,
    doi: '10.1136/bjsports-2015-094869',
    supports: [
      'groin pain in athletes is classified into defined clinical entities including iliopsoas-related groin pain, alongside adductor-related, inguinal-related, pubic-related, and hip-related presentations',
      'iliopsoas-related groin pain: pain on resisted hip flexion and/or palpation of the iliopsoas',
    ],
  },

  'HIPFLEX-CIT-002': {
    id: 'HIPFLEX-CIT-002',
    short: 'Walker 2021',
    title: 'Snapping Hip Syndrome: A Comprehensive Update',
    journal: 'Orthop Rev (Pavia)',
    year: 2021,
    pmid: '34745476',
    supports: [
      'internal snapping hip (iliopsoas tendon) presents as deep anterior hip/groin pain, sometimes with an audible/palpable snap, worse with resisted or active hip flexion',
      'most cases resolve with 6-12 months of conservative management: activity modification, physical therapy, and anti-inflammatory strategies',
      'surgical management is reserved for persistent symptoms despite thorough conservative treatment',
    ],
  },

  'HIPFLEX-CIT-003': {
    id: 'HIPFLEX-CIT-003',
    short: 'Manske 2024',
    title: 'The Use of Diagnostic Musculoskeletal Ultrasound for the Evaluation of the Iliopsoas in the Anterior Hip: A Guide for Rehabilitation Providers',
    journal: 'Int J Sports Phys Ther',
    year: 2024,
    pmid: '39628775',
    supports: [
      'iliopsoas strain and iliopsoas tendinopathy/impingement present differently on imaging and have different expected recovery timelines',
      'clinical presentation includes pain with active hip flexion, stair climbing, and sit-to-stand transitions',
      'first-line management is activity modification, iliopsoas stretching, and progressive hip/spinal strengthening',
    ],
  },

  'HIPFLEX-CIT-004': {
    id: 'HIPFLEX-CIT-004',
    short: 'Bernstein 2022',
    title: 'Femoral Neck Stress Fractures: An Updated Review',
    journal: 'J Am Acad Orthop Surg',
    year: 2022,
    pmid: '35077440',
    doi: '10.5435/JAAOS-D-21-00398',
    supports: [
      'femoral neck stress fractures present as insidious anterior groin/hip pain in runners and endurance athletes, classically relieved by rest',
      'a positive single-leg hop test is a key clinical screening sign, present in roughly 70% of cases',
      'this diagnosis is time-critical: missed or delayed diagnosis risks fracture displacement and avascular necrosis, so imaging (MRI) is warranted when suspected rather than continuing a self-guided strengthening programme',
    ],
  },

  'HIPFLEX-CIT-005': {
    id: 'HIPFLEX-CIT-005',
    short: 'Reiman 2015',
    title: 'Diagnostic accuracy of clinical tests for the diagnosis of hip femoroacetabular impingement/labral tear: a systematic review with meta-analysis',
    journal: 'Br J Sports Med',
    year: 2015,
    pmid: '25515771',
    doi: '10.1136/bjsports-2014-094302',
    supports: [
      'hip flexion-adduction-internal-rotation provocation (FADIR-type testing) plus mechanical symptoms (clicking/catching) raise suspicion for femoroacetabular impingement or labral pathology',
      'hip-joint-related pain needs its own diagnostic/imaging pathway rather than being managed as a hip flexor muscle strain',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = HIP_FLEXOR_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
