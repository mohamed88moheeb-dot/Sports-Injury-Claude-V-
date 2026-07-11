/**
 * lib/clinical/hamstringEngine/diagnosis.mjs
 * ---------------------------------------------------------------------------
 * Accurate, deterministic hamstring diagnosis routing. This is the reliable
 * clinical core: mechanism + location + severity signals -> likely injured
 * structure, an estimated severity band (clinical, NOT an MRI grade), a
 * recovery-outlook driver set, and safety cautions. The RAG layer then attaches
 * cited evidence to each conclusion; an optional LLM refines the narrative.
 *
 * Evidence anchors (see lib/rag/corpus/hamstring):
 *  - Heiderscheit 2010: two mechanisms — high-speed running (biceps femoris
 *    long head, proximal MTJ) vs stretch-type (semimembranosus proximal free
 *    tendon, slower recovery). Distance from ischial tuberosity + pain-free
 *    range inform prognosis.
 *  - Pollock/BAMIC 2014: intratendinous (c) involvement worsens prognosis.
 *  - Askling 2013/2014: stretch-type and proximal free-tendon injuries recover
 *    more slowly; lengthening-biased loading shortens return.
 *  - Malliaropoulos 2011 / Ekstrand 2011: prior injury raises reinjury risk.
 * ---------------------------------------------------------------------------
 */

export const HAMSTRING_ENTITIES = {
  SPRINT_BFLH: 'sprint_type_biceps_femoris',
  STRETCH_SM: 'stretch_type_proximal',
  PROXIMAL_TENDINOPATHY: 'proximal_hamstring_tendinopathy',
  PROXIMAL_AVULSION: 'proximal_avulsion_suspected',
  GENERAL_MTJ: 'hamstring_mtj_strain',
};

const ENTITY_TITLES = {
  sprint_type_biceps_femoris: 'Sprint-type hamstring strain (biceps femoris long head)',
  stretch_type_proximal: 'Stretch-type proximal hamstring strain (semimembranosus)',
  proximal_hamstring_tendinopathy: 'Proximal hamstring tendinopathy',
  proximal_avulsion_suspected: 'Suspected proximal hamstring avulsion',
  hamstring_mtj_strain: 'Hamstring musculotendinous strain',
};

const sev = (v) => ({ mild: 1, moderate: 2, severe: 3 }[v] || 0);

/**
 * @param {object} i normalized hamstring input
 * @returns {object} diagnosis routing
 */
export function diagnoseHamstring(i = {}) {
  const cautions = [];
  const flags = [];

  // ---- Safety first: proximal avulsion pattern & non-weight-bearing ----
  const avulsionPattern = i.location === 'high_near_sit_bone' && i.pop_felt === 'yes' && sev(i.pain_severity) >= 3;
  if (avulsionPattern) {
    cautions.push('Proximal pain at the sit-bone with a pop and severe pain can indicate a proximal hamstring tendon avulsion — this needs in-person assessment and likely MRI before loading rehabilitation.');
    flags.push('avulsion_pattern');
  }
  if (i.walking === 'unable') {
    cautions.push('Inability to bear weight warrants in-person assessment before starting a loading programme.');
    flags.push('non_weight_bearing');
  }
  if (i.prior_hamstring === 'yes') {
    cautions.push('Previous injury to this hamstring raises reinjury risk — progression should be conservative and strictly criteria-based (reinjury, not return time, is the outcome that matters).');
    flags.push('prior_injury');
  }

  // ---- Entity routing ----
  let entity, reasoning, muscle;
  if (avulsionPattern) {
    entity = HAMSTRING_ENTITIES.PROXIMAL_AVULSION;
    muscle = 'Proximal hamstring origin (ischial tuberosity)';
    reasoning = 'Proximal location, an audible/felt pop and severe pain fit a proximal tendon avulsion pattern rather than a simple muscle strain.';
  } else if (i.mechanism === 'gradual') {
    entity = HAMSTRING_ENTITIES.PROXIMAL_TENDINOPATHY;
    muscle = 'Proximal hamstring tendon';
    reasoning = 'A gradual onset without a single injury event points to a tendinopathy (overuse) pattern rather than an acute strain — loading is managed differently (progressive tendon loading, avoid compressive deep-hip-flexion positions early).';
  } else if (i.mechanism === 'stretch' || (i.location === 'high_near_sit_bone' && i.mechanism !== 'high_speed_running')) {
    entity = HAMSTRING_ENTITIES.STRETCH_SM;
    muscle = 'Semimembranosus / proximal free tendon';
    reasoning = 'A stretch-type mechanism (high kick, split, slide) with proximal pain characteristically involves the semimembranosus proximal free tendon, which typically recovers more slowly than a sprint-type injury.';
  } else if (i.mechanism === 'high_speed_running') {
    entity = HAMSTRING_ENTITIES.SPRINT_BFLH;
    muscle = 'Biceps femoris long head (proximal musculotendinous junction)';
    reasoning = 'A high-speed running mechanism typically injures the biceps femoris long head at its proximal musculotendinous junction during terminal swing, where the muscle contracts eccentrically to decelerate the shank.';
  } else {
    entity = HAMSTRING_ENTITIES.GENERAL_MTJ;
    muscle = 'Hamstring musculotendinous unit';
    reasoning = 'Findings fit a hamstring musculotendinous strain; mechanism was not specific enough to localise further.';
  }

  // ---- Severity band (clinical, not MRI grade) ----
  let score = sev(i.pain_severity);
  if (i.walking === 'unable') score += 2; else if (i.walking === 'limp') score += 1;
  if (i.pop_felt === 'yes') score += 1;
  if (i.bruising === 'yes') score += 1;
  let band, bandLabel;
  if (score >= 5) { band = 'high_concern'; bandLabel = 'Higher-severity pattern'; }
  else if (score >= 3) { band = 'moderate'; bandLabel = 'Moderate strain pattern'; }
  else { band = 'lower'; bandLabel = 'Lower-grade strain pattern'; }

  // Tendon-involvement suspicion worsens prognosis (BAMIC 'c').
  const tendonInvolvement = (entity === HAMSTRING_ENTITIES.STRETCH_SM || entity === HAMSTRING_ENTITIES.PROXIMAL_AVULSION) && score >= 3;
  if (tendonInvolvement) flags.push('possible_intratendinous');

  // ---- Recovery outlook drivers ----
  const drivers = [];
  drivers.push(entity === HAMSTRING_ENTITIES.SPRINT_BFLH ? 'Sprint-type injuries often recover faster than stretch-type' : 'Stretch-type / proximal injuries typically recover more slowly');
  if (tendonInvolvement) drivers.push('Possible tendon involvement — expect a longer, more conservative course');
  if (i.prior_hamstring === 'yes') drivers.push('Prior injury — higher reinjury risk, progress cautiously');
  drivers.push('Injury extent and pain-free range drive the actual timeline');

  const recovery = recoveryEstimate(entity, band);

  // ---- Match confidence (pattern match, NOT diagnostic certainty; no imaging) ----
  let confidence = 'moderate';
  const specific = [i.mechanism, i.location, i.pain_severity].filter(Boolean).length;
  if (avulsionPattern || i.mechanism === 'gradual') confidence = 'moderate';
  else if (specific >= 3 && i.mechanism !== 'other') confidence = 'high';
  else if (specific <= 1) confidence = 'low';

  return {
    entity,
    entity_title: ENTITY_TITLES[entity],
    muscle,
    reasoning,
    band, band_label: bandLabel,
    severity_score: score,
    tendon_involvement: tendonInvolvement,
    recovery,
    recovery_drivers: drivers,
    cautions,
    flags,
    confidence,
    review_required: flags.includes('avulsion_pattern') || flags.includes('non_weight_bearing'),
  };
}

function recoveryEstimate(entity, band) {
  const table = {
    sprint_type_biceps_femoris: { lower: '~2–4 weeks', moderate: '~4–8 weeks', high_concern: '~6–12 weeks' },
    stretch_type_proximal: { lower: '~4–8 weeks', moderate: '~8–12 weeks', high_concern: '~3–6 months' },
    proximal_hamstring_tendinopathy: { lower: 'Weeks–months (load-dependent)', moderate: 'Months (progressive loading)', high_concern: 'Months (progressive loading)' },
    proximal_avulsion_suspected: { lower: 'Clinician-directed', moderate: 'Clinician-directed', high_concern: 'Clinician-directed (surgery possible)' },
    hamstring_mtj_strain: { lower: '~2–5 weeks', moderate: '~4–8 weeks', high_concern: '~6–12 weeks' },
  };
  return (table[entity] || table.hamstring_mtj_strain)[band] || 'Varies — criteria-based';
}

export { ENTITY_TITLES as HAMSTRING_ENTITY_TITLES };
