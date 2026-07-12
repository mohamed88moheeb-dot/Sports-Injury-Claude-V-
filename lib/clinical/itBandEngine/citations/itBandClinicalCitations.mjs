/**
 * lib/clinical/itBandEngine/citations/itBandClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the IT band engine. Verified via live web
 * lookups in this session (July 2026) — titles, journals, years, PMIDs and
 * DOIs confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const IT_BAND_CITATIONS = Object.freeze({
  'ITB-CIT-001': {
    id: 'ITB-CIT-001',
    short: 'Fairclough 2006',
    title: 'The functional anatomy of the iliotibial band during flexion and extension of the knee: implications for understanding iliotibial band syndrome',
    journal: 'J Anat',
    year: 2006,
    pmid: '16533314',
    doi: '10.1111/j.1469-7580.2006.00531.x',
    supports: [
      'the iliotibial band is a fixed-tension structure, not a band that slides back and forth over the lateral femoral epicondyle — iliotibial band syndrome is better understood as repeated COMPRESSION of a richly innervated fat pad against the lateral femoral condyle (at ~30 degrees knee flexion) than as "friction"',
      'this reframes management around reducing compressive load (running mechanics, hip control) rather than "stretching out" the band itself',
    ],
  },

  'ITB-CIT-002': {
    id: 'ITB-CIT-002',
    short: 'Fredericson 2000',
    title: 'Hip abductor weakness in distance runners with iliotibial band syndrome',
    journal: 'Clin J Sport Med',
    year: 2000,
    pmid: '10959926',
    doi: '10.1097/00042752-200007000-00004',
    supports: [
      'runners with iliotibial band syndrome showed significant hip abductor (gluteus medius) strength deficits on the affected side compared to the unaffected side and to controls',
      'a 6-week hip-abductor strengthening protocol resolved symptoms in the large majority of runners studied, supporting hip abductor strengthening as core rehab rather than local ITB stretching/foam-rolling alone',
    ],
  },

  'ITB-CIT-003': {
    id: 'ITB-CIT-003',
    short: 'Noehren 2007',
    title: 'ASB Clinical Biomechanics Award Winner 2006: Prospective study of the biomechanical factors associated with iliotibial band syndrome',
    journal: 'Clin Biomech (Bristol, Avon)',
    year: 2007,
    pmid: '17728030',
    doi: '10.1016/j.clinbiomech.2007.07.001',
    supports: [
      'a prospective cohort of female runners who went on to develop iliotibial band syndrome showed significantly greater peak hip adduction and knee internal rotation during running stance BEFORE symptom onset than runners who stayed uninjured',
      'these kinematic patterns (excess hip adduction/knee internal rotation) are prospective risk factors and plausible targets for gait retraining (e.g. cadence, hip control cueing), not just findings correlated after the fact',
    ],
  },

  'ITB-CIT-004': {
    id: 'ITB-CIT-004',
    short: 'Sanchez-Alvarado 2024',
    title: 'Effects of conservative treatment strategies for iliotibial band syndrome on pain and function in runners: a systematic review',
    journal: 'Front Sports Act Living',
    year: 2024,
    pmid: '39247485',
    doi: '10.3389/fspor.2024.1386456',
    supports: [
      'across 13 studies (201 participants, 5 RCTs), hip abductor strengthening — alone or combined with manual therapy/shockwave — was the most consistently effective conservative approach for reducing pain and improving function in runners with iliotibial band syndrome',
      'supports a structured, progressive hip-and-running-capacity rehab programme as first-line management over passive/local-only treatment',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = IT_BAND_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
