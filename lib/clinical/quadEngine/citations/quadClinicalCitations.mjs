/**
 * lib/clinical/quadEngine/citations/quadClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the quad engine. Every clinical claim the engine
 * makes references one of these by id. Sourced via PubMed (June 2026); see
 * ../RESEARCH.md for the full synthesis and per-claim attribution.
 *
 * These are REFERENCES ONLY. They carry no dosage or clearance authority.
 * Nothing here is evidence-graded prescription; all engine numbers remain
 * beta_default + requires_clinician_review.
 * ---------------------------------------------------------------------------
 */

export const QUAD_CITATIONS = Object.freeze({
  // ── Muscle strain / anterior-thigh management ───────────────────────────
  'QUAD-CIT-001': {
    id: 'QUAD-CIT-001',
    short: 'Lempainen 2022',
    title: 'Management of anterior thigh injuries in soccer players: practical guide',
    journal: 'BMC Sports Sci Med Rehabil',
    year: 2022,
    pmid: '35303927',
    doi: '10.1186/s13102-022-00428-y',
    supports: [
      'quad injuries 3rd most common muscle group in soccer; 5% of all injuries',
      'vastii (VI/VL/VM) most affected in direct contusion',
      'contusion severity by knee-flexion ROM (>50% mild / 30-50% mod / <30% severe)',
      'contusion prognosis mild 2-5 d, severe 20-25+ d; re-assess at 24 h',
      '3-phase muscle healing: inflammation 1-3 d, regeneration 3-4 wk, remodel 3-6 mo',
      'PRICE -> pain-free stretch + isometric/eccentric -> gym -> field',
      'myositis ossificans: minimise hematoma, restore ROM, avoid aggressive early physio',
      'distal quad/patellar tendon total ruptures require operative treatment',
    ],
  },

  'QUAD-CIT-002': {
    id: 'QUAD-CIT-002',
    short: 'Kary 2010',
    title: 'Diagnosis and management of quadriceps strains and contusions',
    journal: 'Curr Rev Musculoskelet Med',
    year: 2010,
    pmid: '21063497',
    doi: '10.1007/s12178-010-9064-5',
    supports: [
      'clinical assessment of quad strains vs contusions',
      'return-to-sport criteria after quad injury',
      'myositis ossificans risk factors, prevention, treatment',
    ],
  },

  // ── Classification (BAMIC) ──────────────────────────────────────────────
  'QUAD-CIT-003': {
    id: 'QUAD-CIT-003',
    short: 'McAleer 2022',
    title: 'Time to return to full training and recurrence of rectus femoris injuries in elite track and field using BAMIC',
    journal: 'Scand J Med Sci Sports',
    year: 2022,
    pmid: '35332596',
    doi: '10.1111/sms.14160',
    supports: [
      'BAMIC grade 0-4 with site a (myofascial) / b (musculotendinous) / c (intratendinous)',
      'class c (intratendinous) injuries have delayed return to full training',
      'grade 3 injuries have increased re-injury rate',
    ],
  },

  'QUAD-CIT-004': {
    id: 'QUAD-CIT-004',
    short: 'Hollabaugh 2025',
    title: 'Application of BAMIC in Collegiate Football Athletes',
    journal: 'Sports Health',
    year: 2025,
    pmid: '40145663',
    doi: '10.1177/19417381251326531',
    supports: [
      'BAMIC applied to quadriceps and hamstring tears in American football',
      'median time to return ~26 days; reinjury rate ~19%',
    ],
  },

  // ── Contusion acute protocol ────────────────────────────────────────────
  'QUAD-CIT-005': {
    id: 'QUAD-CIT-005',
    short: 'Aronen 2006',
    title: 'Quadriceps contusions: clinical results of immediate immobilization in 120 degrees of knee flexion',
    journal: 'Clin J Sport Med',
    year: 2006,
    pmid: '17016112',
    doi: '10.1097/01.jsm.0000244605.34283.94',
    supports: [
      'immediate passive knee flexion to 120 deg held 24 h after contusion',
      'then active pain-free quad stretch + pain-free isometric strengthening',
      'mean return 3.5 d (range 2-5); 1/23 myositis ossificans',
    ],
  },

  'QUAD-CIT-006': {
    id: 'QUAD-CIT-006',
    short: 'Larson 2002',
    title: 'Evaluating and managing muscle contusions and myositis ossificans',
    journal: 'Phys Sportsmed',
    year: 2002,
    pmid: '20086513',
    doi: '10.3810/psm.2002.02.174',
    supports: [
      'warning signs of severe contusion: marked decreased knee ROM + sympathetic effusion',
      'avoid corticosteroids; NSAIDs may reduce MO risk',
      'early flexion exercise hastens recovery and decreases MO likelihood',
    ],
  },

  // ── Tendinopathy loading ────────────────────────────────────────────────
  'QUAD-CIT-007': {
    id: 'QUAD-CIT-007',
    short: 'Rio 2015',
    title: 'Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy',
    journal: 'Br J Sports Med',
    year: 2015,
    pmid: '25979840',
    doi: '10.1136/bjsports-2014-094386',
    supports: [
      'isometric quads contractions give immediate analgesia, sustained >=45 min',
      'isometric reduced single-leg decline squat pain by 6.8/10; increased MVIC 18.7%',
      'mechanism: reduced cortical inhibition',
    ],
  },

  'QUAD-CIT-008': {
    id: 'QUAD-CIT-008',
    short: 'Lim 2018',
    title: 'Effects of isometric, eccentric, or heavy slow resistance exercises on pain and function in patellar tendinopathy: systematic review',
    journal: 'Physiother Res Int',
    year: 2018,
    pmid: '29972281',
    doi: '10.1002/pri.1721',
    supports: [
      'isometric: Grade A, best for in-season short-term pain relief',
      'eccentric: Grade B, long-term pain reduction and function',
      'HSR: Grade C, apply to individual circumstances; long-term benefit',
    ],
  },

  'QUAD-CIT-009': {
    id: 'QUAD-CIT-009',
    short: 'Kongsgaard 2009',
    title: 'Corticosteroid injections, eccentric decline squat training and heavy slow resistance training in patellar tendinopathy',
    journal: 'Scand J Med Sci Sports',
    year: 2009,
    pmid: '19793213',
    doi: '10.1111/j.1600-0838.2009.00949.x',
    supports: [
      'HSR good short- AND long-term clinical effect; increased collagen turnover',
      'eccentric decline squat maintained improvement at follow-up',
      'corticosteroid good short-term but poor long-term; highest satisfaction with HSR',
    ],
  },

  'QUAD-CIT-010': {
    id: 'QUAD-CIT-010',
    short: 'Burton 2022',
    title: 'Interventions for prevention and in-season management of patellar tendinopathy: scoping review',
    journal: 'Phys Ther Sport',
    year: 2022,
    pmid: '35286941',
    doi: '10.1016/j.ptsp.2022.03.002',
    supports: [
      'eccentric, HSR, isometric all feasible and clinically beneficial in-season',
      'single-leg decline squat is the most common loading exercise',
    ],
  },

  'QUAD-CIT-011': {
    id: 'QUAD-CIT-011',
    short: 'Ruffino 2021',
    title: 'Inertial flywheel vs heavy slow resistance training among athletes with patellar tendinopathy: a randomised trial',
    journal: 'Phys Ther Sport',
    year: 2021,
    pmid: '34384941',
    doi: '10.1016/j.ptsp.2021.08.002',
    supports: [
      'inertial flywheel resistance equivalent to HSR at 12 weeks (VISA-P)',
      'flywheel is an alternative loading option for patellar tendinopathy',
    ],
  },

  // ── Tendon rupture (surgical) ───────────────────────────────────────────
  'QUAD-CIT-012': {
    id: 'QUAD-CIT-012',
    short: 'Langenhan 2012',
    title: 'Postoperative functional rehabilitation after repair of quadriceps tendon ruptures: comparison of two protocols',
    journal: 'Knee Surg Sports Traumatol Arthrosc',
    year: 2012,
    pmid: '22307751',
    doi: '10.1007/s00167-012-1887-8',
    supports: [
      'early functional rehab with full weight-bearing is safe after quad tendon repair',
      'not inferior to restrictive immobilisation; no increased complication/re-rupture',
    ],
  },

  'QUAD-CIT-013': {
    id: 'QUAD-CIT-013',
    short: 'Lee 2013',
    title: 'Quadriceps and patellar tendon ruptures',
    journal: 'J Knee Surg',
    year: 2013,
    pmid: '23955186',
    doi: '10.1055/s-0033-1353989',
    supports: [
      'immediate WB with knee locked in extension + crutches post-repair',
      'early limited-arc motion: active flexion + passive extension, advanced progressively',
      'then full active ROM and strengthening; complications: atrophy, stiffness, re-rupture',
    ],
  },

  'QUAD-CIT-014': {
    id: 'QUAD-CIT-014',
    short: 'Ibounig 2015',
    title: 'Etiology, Diagnosis and Treatment of Tendinous Knee Extensor Mechanism Injuries',
    journal: 'Scand J Surg',
    year: 2015,
    pmid: '26271663',
    doi: '10.1177/1457496915598761',
    supports: [
      'rupture usually end-stage of chronic tendon degeneration after eccentric load',
      'delay in surgical repair > 3 weeks -> significantly poorer outcomes',
      'protected full WB + limited passive mobilisation ~6 weeks post-op',
    ],
  },

  // ── Blood flow restriction (early-phase loading) ────────────────────────
  'QUAD-CIT-015': {
    id: 'QUAD-CIT-015',
    short: 'Hughes 2019',
    title: 'Comparing BFR and Traditional Heavy Load Resistance Training in ACLR Post-Surgery Rehabilitation: a UK NHS RCT',
    journal: 'Sports Med',
    year: 2019,
    pmid: '31301034',
    doi: '10.1007/s40279-019-01137-2',
    supports: [
      'BFR resistance training at 30% 1RM matched heavy-load (70% 1RM) for quad hypertrophy and strength',
      'BFR gave greater reduction in knee pain and effusion and better function early post-op',
      'BFR is appropriate for early rehab when heavy load is not tolerated',
    ],
  },

  // ── Criteria-based return to sport ──────────────────────────────────────
  'QUAD-CIT-016': {
    id: 'QUAD-CIT-016',
    short: 'Nawasreh 2016',
    title: 'Do Patients Failing Return-to-Activity Criteria at 6 Months After ACLR Continue Demonstrating Deficits at 2 Years?',
    journal: 'Am J Sports Med',
    year: 2016,
    pmid: '28125899',
    doi: '10.1177/0363546516680619',
    supports: [
      'criteria battery: quad strength index + 4 single-leg hop tests + patient-reported, all >=90% LSI',
      'passing the criteria battery predicts better function and higher return rates at 12-24 months',
    ],
  },

  'QUAD-CIT-017': {
    id: 'QUAD-CIT-017',
    short: 'Thompson 2022',
    title: 'Disagreement in Pass Rates Between Strength and Performance Tests in Patients Recovering From ACLR',
    journal: 'Am J Sports Med',
    year: 2022,
    pmid: '35604342',
    doi: '10.1177/03635465221097712',
    supports: [
      'hop-test symmetry can be passed despite failing quad strength testing (movement compensation)',
      'use BOTH strength and hop testing for return decisions, not hop symmetry alone',
    ],
  },
});

/** Resolve a citation id to a compact display object. */
export function cite(id) {
  const c = QUAD_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi, pmid: c.pmid, url: c.doi ? `https://doi.org/${c.doi}` : null };
}

/** Resolve an array of citation ids. */
export function citeAll(ids = []) {
  return ids.map(cite);
}
