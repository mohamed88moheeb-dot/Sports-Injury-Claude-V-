/**
 * lib/clinical/lowerBackEngine/citations/lowerBackClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the lower back engine. Verified via live web
 * lookups in this session (July 2026) — titles, journals, years, PMIDs and
 * DOIs confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const LOWER_BACK_CITATIONS = Object.freeze({
  'LB-CIT-001': {
    id: 'LB-CIT-001',
    short: 'O\'Sullivan 2005',
    title: 'Diagnosis and classification of chronic low back pain disorders: maladaptive movement and motor control impairments as underlying mechanism',
    journal: 'Man Ther',
    year: 2005,
    pmid: '16154380',
    doi: '10.1016/j.math.2005.07.001',
    supports: [
      'the foundational mechanism-based classification system for non-specific chronic low back pain — most cases (~85%) have no specific pathoanatomical diagnosis and are instead classified by movement/motor-control-impairment pattern (e.g. flexion-related, extension-related)',
      'active, movement/behaviour-targeted management is the appropriate approach for this large non-specific subgroup, rather than treating it as a single undifferentiated condition',
    ],
  },

  'LB-CIT-002': {
    id: 'LB-CIT-002',
    short: 'Dionne 2019',
    title: 'What is the diagnostic accuracy of red flags related to cauda equina syndrome (CES), when compared to Magnetic Resonance Imaging (MRI)? A systematic review',
    journal: 'Musculoskelet Sci Pract',
    year: 2019,
    pmid: '31132655',
    doi: '10.1016/j.msksp.2019.05.004',
    supports: [
      'pooled across 7 studies (n=569), individual cauda equina red flags (saddle anaesthesia, bladder/bowel dysfunction, bilateral leg pain) have low-to-moderate sensitivity but higher specificity — meaning their PRESENCE should reliably trigger urgent workup, even though their absence cannot fully rule out cauda equina syndrome',
      'saddle anaesthesia had the best overall diagnostic value and bilateral leg pain the highest sensitivity among the red flags studied',
    ],
  },

  'LB-CIT-003': {
    id: 'LB-CIT-003',
    short: 'Thornton 2021',
    title: 'Treating low back pain in athletes: a systematic review with meta-analysis',
    journal: 'Br J Sports Med',
    year: 2021,
    pmid: '33355180',
    doi: '10.1136/bjsports-2020-102723',
    supports: [
      'across 14 RCTs in 541 athletes, exercise was the most frequently investigated and generally effective non-pharmacological treatment for reducing pain and improving function in athletes with low back pain',
      'supports a structured, progressive exercise-based rehabilitation approach as first-line management for low back pain in athletes (note: no included trial reported return-to-sport outcomes specifically, so RTS timelines here remain a beta estimate, not an evidence-graded figure)',
    ],
  },

  'LB-CIT-004': {
    id: 'LB-CIT-004',
    short: 'Benoist 2002',
    title: 'The natural history of lumbar disc herniation and radiculopathy',
    journal: 'Joint Bone Spine',
    year: 2002,
    pmid: '12027305',
    doi: '10.1016/S1297-319X(02)00385-8',
    supports: [
      'most radiculopathy caused by a herniated disc heals spontaneously without surgery, often via disc resorption',
      'the clinical course is variable — some cases settle within 1-2 weeks, others take many months — supporting a conservative trial of care with review if progress stalls, rather than a fixed short healing clock',
    ],
  },

  'LB-CIT-005': {
    id: 'LB-CIT-005',
    short: 'El Melhat 2024',
    title: 'Non-Surgical Approaches to the Management of Lumbar Disc Herniation Associated with Radiculopathy: A Narrative Review',
    journal: 'J Clin Med',
    year: 2024,
    pmid: '38398287',
    doi: '10.3390/jcm13040974',
    supports: [
      'non-surgical management — patient education, directional-preference exercise (e.g. the McKenzie method), neural mobilisation, and graded exercise therapy — is the preferred first-line approach for lumbar disc herniation with radiculopathy in the absence of red flags',
      'directional-preference exercises that centralise leg symptoms (move them back toward the spine) are a core early strategy',
    ],
  },

  'LB-CIT-006': {
    id: 'LB-CIT-006',
    short: 'Goetzinger 2020',
    title: 'Spondylolysis in Young Athletes: An Overview Emphasizing Nonoperative Management',
    journal: 'J Sports Med (Hindawi)',
    year: 2020,
    pmid: '32047822',
    doi: '10.1155/2020/9235958',
    supports: [
      'spondylolysis (a pars interarticularis stress injury) is common in young athletes in sports with repetitive hyperextension/rotation loading, and the large majority are managed successfully without surgery once accurately diagnosed with imaging',
      'a structured period of activity modification/bracing followed by a progressive physical therapy programme allows most young athletes to return to full sport participation — but imaging confirmation is needed before starting a guided loading programme',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = LOWER_BACK_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
