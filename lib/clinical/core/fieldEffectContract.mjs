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
    rx('dose', 'intensity_ceiling', true, 'Severe pain → high irritability → down-rank high intensity/impact.') ] },
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
    dx('severity', 'functional_load', true), rx('dose', 'functional_loading', true) ] },

  // ── Structural signs (diagnosis-primary) ────────────────────────────────
  { field: 'bruising_or_swelling', label: 'Bruising / swelling', category: 'structural_sign', effects: [
    dx('differential', 'structural_vs_muscular', true), dx('severity', 'severity_band', true),
    rx('placement', 'acute_phase', true) ] },
  { field: 'bruising_timing', label: 'When bruising appeared', category: 'structural_sign', effects: [
    dx('differential', 'bleed_timing', true, 'Read by the confidence resolver to shift structural likelihood.') ] },
  { field: 'palpation', label: 'Tender to touch (location)', category: 'structural_sign', effects: [
    dx('differential', 'lesion_location', true), dx('confidence', 'pattern_match', true) ] },
  { field: 'pop_or_snap', label: 'Felt a pop/snap', category: 'structural_sign', effects: [
    dx('differential', 'tear_likelihood', true) ] },
  { field: 'scar_history', label: 'Old scar / fibrosis', category: 'history', effects: [
    dx('differential', 'fibrosis', true), rx('emphasis', 'mobility_block', true),
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
    dx('differential', 'rf_hipflexor', false), rx('dose', 'loading_tolerance', true) ] },
  { field: 'resisted_hip_flexion', label: 'Resisted hip flexion', category: 'capacity', effects: [
    dx('differential', 'rf_involvement', true), rx('emphasis', 'tissue_loading_block', true) ] },
  { field: 'ely_test', label: 'Ely test (RF tightness)', category: 'deficit', effects: [
    dx('differential', 'rf_involvement', true),
    rx('emphasis', 'mobility_block', true, 'Positive Ely → weight RF mobility.'),
    rx('selection', 'eccentric_lengthening', true) ] },
  { field: 'single_leg_control', label: 'Single-leg control', category: 'deficit', effects: [
    rx('emphasis', 'motor_control_block', true, 'Poor control → weight motor-control/balance.'),
    rx('progression', 'rts_gate', true, 'Single-leg control is a return-to-sport readiness criterion.') ] },
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
    rx('selection', 'sport_drills', true), rx('progression', 'rts_gate', true, 'High-speed running is a return-to-sport criterion.') ] },
  { field: 'kick_tolerance', label: 'Kick tolerance', category: 'sport', effects: [
    rx('selection', 'sport_specific_drills', true), rx('progression', 'rts_gate', true, 'Sport-specific loading is a return-to-sport criterion for kicking athletes.') ] },
  { field: 'movement_confidence', label: 'Movement confidence (psychological)', category: 'readiness', effects: [
    rx('progression', 'rts_psychological_gate', true, 'Confidence is a return-to-sport readiness criterion.'),
    rx('timeline', 'rts_readiness', true, 'Low confidence surfaced as a may-lengthen RTS-readiness modifier.') ] },

  // ── History / context / demand ──────────────────────────────────────────
  { field: 'previous_injury', label: 'Previous same injury', category: 'history', effects: [
    dx('differential', 'recurrence_prior', true), rx('timeline', 'recovery_modifier', true),
    rx('progression', 'conservative_pacing', true, 'Surfaced as a conservative-pacing return-to-sport consideration.') ] },
  { field: 'previous_injury_detail', label: 'Previous injury detail', category: 'history', effects: [
    dx('differential', 'recurrence_prior', false), rx('timeline', 'recovery_modifier', false) ] },
  { field: 'age_group', label: 'Age band', category: 'context', effects: [
    dx('differential', 'epidemiological_prior', false), rx('timeline', 'recovery_modifier', true),
    rx('dose', 'loading_adjustment', false) ] },
  { field: 'sport_level', label: 'Level of play', category: 'sport', effects: [
    dx('differential', 'epidemiological_prior', false), rx('selection', 'end_stage_demands', true),
    rx('progression', 'rts_criteria', true, 'Higher level → stricter return-to-sport testing consideration.') ] },
  { field: 'sport_context', label: 'Sport played', category: 'sport', effects: [
    rx('selection', 'sport_specific_drills', true), rx('progression', 'rts_criteria', true, 'Sport determines whether kicking is a required RTS criterion.') ] },
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

/**
 * KNEE field-effect registry. Most knee fields drive DIAGNOSIS (the router picks
 * the entity from structure + mechanism + signals); capacity/readiness/sport
 * fields also reach REHAB via the RTS readiness battery and stage placement.
 */
export const KNEE_FIELD_EFFECTS = [
  // ── Routing / diagnosis drivers ─────────────────────────────────────────
  { field: 'structure', label: 'Selected knee structure', category: 'structural_sign', effects: [
    dx('differential', 'entity_router', true, 'Selected structure routes directly to the entity.') ] },
  { field: 'mechanism', label: 'How it happened', category: 'mechanism', effects: [
    dx('differential', 'entity_router', true), rx('timeline', 'recovery_modifier', false) ] },
  { field: 'pain_location', label: 'Where it hurts', category: 'structural_sign', effects: [
    dx('differential', 'entity_router', true) ] },
  { field: 'onset', label: 'Sudden or gradual', category: 'mechanism', effects: [
    dx('differential', 'acute_vs_overuse', true) ] },
  { field: 'pop_at_injury', label: 'Pop at injury', category: 'structural_sign', effects: [
    dx('differential', 'acl_pattern', true) ] },
  { field: 'swelling_timing', label: 'When it swelled', category: 'structural_sign', effects: [
    dx('differential', 'haemarthrosis_acl', true), dx('triage', 'immediate_large_swelling', true) ] },
  { field: 'swelling_amount', label: 'How much swelling', category: 'structural_sign', effects: [
    dx('triage', 'immediate_large_swelling', true), dx('severity', 'severity_band', true) ] },
  { field: 'joint_line_tenderness', label: 'Joint-line tenderness', category: 'structural_sign', effects: [
    dx('differential', 'meniscus_pattern', true) ] },
  { field: 'morning_stiffness_minutes', label: 'Morning stiffness', category: 'symptom', effects: [
    dx('differential', 'oa_pattern', true) ] },
  { field: 'recurrent_dislocation', label: 'Recurrent dislocation', category: 'history', effects: [
    dx('differential', 'patellar_instability', true), rx('progression', 'rts_consideration', true) ] },
  { field: 'laxity_grade', label: 'Ligament laxity grade', category: 'structural_sign', effects: [
    dx('severity', 'ligament_grade', true), dx('triage', 'high_grade_referral', true) ] },
  // ── Triage / red flags ──────────────────────────────────────────────────
  { field: 'locking_or_block', label: 'Locking / block to extension', category: 'safety', effects: [
    dx('triage', 'locked_knee_referral', true), dx('differential', 'bucket_handle_meniscus', true),
    rx('progression', 'rts_gate', true) ] },
  { field: 'giving_way', label: 'Giving way / instability', category: 'readiness', effects: [
    dx('triage', 'gross_instability', true), rx('progression', 'rts_gate', true, 'Stability is a return-to-sport criterion.') ] },
  { field: 'weight_bearing', label: 'Weight-bearing ability', category: 'capacity', effects: [
    dx('triage', 'unable_to_bear_weight', true), rx('progression', 'rts_gate', true), rx('placement', 'entry_stage', true) ] },
  { field: 'febrile_hot_joint', label: 'Hot / febrile joint', category: 'safety', effects: [
    dx('triage', 'septic_joint', true) ] },
  { field: 'high_energy_trauma', label: 'High-energy trauma', category: 'safety', effects: [
    dx('triage', 'plc_multiligament', true) ] },
  { field: 'red_flags', label: 'Safety questions', category: 'safety', effects: [
    dx('triage', 'red_flag_stop', true), rx('progression', 'plan_withhold', true) ] },
  // ── Severity / placement ────────────────────────────────────────────────
  { field: 'pain_severity_label', label: 'Pain severity', category: 'symptom', effects: [
    dx('severity', 'severity_band', true), rx('placement', 'entry_stage', true) ] },
  { field: 'ability_to_continue', label: 'Could you continue?', category: 'symptom', effects: [
    dx('severity', 'severity_band', true) ] },
  { field: 'days_since_injury', label: 'Days since injury', category: 'context', effects: [
    rx('placement', 'entry_stage', true) ] },
  { field: 'surgical_repair_done', label: 'Surgery done?', category: 'history', effects: [
    rx('placement', 'post_op_staging', true) ] },
  { field: 'weeks_since_surgery', label: 'Weeks since surgery', category: 'context', effects: [
    rx('placement', 'post_op_staging', false) ] },
  // ── Capacity / readiness → REHAB (RTS battery) ──────────────────────────
  { field: 'pain_with_squat', label: 'Pain with squatting', category: 'capacity', effects: [
    dx('differential', 'pfps_pattern', true), rx('progression', 'rts_gate', true) ] },
  { field: 'pain_with_stairs', label: 'Pain on stairs', category: 'capacity', effects: [
    dx('differential', 'pfps_pattern', true), rx('progression', 'rts_gate', true) ] },
  { field: 'movement_confidence', label: 'Confidence to return', category: 'readiness', effects: [
    rx('progression', 'rts_psychological_gate', true) ] },
  // ── Context / demand ────────────────────────────────────────────────────
  { field: 'age_group', label: 'Age band', category: 'context', effects: [
    dx('differential', 'osd_oa_prior', true), rx('progression', 'rts_consideration', true) ] },
  { field: 'sport_context', label: 'Sport played', category: 'sport', effects: [
    rx('progression', 'rts_criteria', true), rx('selection', 'sport_loads', false) ] },
  { field: 'activity_level', label: 'Activity level', category: 'sport', effects: [
    rx('progression', 'rts_consideration', true) ] },
  { field: 'equipment_available', label: 'Equipment available', category: 'context', effects: [
    rx('selection', 'exercise_filter', false) ] },
  { field: 'confidence_in_answers', label: 'Answer confidence', category: 'meta', effects: [
    dx('confidence', 'answer_quality', true) ] },
];

/** Registry index by injury/engine key. Future injuries register here. */
export const FIELD_EFFECT_REGISTRY = Object.freeze({
  rf: RF_FIELD_EFFECTS,
  knee: KNEE_FIELD_EFFECTS,
});

export function getRegistry(key) {
  return FIELD_EFFECT_REGISTRY[key] || null;
}
