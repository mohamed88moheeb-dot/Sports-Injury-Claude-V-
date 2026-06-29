/**
 * lib/clinical/kneeEngine/citations/kneeClinicalCitations.mjs
 * ---------------------------------------------------------------------------
 * Citable evidence base for the knee engine. Every clinical claim references one
 * of these by id. Sourced via PubMed (June 2026); see ../RESEARCH.md for the
 * full synthesis with per-claim attribution. References only — no dosage or
 * clearance authority. All engine numbers remain beta_default + clinician review.
 * ---------------------------------------------------------------------------
 */

export const KNEE_CITATIONS = Object.freeze({
  'KNEE-CIT-001': { id: 'KNEE-CIT-001', short: 'Duong 2023', title: 'Evaluation and Treatment of Knee Pain: A Review', journal: 'JAMA', year: 2023, pmid: '37874571', doi: '10.1001/jama.2023.19675',
    supports: ['OA dx ~95% sens age>=45 + <=30min stiffness', 'PFPS: squat pain ~91% sens / 50% spec', 'meniscus: McMurray 61/84, joint-line 83/83', 'conservative exercise first-line for OA/PFPS/meniscus', 'degenerative meniscal tear: surgery not indicated even with mechanical symptoms'] },
  'KNEE-CIT-002': { id: 'KNEE-CIT-002', short: 'Filbay 2025', title: 'No Difference in Return-to-Sport: ACL Reconstruction vs Rehabilitation Alone (SR/MA)', journal: 'Sports Med', year: 2025, pmid: '40603829', doi: '10.1007/s40279-025-02268-5',
    supports: ['no difference in RTS rate ACLR vs rehab alone', 'rehabilitation is a legitimate primary ACL pathway', 'surgery-for-RTS belief not supported'] },
  'KNEE-CIT-003': { id: 'KNEE-CIT-003', short: 'Zhao 2022', title: 'Risk Factors for Revision or Rerupture After ACL Reconstruction (SR/MA)', journal: 'Am J Sports Med', year: 2022, pmid: '36189967', doi: '10.1177/03635465221119787',
    supports: ['re-rupture risk: younger age, male, family history, return to high-level sport, concomitant MCL, allograft, smaller graft'] },
  'KNEE-CIT-004': { id: 'KNEE-CIT-004', short: 'Wells 2021', title: 'Meniscal Injuries: Mechanism and Classification', journal: 'Sports Med Arthrosc Rev', year: 2021, pmid: '34398118', doi: '10.1097/JSA.0000000000000311',
    supports: ['vascular-zone classification (red-red heals, white-white poor)', 'meniscal repair superior to partial meniscectomy long-term'] },
  'KNEE-CIT-005': { id: 'KNEE-CIT-005', short: 'Nascimento 2017', title: 'Hip and Knee Strengthening More Effective Than Knee Alone for PFPS (SR/MA)', journal: 'J Orthop Sports Phys Ther', year: 2017, pmid: '29034800', doi: '10.2519/jospt.2018.7365',
    supports: ['hip+knee strengthening superior to knee alone for PFPS pain/activity', 'benefit without measured strength change (motor-control/load mechanism)'] },
  'KNEE-CIT-006': { id: 'KNEE-CIT-006', short: 'Balcarek 2025 (ESSKA)', title: 'Management of First-Time Patellar Dislocation: ESSKA 2024 Consensus Part 2', journal: 'Knee Surg Sports Traumatol Arthrosc', year: 2025, pmid: '40053919', doi: '10.1002/ksa.12637',
    supports: ['physical therapy essential for operative + non-operative FTPD', 'bracing no clear long-term benefit', 'MPFL reconstruction preferred over repair when surgery indicated', 'recurrence risk: trochlear dysplasia, patella alta, TT-TG, skeletal immaturity'] },
  'KNEE-CIT-007': { id: 'KNEE-CIT-007', short: 'Koh 2014', title: 'Patellar instability', journal: 'Clin Sports Med', year: 2014, pmid: '24993410', doi: '10.1016/j.csm.2014.03.011',
    supports: ['first-time dislocation often managed non-operatively', '>1 dislocation significantly increases recurrence risk'] },
  'KNEE-CIT-008': { id: 'KNEE-CIT-008', short: 'Kolasinski 2020 (ACR)', title: '2019 ACR/Arthritis Foundation Guideline for Management of OA (Hand, Hip, Knee)', journal: 'Arthritis Care Res', year: 2020, pmid: '31908149', doi: '10.1002/acr.24131',
    supports: ['strong rec: exercise, weight loss if overweight, self-management for knee OA', 'tibiofemoral bracing, topical/oral NSAIDs, IA glucocorticoid'] },
  'KNEE-CIT-009': { id: 'KNEE-CIT-009', short: 'van Doormaal 2020 (KNGF)', title: 'Clinical Practice Guideline for Physical Therapy in Hip/Knee OA', journal: 'Musculoskeletal Care', year: 2020, pmid: '32643252', doi: '10.1002/msc.1492',
    supports: ['tailored, adequately-dosed exercise + education + self-management', 'four treatment profiles by supervision need'] },
  'KNEE-CIT-010': { id: 'KNEE-CIT-010', short: 'van der Worp 2012', title: 'Iliotibial Band Syndrome in Runners: A Systematic Review', journal: 'Sports Med', year: 2012, pmid: '22994651', doi: '10.2165/11635400-000000000-00000',
    supports: ['ITBS most common lateral knee injury in runners (5-14%)', 'manage with load modification, hip strengthening, running-form changes'] },
  'KNEE-CIT-011': { id: 'KNEE-CIT-011', short: 'Circi 2017', title: 'Treatment of Osgood-Schlatter Disease: Review', journal: 'Musculoskelet Surg', year: 2017, pmid: '28593576', doi: '10.1007/s12306-017-0479-7',
    supports: ['OSD self-limiting tibial-tubercle apophysitis from extensor traction', 'symptomatic + activity-modification management; resolves at skeletal maturity'] },
  'KNEE-CIT-012': { id: 'KNEE-CIT-012', short: 'Elkin 2019', title: 'Combined ACL and MCL Knee Injuries: Anatomy, Diagnosis, Management, RTS', journal: 'Curr Rev Musculoskelet Med', year: 2019, pmid: '30929138', doi: '10.1007/s12178-019-09549-3',
    supports: ['grade I-II MCL heal well non-operatively', 'combined ACL+MCL: reconstruct ACL, treat low-grade MCL conservatively'] },
  // Criteria-based return (shared with quad engine evidence)
  'KNEE-CIT-013': { id: 'KNEE-CIT-013', short: 'Nawasreh 2016', title: 'Return-to-Activity Criteria After ACLR Predict Outcomes', journal: 'Am J Sports Med', year: 2016, pmid: '28125899', doi: '10.1177/0363546516680619',
    supports: ['criteria battery (quad strength index + 4 hop tests + PRO) >=90% LSI predicts better outcomes'] },
  'KNEE-CIT-014': { id: 'KNEE-CIT-014', short: 'Thompson 2022', title: 'Disagreement Between Strength and Hop Tests After ACLR', journal: 'Am J Sports Med', year: 2022, pmid: '35604342', doi: '10.1177/03635465221097712',
    supports: ['hop symmetry can mask quad strength deficits — use strength AND hop tests for return decisions'] },
});

export function cite(id) {
  const c = KNEE_CITATIONS[id];
  if (!c) return { id, short: id, doi: null, missing: true };
  return { id: c.id, short: c.short, title: c.title, doi: c.doi, pmid: c.pmid, url: c.doi ? `https://doi.org/${c.doi}` : null };
}
export function citeAll(ids = []) { return ids.map(cite); }
