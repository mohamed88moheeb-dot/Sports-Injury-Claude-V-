/**
 * lib/clinical/calfEngine/citations/calfClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the calf/shin engine. Every clinical claim the
 * engine makes references one of these by id. Verified via live web/PubMed
 * lookups in this session (July 2026) — titles, journals, years, PMIDs and
 * DOIs confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const CALF_CITATIONS = Object.freeze({
  'CALF-CIT-001': {
    id: 'CALF-CIT-001',
    short: 'Green & Pizzari 2017',
    title: 'Calf muscle strain injuries in sport: a systematic review of risk factors for injury',
    journal: 'Br J Sports Med',
    year: 2017,
    pmid: '28259848',
    doi: '10.1136/bjsports-2016-097177',
    supports: [
      'gastrocnemius injuries more prevalent in sprinting/change-of-direction sports; soleus injuries more prevalent in endurance running sports',
      'increasing age and previous calf injury are the most consistent risk factors for calf strain',
    ],
  },

  'CALF-CIT-002': {
    id: 'CALF-CIT-002',
    short: 'Alfredson 1998',
    title: 'Heavy-load eccentric calf muscle training for the treatment of chronic Achilles tendinosis',
    journal: 'Am J Sports Med',
    year: 1998,
    pmid: '9617396',
    supports: [
      'a 12-week heavy-load eccentric calf-loading programme (the "Alfredson protocol") restored pre-injury running levels in chronic Achilles tendinopathy',
      'eccentric/heavy-slow loading is a foundational, first-line treatment for Achilles tendinopathy',
    ],
  },

  'CALF-CIT-003': {
    id: 'CALF-CIT-003',
    short: 'Park 2020',
    title: 'Treatment of Acute Achilles Tendon Rupture',
    journal: 'Clin Orthop Surg',
    year: 2020,
    pmid: '32117532',
    doi: '10.4055/cios.2020.12.1.1',
    supports: [
      'Achilles rupture is primarily a clinical diagnosis (loss of plantarflexion on calf squeeze / Thompson test, palpable gap, inability to single-leg heel raise)',
      'functional, early-motion rehabilitation is central to both surgical and non-surgical management once diagnosed',
      'this is time-critical and needs in-person assessment — not a self-guided starting point',
    ],
  },

  'CALF-CIT-004': {
    id: 'CALF-CIT-004',
    short: 'Winters 2013',
    title: 'Treatment of medial tibial stress syndrome: a systematic review',
    journal: 'Sports Med',
    year: 2013,
    pmid: '23979968',
    doi: '10.1007/s40279-013-0087-0',
    supports: [
      'medial tibial stress syndrome (MTSS) is an overuse periosteal/bone-stress condition of the distal two-thirds of the tibia',
      'management centres on load modification and a graded return to running rather than a fixed muscle/ligament healing clock',
    ],
  },

  'CALF-CIT-005': {
    id: 'CALF-CIT-005',
    short: 'Yates 2020',
    title: 'Medial tibial stress fracture diagnosis and treatment guidelines',
    journal: 'J Sci Med Sport',
    year: 2020,
    pmid: '33298373',
    supports: [
      'MTSS tenderness typically spans a longer segment of the tibial border, whereas focal tenderness over a shorter segment (<10 cm) suggests a stress fracture',
      'a positive single-leg hop test alongside focal tibial tenderness is strongly associated with tibial stress fracture rather than MTSS',
      'suspected stress fracture warrants imaging and load restriction rather than a standard MTSS loading progression',
    ],
  },

  'CALF-CIT-006': {
    id: 'CALF-CIT-006',
    short: 'Green et al 2025',
    title: 'Calf Strains in Athletes: A Narrative Review of Management, Injury Grading, and Return to Sport',
    journal: 'Sports Med Open',
    year: 2025,
    pmid: '41385031',
    doi: '10.1186/s40798-025-00960-4',
    supports: [
      'calf strain injury grading (mild/moderate/severe) and imaging findings inform expected return-to-sport timelines',
      'a criteria-based, graded return-to-running and return-to-sport process is recommended over a fixed timeline',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = CALF_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
