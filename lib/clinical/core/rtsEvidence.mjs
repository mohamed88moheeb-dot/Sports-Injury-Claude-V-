/**
 * lib/clinical/core/rtsEvidence.mjs
 * ---------------------------------------------------------------------------
 * Curated return-to-sport / sport-participation evidence passages — the
 * "reliable sources" the AI grounding layer (aiParticipation.mjs) reasons
 * over when concluding whether an athlete can keep playing during rehab.
 *
 * Every passage summarises a REAL, verifiable publication and carries its
 * citation. The corpus is deliberately small and curated: the grounding
 * model is only ever allowed to conclude from what is here (and to cite it),
 * never from its own unsourced priors. Retrieval is a deterministic tag
 * filter — with a corpus this size, embeddings would add noise, not recall.
 * ---------------------------------------------------------------------------
 */

export const RTS_EVIDENCE = [
  {
    id: 'RTS-SILBERNAGEL-2007',
    tags: ['overuse', 'tendon', 'tendinopathy', 'achilles', 'calf'],
    text: 'RCT in Achilles tendinopathy: patients who CONTINUED tendon-loading sport during rehab using a pain-monitoring model (pain up to 5/10 allowed during activity, provided it settled by the next morning and did not worsen week to week) recovered as well as those who rested from sport — continued participation within pain-monitoring rules did not impair recovery.',
    cite: { short: 'Silbernagel 2007', title: 'Continued sports activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy: a randomized controlled trial', journal: 'Am J Sports Med', year: 2007, doi: '10.1177/0363546506298279', url: 'https://doi.org/10.1177/0363546506298279' },
  },
  {
    id: 'RTS-MALLIARAS-2015',
    tags: ['overuse', 'tendon', 'tendinopathy', 'patellar', 'knee', 'quad'],
    text: 'Tendinopathy is managed with LOAD MODIFICATION, not rest: complete rest de-conditions the tendon. In-season athletes can often keep training/competing with reduced volume of the provocative load (jumping, sprinting) alongside progressive loading work, guided by the 24-hour pain response.',
    cite: { short: 'Malliaras 2015', title: 'Patellar tendinopathy: clinical diagnosis, load management, and advice for challenging case presentations', journal: 'J Orthop Sports Phys Ther', year: 2015, doi: '10.2519/jospt.2015.5987', url: 'https://doi.org/10.2519/jospt.2015.5987' },
  },
  {
    id: 'RTS-SOLIGARD-2016',
    tags: ['general', 'overuse', 'acute_strain', 'load'],
    text: 'IOC consensus on load and injury risk: injury risk rises with rapid SPIKES in training load, and also after complete rest followed by rapid re-escalation. Managing a problem means adjusting load progressively (volume, intensity, frequency) rather than stopping entirely, and re-building gradually on return.',
    cite: { short: 'Soligard 2016 (IOC consensus)', title: 'How much is too much? (Part 1) International Olympic Committee consensus statement on load in sport and risk of injury', journal: 'Br J Sports Med', year: 2016, doi: '10.1136/bjsports-2016-096581', url: 'https://doi.org/10.1136/bjsports-2016-096581' },
  },
  {
    id: 'RTS-ARDERN-2016',
    tags: ['general', 'acute_strain', 'knee_ligament', 'criteria'],
    text: 'Bern consensus: return to sport is a CONTINUUM — return to participation (modified training), then return to sport, then return to performance — not a binary cleared/not-cleared decision. Progression should be criteria-based (symptoms, strength, function) and load reintroduced stepwise.',
    cite: { short: 'Ardern 2016 (Bern consensus)', title: '2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern', journal: 'Br J Sports Med', year: 2016, doi: '10.1136/bjsports-2016-096278', url: 'https://doi.org/10.1136/bjsports-2016-096278' },
  },
  {
    id: 'RTS-EKSTRAND-2011',
    tags: ['acute_strain', 'hamstring', 'quad', 'calf', 'groin', 'hip_flexor', 'glute'],
    text: 'UEFA injury surveillance (professional football): lay-off after muscle injury is GRADE-dependent — minor/structurally-mild strains commonly return to full training within 1–2 weeks, while moderate structural injuries take several weeks. Time away should match the structural severity, not a fixed protocol length.',
    cite: { short: 'Ekstrand 2011', title: 'Epidemiology of muscle injuries in professional football (soccer)', journal: 'Am J Sports Med', year: 2011, doi: '10.1177/0363546510395879', url: 'https://doi.org/10.1177/0363546510395879' },
  },
  {
    id: 'RTS-POLLOCK-2014',
    tags: ['acute_strain', 'grading', 'hamstring', 'quad', 'calf', 'groin'],
    text: 'British Athletics Muscle Injury Classification: expected recovery and how protected the return needs to be are stratified by injury extent and SITE — myofascial injuries recover fastest, musculotendinous-junction injuries slower, and intratendinous involvement demands the longest, most protected return with the highest re-injury risk if rushed.',
    cite: { short: 'Pollock 2014 (BAMIC)', title: 'British athletics muscle injury classification: a new grading system', journal: 'Br J Sports Med', year: 2014, doi: '10.1136/bjsports-2013-093302', url: 'https://doi.org/10.1136/bjsports-2013-093302' },
  },
  {
    id: 'RTS-GRINDEM-2016',
    tags: ['knee_ligament', 'acl', 'knee', 'criteria'],
    text: 'Delaware-Oslo ACL cohort: re-injury rate fell 51% for EACH MONTH return to pivoting sport was delayed up to 9 months post-injury/surgery, and athletes who failed criteria-based discharge tests (strength and hop symmetry) had substantially higher re-injury rates. Return must be criteria-based, not calendar-based, and not early.',
    cite: { short: 'Grindem 2016', title: 'Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction: the Delaware-Oslo ACL cohort study', journal: 'Br J Sports Med', year: 2016, doi: '10.1136/bjsports-2016-096031', url: 'https://doi.org/10.1136/bjsports-2016-096031' },
  },
  {
    id: 'RTS-FOSTER-2018',
    tags: ['lower_back', 'lbp'],
    text: 'Lancet low back pain series: guidelines consistently recommend STAYING ACTIVE and continuing normal activity (including work and sport) within pain limits; bed rest is discouraged. Most episodes improve substantially within about 6 weeks, and continued activity predicts better outcomes than rest.',
    cite: { short: 'Foster 2018 (Lancet LBP series)', title: 'Prevention and treatment of low back pain: evidence, challenges, and promising directions', journal: 'Lancet', year: 2018, doi: '10.1016/S0140-6736(18)30489-6', url: 'https://doi.org/10.1016/S0140-6736(18)30489-6' },
  },
  {
    id: 'RTS-BLEAKLEY-2010',
    tags: ['ankle', 'acute_strain', 'sprain'],
    text: 'RCT after acute ankle sprain: an accelerated, EXERCISE-BASED rehabilitation starting in the first week improved short-term ankle function versus standard protection — early controlled movement and loading outperform prolonged rest for ligament sprains without instability red flags.',
    cite: { short: 'Bleakley 2010', title: 'Effect of accelerated rehabilitation on function after ankle sprain: randomised controlled trial', journal: 'BMJ', year: 2010, doi: '10.1136/bmj.c1964', url: 'https://doi.org/10.1136/bmj.c1964' },
  },
];

/**
 * Deterministic tag-filter retrieval over the curated corpus.
 * @param {object} args { kind: 'overuse'|'acute_strain'|null, entity?: string, region?: string }
 * @returns {object[]} up to 4 passages, most-specific first
 */
export function retrieveRtsEvidence({ kind = null, entity = '', region = '' } = {}) {
  const needle = `${entity} ${region}`.toLowerCase();
  const scored = RTS_EVIDENCE.map((p) => {
    let score = 0;
    for (const t of p.tags) {
      if (t === kind) score += 2;
      if (t !== 'general' && needle.includes(t)) score += 3;
    }
    if (p.tags.includes('general')) score += 1;
    return { p, score };
  }).filter((e) => e.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((e) => e.p);
}
