/**
 * lib/clinical/ai/retrieveContext.mjs
 * ---------------------------------------------------------------------------
 * Surfaces the knowledge base to the AI-first planner as OPTIONAL reference
 * material — a retrieval tool, not the authority. The planner is free to use
 * these hints where they fit and to reason beyond them where they are thin or
 * absent (many regions have no curated pattern list at all — that's fine, the
 * model supplies its own clinical knowledge).
 *
 * Everything here is best-effort context. Nothing is required for a plan to be
 * produced, and nothing here constrains the model's conclusions.
 * ---------------------------------------------------------------------------
 */

import { retrieveRtsEvidence } from '../core/rtsEvidence.mjs';

// Common injury patterns per region — a light hint list drawn from the app's
// curated engines. Regions not listed simply get no pattern hints (the model
// diagnoses from its own knowledge).
const REGION_PATTERNS = {
  hamstring: ['Biceps femoris (sprint-type) strain', 'Proximal free-tendon / stretch-type strain', 'Proximal hamstring tendinopathy', 'Musculotendinous-junction strain'],
  quadriceps: ['Rectus femoris strain', 'Vastus (medialis/lateralis/intermedius) strain', 'Quadriceps contusion', 'Quadriceps/patellar tendinopathy', 'Quad/patellar tendon rupture (refer)'],
  calf_shin: ['Gastrocnemius/soleus (calf) strain', 'Achilles tendinopathy', 'Medial tibial stress syndrome (shin splints)', 'Achilles rupture (refer)', 'Tibial stress fracture (refer)'],
  adductor_groin: ['Acute adductor strain', 'Longstanding adductor-related groin pain', 'Inguinal/hip-joint related groin pain', 'Sports hernia (refer)'],
  hip_flexor: ['Iliopsoas (hip flexor) strain', 'Iliopsoas-related / snapping-hip pain', 'Femoral neck stress fracture (refer)', 'Hip-joint (FAI/labral) pathology (refer)'],
  glutes: ['Gluteal (med/max) strain', 'Gluteal tendinopathy / GTPS', 'Deep gluteal syndrome — sciatic involvement (refer)'],
  it_band: ['Iliotibial band syndrome (lateral knee)', 'Structural lateral knee injury (refer)'],
  knee: ['ACL injury', 'PCL injury', 'MCL / LCL injury', 'Meniscal tear', 'Patellofemoral pain', 'Patellar instability', 'Knee osteoarthritis', 'Iliotibial band syndrome', 'Osgood-Schlatter'],
  ankle: ['Lateral ankle sprain', 'Syndesmosis (high ankle) sprain', 'Chronic ankle instability', 'Ankle fracture (refer)'],
  lower_back: ['Non-specific (mechanical) low back pain', 'Lumbar radicular pain (sciatica)', 'Spondylolysis / pars stress (refer)', 'Cauda equina / serious pathology (emergency)'],
  back: ['Thoracolumbar muscular strain', 'Facet-mediated pain', 'Non-specific back pain'],
  shoulder: ['Rotator cuff related shoulder pain / tendinopathy', 'Subacromial pain', 'Shoulder instability / labral', 'AC joint sprain', 'Rotator cuff tear (refer)'],
  chest: ['Pectoralis major strain', 'Costochondral / rib-related pain', 'Pectoralis major tear (refer)'],
  abdomen: ['Rectus abdominis strain', 'Sports hernia / inguinal-related pain (refer)', 'Oblique strain'],
  obliques: ['Internal/external oblique strain', 'Side (lateral trunk) strain'],
  biceps: ['Biceps (long head) tendinopathy', 'Distal biceps strain', 'Distal biceps rupture (refer)'],
  triceps: ['Triceps strain / tendinopathy', 'Distal triceps tendon injury (refer)'],
  elbow: ['Lateral epicondylalgia (tennis elbow)', 'Medial epicondylalgia (golfer’s elbow)', 'Ulnar collateral ligament sprain'],
  forearm: ['Forearm flexor/extensor strain', 'Forearm tendinopathy'],
  neck: ['Mechanical neck pain', 'Cervical radicular pain (refer if neuro signs)'],
  abductor: ['Hip abductor / TFL strain', 'Gluteal tendinopathy / GTPS'],
};

// Map a free mechanism/onset description to the evidence-retrieval kind so the
// most relevant return-to-sport passages come back.
function inferKind(a) {
  const s = `${a.mechanism || ''} ${a.story || ''}`.toLowerCase();
  if (/gradual|overuse|repetit|over time|slowly|tendin|too much|increas/.test(s)) return 'overuse';
  return 'acute_strain';
}

/**
 * @param {object} a  the app assessment (region, mechanism, symptoms, etc.)
 * @returns {{ regionLabel: string, candidatePatterns: string[], evidence: object[], kind: string }}
 */
export function retrieveContext(a = {}) {
  const region = a.primaryRegion || '';
  const kind = inferKind(a);
  const evidence = retrieveRtsEvidence({ kind, entity: '', region: region.replace(/_/g, ' ') })
    .map((p) => ({ id: p.id, source: p.cite.short, text: p.text }));
  return {
    regionLabel: (a.regionName || region || 'the reported area').replace(/_/g, ' '),
    candidatePatterns: REGION_PATTERNS[region] || [],
    evidence,
    kind,
  };
}
