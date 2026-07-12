/**
 * lib/clinical/ankleEngine/citations/ankleClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the ankle engine. Every clinical claim the engine
 * makes references one of these by id. Verified via live PubMed/web lookups
 * in this session (July 2026) — titles, journals, years, PMIDs and DOIs
 * confirmed against the source, not recalled from memory.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const ANKLE_CITATIONS = Object.freeze({
  'ANKLE-CIT-001': {
    id: 'ANKLE-CIT-001',
    short: 'Stiell 1993',
    title: 'Decision rules for the use of radiography in acute ankle injuries. Refinement and prospective validation',
    journal: 'JAMA',
    year: 1993,
    pmid: '8433468',
    supports: [
      'Ottawa Ankle Rules: bone tenderness at posterior edge/tip of malleolus, OR at base of 5th metatarsal / navicular, OR inability to bear weight (4 steps) both immediately and now, indicates need for radiography',
      '~100% sensitivity for clinically significant malleolar-zone fractures',
    ],
  },

  'ANKLE-CIT-002': {
    id: 'ANKLE-CIT-002',
    short: 'Vuurberg 2018',
    title: 'Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline',
    journal: 'Br J Sports Med',
    year: 2018,
    pmid: '29514819',
    doi: '10.1136/bjsports-2017-098106',
    supports: [
      'use Ottawa Ankle Rules to differentiate sprain from fracture and avoid unnecessary radiography',
      'supervised exercise-based functional rehab is preferred over passive modalities/immobilisation for restoring functional joint stability',
      'ankle bracing/taping is effective for preventing recurrent lateral ankle sprains',
    ],
  },

  'ANKLE-CIT-003': {
    id: 'ANKLE-CIT-003',
    short: 'Gribble 2016',
    title: '2016 consensus statement of the International Ankle Consortium: prevalence, impact and long-term consequences of lateral ankle sprains',
    journal: 'Br J Sports Med',
    year: 2016,
    doi: '10.1136/bjsports-2016-096188',
    supports: [
      'lateral ankle sprain is a common precursor to chronic ankle instability (CAI)',
      'CAI presents as recurrent sprains and/or persistent perceived instability ("giving way") beyond the expected acute-healing window',
      'CAI carries a significant long-term functional and reinjury burden if not specifically rehabilitated',
    ],
  },

  'ANKLE-CIT-004': {
    id: 'ANKLE-CIT-004',
    short: 'Kerkhoffs 2007 (Cochrane)',
    title: 'Surgical versus conservative treatment for acute injuries of the lateral ligament complex of the ankle in adults',
    journal: 'Cochrane Database Syst Rev',
    year: 2007,
    doi: '10.1002/14651858.CD000380.pub2',
    supports: [
      'insufficient evidence that surgical repair outperforms conservative (functional) treatment for acute lateral ligament injuries, including higher-grade tears',
      'functional treatment (early mobilisation + external support) is the default first-line pathway; surgery is reserved for cases failing thorough conservative care',
    ],
  },

  'ANKLE-CIT-005': {
    id: 'ANKLE-CIT-005',
    short: 'van Rijn 2008',
    title: 'What is the clinical course of acute ankle sprains? A systematic literature review',
    journal: 'Am J Med',
    year: 2008,
    pmid: '18374692',
    supports: [
      'a meaningful proportion of patients still report pain or subjective instability at 1 year after an acute lateral ankle sprain',
      'recovery is not always complete by the point pain resolves — functional deficits and recurrence risk can persist',
    ],
  },

  'ANKLE-CIT-006': {
    id: 'ANKLE-CIT-006',
    short: 'Williams 2015',
    title: 'High Ankle Sprains and Syndesmotic Injuries in Athletes',
    journal: 'J Am Acad Orthop Surg',
    year: 2015,
    pmid: '26498585',
    supports: [
      'syndesmotic ("high ankle") sprain presents with pain proximal to the joint line and pain through the ankle with each step, distinct from lateral ligament pain',
      'squeeze test and external-rotation stress test are the key clinical screens; anterior syndesmosis tenderness has the highest sensitivity, the squeeze test the highest specificity',
      'nonoperative management is appropriate for syndesmotic sprains without frank diastasis/instability; operative management is reserved for diastasis or associated fracture',
      'syndesmotic sprains generally require a longer recovery than lateral ligament sprains',
    ],
  },

  'ANKLE-CIT-007': {
    id: 'ANKLE-CIT-007',
    short: 'Schiftan 2015',
    title: 'The effectiveness of proprioceptive training in preventing ankle sprains in sporting populations: a systematic review and meta-analysis',
    journal: 'J Sci Med Sport',
    year: 2015,
    pmid: '24831756',
    doi: '10.1016/j.jsams.2014.04.005',
    supports: [
      'proprioceptive/balance training significantly reduces ankle sprain incidence and recurrence in sporting populations',
      'supports balance and neuromuscular-control work as a core, ongoing component of ankle rehab and re-injury prevention',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = ANKLE_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi || null, pmid: c.pmid || null, url: c.doi ? `https://doi.org/${c.doi}` : (c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null) };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
