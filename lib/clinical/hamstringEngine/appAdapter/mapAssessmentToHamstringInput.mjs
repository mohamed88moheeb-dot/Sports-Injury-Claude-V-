/**
 * lib/clinical/hamstringEngine/appAdapter/mapAssessmentToHamstringInput.mjs
 * ---------------------------------------------------------------------------
 * Maps the app's existing assessment (plus optional tailored `hamstringAnswers`)
 * into the normalized hamstring input the engine expects. Tailored answers win
 * over generic inference, so the same existing assessment UI drives the engine
 * with no new bespoke screen required.
 * ---------------------------------------------------------------------------
 */

// anatomy sub-area -> proximal/mid/distal hint (muscle id doesn't encode height,
// so this is a soft default the tailored answer can override).
const AREA_LOCATION = {
  biceps_femoris_long: 'mid_belly', semitendinosus: 'mid_belly', semimembranosus: 'high_near_sit_bone',
};

function normaliseMechanism(m = '', story = '') {
  const s = `${m} ${story}`.toLowerCase();
  if (/sprint|high.?speed|running|accelerat|chasing/.test(s)) return 'high_speed_running';
  if (/stretch|kick|split|slide|overreach|reach|hurdle|lengthen/.test(s)) return 'stretch';
  if (/gradual|overuse|over time|slowly|no.*injury|ache|sitting/.test(s)) return 'gradual';
  return 'other';
}

const painToSeverity = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n >= 7) return 'severe';
  if (n >= 4) return 'moderate';
  return 'mild';
};

function daysToWeeksBucket(days) {
  const n = Number(days);
  if (!Number.isFinite(n)) return null;
  if (n <= 7) return 'acute';
  if (n <= 21) return 'subacute';
  return 'late';
}

export function mapAssessmentToHamstringInput(a = {}) {
  const h = a.hamstringAnswers || {};
  const exact = (a.exactArea || '').toLowerCase();

  return {
    mechanism: h.mechanism || normaliseMechanism(a.mechanism, a.story),
    location: h.location || AREA_LOCATION[exact] || 'mid_belly',
    pain_severity: h.pain_severity || painToSeverity(a.painSport) || painToSeverity(a.painWalking) || 'moderate',
    pop_felt: h.pop_felt || 'unsure',
    walking: h.walking || (a.canContinue === 'no' ? 'unable' : a.canContinue === 'limited' ? 'limp' : null) || 'limp',
    weeks_since: h.weeks_since || daysToWeeksBucket(a.daysSince) || 'acute',
    bruising: h.bruising || 'no',
    prior_hamstring: h.prior_hamstring || (a.previousInjury === 'yes' ? 'yes' : 'no'),
    sport: h.sport || (Array.isArray(a.sports) && a.sports[0]) || a.sport_context || 'general',
    equipment_available: Array.isArray(a.equipment) ? a.equipment.map((e) => String(e).toLowerCase()) : ['bodyweight'],
  };
}
