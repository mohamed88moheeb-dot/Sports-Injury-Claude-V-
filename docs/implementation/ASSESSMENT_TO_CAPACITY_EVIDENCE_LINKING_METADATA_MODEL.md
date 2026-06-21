# Assessment-to-Capacity Evidence-Linking Metadata Model

**Status:** 1 evidence-link map authored (RF-ASSESS-TO-CAP-MAP-001, 26 links) · draft · pending · clinically not approved · NON-EXECUTABLE · runtime_integration none · metadata only. **No RF-ASSESS/CAP/RF-CAP/RF-EX/RF-ACT/RF-rule objects modified; no runtime behavior created.**

## 1. Purpose
Implement the frozen evidence-linking *design* as governed, non-executable **metadata**: a declarative map
of which RF-ASSESS finding qualitatively informs which universal CAP capacity, with conceptual signal
types and review flags. It calculates nothing, stores no user state, and creates no runtime adaptation.

## 2. Why the metadata map was authored now
Universal CAP Batch 1 (15) and RF-ASSESS Batch 1 (18) are frozen, and the evidence-linking design is
frozen. The map turns the design's conceptual bridge into a reviewable artifact the future governed
reasoning layer can consume — without any executable behaviour.

## 3. Folder / schema / template / status / source-map overview
New system `lib/clinical/evidenceLinkingKnowledge/`:
- `schema/evidenceLinkMap.schema.json` — inert one-document schema (`additionalProperties:false`).
- `templates/evidenceLinkMapTemplate.json` — blank/inert template.
- `status/evidenceLinkingKnowledgeStatus.json` — `rf_assess_to_cap_map_authored`, 1 map / 0 approved.
- `rf/source/rfEvidenceLinkingSourceMap.json` — source map (1 map, source/target id lists, context-only notes).
- `rf/maps/RF-ASSESS-TO-CAP-MAP-001.json` — the authored map.

## 4. Mapping file contents
`RF-ASSESS-TO-CAP-MAP-001.json`: `map_id`, `module: rectus_femoris`, draft/pending/not_approved/exec
false/runtime none/`evidence_linking_metadata_only`, `source_assessment_batch`, `target_capacity_batch`,
`signal_types_allowed` (8 conceptual labels), `links` (26), and `governance_notes` (including the
RF-ASSESS-001 diagnostic-context-only and RF-ASSESS-002 safety-context-only statements, and that RF-SAF/
RF-DX remain authority).

## 5. Link count summary
**26 links** (matches the validated coverage): 003→001 · 004→002 · 005→008 · 006→009 · 007/008/009→010 ·
010→011 · 011→012 · 012→013 · 012→014 · 013→003 · 014→004 · 014→006 · 015→005 · 015→006 · 016→007 ·
017→001/002/003/004/005/006/007/010 (8) · 018→015.

## 6. RF-ASSESS to CAP coverage
Every link's `assessment_id` resolves to an existing RF-ASSESS object and every `capacity_id` to an
existing universal CAP object (validator-enforced). **RF-ASSESS-001 (diagnostic context) and RF-ASSESS-002
(safety context) have no CAP links** — represented only in governance/source notes.

## 7. Signal-type usage
- `supports_capacity` — normal tolerance/capacity checks (003, 004, 005, 006, 010, 011, 012, 013, 014).
- `monitoring_context` — RF-ASSESS-017 next-day-response links (8).
- `diagnostic_context_only` — provocation/palpation links RF-ASSESS-007/008/009 → CAP-010.
- `requires_clinician_confirmation` — high-caution links RF-ASSESS-015/016/018 (clinically safest
  applicable label; never implies clearance).

## 8. High-caution link handling
Links from RF-ASSESS-015, RF-ASSESS-016, RF-ASSESS-018 set `high_caution_flag: true` and
`requires_clinician_review: true`, with notes stating: not sprint clearance; not kicking clearance; not
RTS clearance; not competition clearance; not readiness; not a progression gate; requires future clinical
review before runtime use. (Validator enforces both flags.)

## 9. Safety / diagnostic context handling
RF-ASSESS-007/008/009 links set `diagnostic_context_only: true` with notes deferring diagnosis to
RF-DX/RF-SAF (validator-enforced). RF-ASSESS-001/002 are context-only (no CAP links); the map's
`governance_notes` state RF-ASSESS-001 = diagnostic context only, RF-ASSESS-002 = safety context only,
RF-SAF rules remain safety authority, RF-DX rules remain diagnosis authority.

## 10. Governance controls
Map, status, source map, schema, and template are draft/pending/not_approved/non-executable/runtime none/
metadata only. No score, threshold, pass/fail, prescription, dosage, progression, readiness, RTT/RTS,
diagnosis, triage, or clearance authority. Effects fields are qualitative strings; the validator deep-scans
for prohibited keys and (negation-safe) active-authority phrases.

## 11. Validator update
Created `scripts/validate-evidence-linking-knowledge.mjs`: checks folder/schema/template/status/source-map
exist; exactly 1 map and 26 links; `map_id` = RF-ASSESS-TO-CAP-MAP-001; full posture; every assessment_id/
capacity_id resolves; no RF-CAP/demand/RF-EX/RF-ACT/RF-rule refs in links; RF-ASSESS-001/002 not linked;
RF-ASSESS-017 → exactly CAP-001/002/003/004/005/006/007/010; high-caution links require clinician review;
diagnostic links defer to RF-DX/RF-SAF; source-map ids; and a deep prohibited-key/phrase scan.

## 12. Package script update
Added `"validate:evidence-linking-knowledge": "node scripts/validate-evidence-linking-knowledge.mjs"`
(only addition; no existing scripts changed).

## 13. Confirmation — no RF-ASSESS/CAP/RF-CAP/RF-EX/RF-ACT/RF-rule objects modified
None modified. RF-ASSESS (18), CAP (15), RF-CAP (0), RF-EX (87), RF-ACT (12), RF rules (38) unchanged.

## 14. Confirmation — no runtime / UI / Supabase / RecoveryContext / injuryEngine / legacy changes
None touched; no runtime behavior; nothing executable. Changes confined to
`lib/clinical/evidenceLinkingKnowledge/**`, `scripts/validate-evidence-linking-knowledge.mjs`, an additive
`package.json` script, and `docs/**`.

## 15. Checks run
`validate:evidence-linking-knowledge`, `validate:capacity-knowledge`, `validate:exercise-knowledge`,
`validate:activity-exposure-knowledge`, `validate:assessment-knowledge`, `validate:shared-knowledge-taxonomies`,
`check:rf-clinical`, `validate:rf-rules`, `check:rf-boundary` — all PASS (see task report).

## 16. Required future audit
A clinical red-team audit of the map should verify: link coverage matches the validated assessment→capacity
model; signal types are clinically appropriate; high-caution and diagnostic/safety boundaries hold; effects
remain qualitative with no score/threshold/clearance language; and RF-ASSESS-001/002 remain context-only.

## 17. Recommended next step
After the audit: a governed reasoning-layer **design** (how a future engine would read evidence-link
signals + capacity evidence vs demand) — still non-executable — and/or RF-CAP overlay authoring and the
Demand Profile System scaffold. No autonomous progression/readiness/RTT-RTS/clearance without explicit
governed rules.
