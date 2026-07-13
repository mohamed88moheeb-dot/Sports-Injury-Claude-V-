/**
 * lib/clinical/core/diagnosisDisplay.mjs
 * ---------------------------------------------------------------------------
 * Display helpers that tie the DIAGNOSIS PAGE back to what the user actually
 * answered — used by every engine's *OutputToProfile.mjs adapter.
 *
 * Two inaccuracies these fix:
 *
 * 1. Mechanism: the profile used to display the legacy assessment's untouched
 *    default ("Sudden sprint") for every engine flow, even when the engine's
 *    own questions had established a gradual-overuse onset. The mechanism
 *    shown must come from the ENGINE-NORMALISED input the diagnosis was
 *    actually made from, or not be shown at all.
 *
 * 2. Provenance: the data-driven router already records exactly which
 *    reported findings supported the chosen pattern (weighted rules), but the
 *    UI never surfaced them. Clinically, a suggested pattern without its
 *    supporting findings is not interpretable — these helpers expose them.
 * ---------------------------------------------------------------------------
 */

// Clinical phrasing for engine-normalised mechanism/onset tokens. Anything
// not listed falls back to a prettified token; "don't know" tokens render
// as nothing rather than a made-up mechanism.
const MECHANISM_LABELS = {
  sudden_hip_flexion: 'Sudden forceful hip flexion (kick / sprint start)',
  gradual_overuse: 'Gradual onset with training load',
  gradual_overuse_running: 'Gradual onset with running load',
  gradual: 'Gradual onset',
  high_speed_running: 'High-speed running',
  sprinting: 'Sprinting',
  stretch: 'Overstretch',
  sudden_deceleration: 'Sudden deceleration',
  sudden_push_off: 'Sudden push-off',
  sudden_lift_twist: 'Sudden lift / twist',
  change_of_direction: 'Rapid change of direction',
  kicking: 'Kicking',
  eccentric_load_pop: 'Forced lengthening under load (felt a pop)',
  pivot_noncontact: 'Non-contact pivot / twist',
  dashboard_hyperflexion: 'Direct blow to the shin / hyperflexion',
  valgus_blow: 'Blow forcing the knee inward (valgus)',
  varus_blow: 'Blow forcing the knee outward (varus)',
  twisting: 'Twisting injury',
  inversion: 'Rolled ankle (inversion)',
  external_rotation: 'Foot planted, leg rotated outward',
  jumping_landing: 'Jumping / landing',
  jumping_overuse: 'Repetitive jumping load',
  repetitive_extension_rotation: 'Repetitive back extension / rotation',
  direct_blow: 'Direct blow',
  direct_impact: 'Direct impact',
  fall: 'Fall',
  sudden: 'Sudden onset',
};

const NON_ANSWERS = new Set(['unsure', 'unknown', 'other', 'unspecified', 'none', '']);

/**
 * Human mechanism label from the engine-normalised input the diagnosis was
 * actually computed from. Returns '' when the mechanism is unknown — the UI
 * should then omit it instead of showing a default that was never answered.
 * @param {object|null} input  engine-normalised input echo (output.input)
 * @returns {string}
 */
export function describeMechanism(input) {
  const raw = String(input?.mechanism || input?.onset || '').toLowerCase();
  if (NON_ANSWERS.has(raw)) return '';
  if (MECHANISM_LABELS[raw]) return MECHANISM_LABELS[raw];
  const s = raw.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * The reported findings that SUPPORTED the diagnosed pattern, as human-
 * readable strings — the router's positive matched rules when available
 * (dataDrivenDiagnosis breakdown), otherwise its single reason sentence
 * (safety gates, overrides, bespoke routers like knee).
 * @param {object|null} routing  engine routing result
 * @returns {string[]}
 */
export function diagnosisDrivers(routing) {
  if (!routing) return [];
  const matched = routing.breakdown?.[routing.entity]?.matched;
  if (Array.isArray(matched)) {
    const positive = matched.filter((m) => m.weight > 0).map((m) => m.label);
    if (positive.length) return positive;
  }
  const reason = String(routing.reason || '').replace(/\.$/, '').trim();
  return reason ? [reason] : [];
}
