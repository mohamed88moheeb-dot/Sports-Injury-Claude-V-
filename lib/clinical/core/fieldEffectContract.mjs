/**
 * lib/clinical/core/fieldEffectContract.mjs
 * ---------------------------------------------------------------------------
 * THE "NO DEAD INPUTS" CONTRACT.
 *
 * Every assessment field an athlete answers MUST have a declared, clinically
 * correct effect on the diagnosis engine and/or the rehab engine. This module
 * is the single source of truth for that mapping. The validator
 * (validateFieldEffects.mjs) enforces it so the rule cannot silently rot:
 *
 *   1. No orphan fields          — every field declares ≥1 effect.
 *   2. No misrouted fields       — any field describing a deficit / capacity /
 *                                  readiness / sport demand MUST reach the REHAB
 *                                  engine (not only a diagnostic confidence %).
 *   3. Coverage is tracked       — each effect carries `wired: true|false`, so
 *                                  the contract doubles as the migration
 *                                  checklist (declared vs. actually consumed).
 *
 * This is engine-agnostic: RF is the first registry; every injury added later
 * registers its own field set the same way and is held to the same invariant.
 * ---------------------------------------------------------------------------
 */

/** Which engine an effect belongs to. */
export const ENGINES = Object.freeze(['diagnosis', 'rehab']);

/** Effect types, grouped by engine. */
export const EFFECT_TYPES = Object.freeze({
  diagnosis: ['differential', 'severity', 'triage', 'confidence'],
  rehab: ['placement', 'emphasis', 'selection', 'dose', 'progression', 'timeline'],
});

/**
 * Field categories. The four "must-reach-rehab" categories are the ones that
 * describe the athlete's changeable state — if we ask them, the programme must
 * respond to them.
 */
export const CATEGORIES = Object.freeze([
  'deficit', 'capacity', 'readiness', 'sport',     // ⇒ MUST have a rehab effect
  'symptom', 'mechanism', 'structural_sign',        // diagnosis-primary allowed
  'history', 'context', 'safety', 'meta',
]);

export const REHAB_REQUIRED_CATEGORIES = Object.freeze(['deficit', 'capacity', 'readiness', 'sport']);

/** Shorthand effect builders. */
const dx = (type, target, wired, note) => ({ engine: 'diagnosis', type, target, wired: !!wired, note });
const rx = (type, target, wired, note) => ({ engine: 'rehab', type, target, wired: !!wired, note });

/**
 * RF (rectus femoris) field-effect registry.
 * `wired` reflects what the CURRENT engine actually consumes (audited from
 * rfSeverityResolver / rfPlanGenerator / rfConfidenceResolver / retriever).
 * `wired: false` = declared-correct but not yet consumed → migration target.
 */
export const RF_FIELD_EFFECTS = [
  // ── Mechanism & symptoms ────────────────────────────────────────────────
  { field: 'mechanism', label: 'How it happened', category: 'mechanism', effects: [
    dx('differential', 'injury_pattern', true), dx('severity', 'severity_band', true),
    rx('timeline', 'recovery_modifier', true, 'Contusion / gradual-overuse mechanisms flagged as may-lengthen.') ] },
  { field: 'pain_severity_label', label: 'Pain severity', category: 'symptom', effects: [
    dx('severity', 'severity_band', true), rx('placement', 'entry_phase', true),
    rx('dose', 'intensity_ceiling', false) ] },
  { field: 'pain_at_rest', label: 'Pain at rest', category: 'symptom', effects: [
    dx('severity', 'irritability', true),
    rx('dose', 'volume_ceiling', true, 'Rest pain = high irritability → down-rank high impact/speed.'),
    rx('placement', 'acute_management', false) ] },
  { field: 'ability_to_continue_after', label: 'Could you continue?', category: 'symptom', effects: [
    dx('severity', 'severity_band', true), rx('placement', 'entry_phase', true) ] },
  { field: 'next_day_response', label: 'How it felt next day', category: 'symptom', effects: [
    dx('severity', 'irritability', true),
    rx('dose', 'volume_ceiling', true), rx('progression', 'auto_regulation', true,
      'Worse-next-day = reactive → hold/regress progression (daily check-in adjuster).') ] },
  { field: 'stairs_response', label: 'Stairs tolerance', category: 'capacity', effects: [
    dx('severity', 'functional_load', true), rx('dose', 'functional_loading', false) ] },

  // ── Structural signs (diagnosis-primary) ────────────────────────────────
  { field: 'bruising_or_swelling', label: 'Bruising / swelling', category: 'structural_sign', effects: [
    dx('differential', 'structural_vs_muscular', true), dx('severity', 'severity_band', true),
    rx('placement', 'acute_phase', true) ] },
  { field: 'bruising_timing', label: 'When bruising appeared', category: 'structural_sign', effects: [
    dx('differential', 'bleed_timing', false, 'Immediate vs delayed bruising shifts structural likelihood.') ] },
  { field: 'palpation', label: 'Tender to touch (location)', category: 'structural_sign', effects: [
    dx('differential', 'lesion_location', false), dx('confidence', 'pattern_match', true) ] },
  { field: 'pop_or_snap', label: 'Felt a pop/snap', category: 'structural_sign', effects: [
    dx('differential', 'tear_likelihood', true) ] },
  { field: 'scar_history', label: 'Old scar / fibrosis', category: 'history', effects: [
    dx('differential', 'fibrosis', true), rx('emphasis', 'mobility_block', false),
    rx('timeline', 'recovery_modifier', true) ] },

  // ── Capacity / deficit tests (MUST reach rehab) ─────────────────────────
  { field: 'weakness_or_giving_way', label: 'Weakness / giving way', category: 'deficit', effects: [
    dx('severity', 'severity_band', true), rx('placement', 'entry_phase', true),
    rx('emphasis', 'strength_block', true) ] },
  { field: 'knee_extension_response', label: 'Resisted knee extension', category: 'capacity', effects: [
    dx('differential', 'rf_involvement', true), rx('placement', 'entry_phase', true),
    rx('dose', 'loading_tolerance', true) ] },
  { field: 'knee_flexion_response', label: 'Knee-flexion stretch', category: 'capacity', effects: [
    dx('severity', 'severity_band', true), rx('emphasis', 'mobility_block', true) ] },
  { field: 'hip_flexion_response', label: 'Hip flexion', category: 'capacity', effects: [
    dx('differential', 'rf_hipflexor', false), rx('dose', 'loading_tolerance', false) ] },
  { field: 'resisted_hip_flexion', label: 'Resisted hip flexion', category: 'capacity', effects: [
    dx('differential', 'rf_involvement', true), rx('emphasis', 'tissue_loading_block', true) ] },
  { field: 'ely_test', label: 'Ely test (RF tightness)', category: 'deficit', effects: [
    dx('differential', 'rf_involvement', true),
    rx('emphasis', 'mobility_block', true, 'Positive Ely → weight RF mobility.'),
    rx('selection', 'eccentric_lengthening', true) ] },
  { field: 'single_leg_control', label: 'Single-leg control', category: 'deficit', effects: [
    rx('emphasis', 'motor_control_block', true, 'Poor control → weight motor-control/balance.'),
    rx('progression', 'rts_gate', false) ] },
  { field: 'isometric_hold', label: 'Isometric hold tolerance', category: 'capacity', effects: [
    rx('placement', 'reload_gate', true), rx('progression', 'phase_gate', true) ] },
  { field: 'eccentric_control', label: 'Eccentric control', category: 'capacity', effects: [
    rx('placement', 'accumulation_gate', true), rx('progression', 'phase_gate', true) ] },
  { field: 'jog_tolerance', label: 'Jog tolerance', category: 'capacity', effects: [
    rx('placement', 'running_gate', true), rx('progression', 'phase_gate', true) ] },
  { field: 'run_tolerance', label: 'Run tolerance', category: 'capacity', effects: [
    rx('placement', 'accumulation_gate', true), rx('progression', 'phase_gate', true) ] },
  { field: 'sprint_tolerance', label: 'Sprint tolerance', category: 'readiness', effects: [
    rx('dose', 'sport_block_load', true, 'Low sprint tolerance → down-rank high-speed sport work.'),
    rx('selection', 'sport_drills', true), rx('progression', 'rts_gate', false) ] },
  { field: 'kick_tolerance', label: 'Kick tolerance', category: 'sport', effects: [
    rx('selection', 'sport_specific_drills', true), rx('progression', 'rts_gate', false) ] },
  { field: 'movement_confidence', label: 'Movement confidence (psychological)', category: 'readiness', effects: [
    rx('progression', 'rts_psychological_gate', false, 'Low confidence → slow progression, delay clearance (gate not yet built).'),
    rx('timeline', 'rts_readiness', true, 'Low confidence surfaced as a may-lengthen RTS-readiness modifier.') ] },

  // ── History / context / demand ──────────────────────────────────────────
  { field: 'previous_injury', label: 'Previous same injury', category: 'history', effects: [
    dx('differential', 'recurrence_prior', true), rx('timeline', 'recovery_modifier', true),
    rx('progression', 'conservative_pacing', false) ] },
  { field: 'previous_injury_detail', label: 'Previous injury detail', category: 'history', effects: [
    dx('differential', 'recurrence_prior', false), rx('timeline', 'recovery_modifier', false) ] },
  { field: 'age_group', label: 'Age band', category: 'context', effects: [
    dx('differential', 'epidemiological_prior', false), rx('timeline', 'recovery_modifier', true),
    rx('dose', 'loading_adjustment', false) ] },
  { field: 'sport_level', label: 'Level of play', category: 'sport', effects: [
    dx('differential', 'epidemiological_prior', false), rx('selection', 'end_stage_demands', true),
    rx('progression', 'rts_criteria', false) ] },
  { field: 'sport_context', label: 'Sport played', category: 'sport', effects: [
    rx('selection', 'sport_specific_drills', true), rx('progression', 'rts_criteria', false) ] },
  { field: 'days_since_injury_label', label: 'Days since injury', category: 'context', effects: [
    rx('placement', 'phase_tier_estimate', true) ] },

  // ── Safety & meta ───────────────────────────────────────────────────────
  { field: 'red_flags', label: 'Safety questions', category: 'safety', effects: [
    dx('triage', 'red_flag_stop', true), rx('progression', 'plan_withhold', true) ] },
  { field: 'equipment_available', label: 'Equipment available', category: 'context', effects: [
    rx('selection', 'exercise_filter', true) ] },
  { field: 'confidence_in_answers', label: 'Answer confidence', category: 'meta', effects: [
    dx('confidence', 'answer_quality', true) ] },
];

/** Registry index by injury/engine key. Future injuries register here. */
export const FIELD_EFFECT_REGISTRY = Object.freeze({
  rf: RF_FIELD_EFFECTS,
});

export function getRegistry(key) {
  return FIELD_EFFECT_REGISTRY[key] || null;
}
