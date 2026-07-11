/**
 * lib/rag/ingest/textUtils.mjs
 * ---------------------------------------------------------------------------
 * Text processing primitives for the RAG retriever: tokenisation, stopword
 * removal, light stemming, sentence-aware chunking, and clinical query
 * expansion. Pure JS, zero dependencies — runs identically at ingest time and
 * at query time in any Node/edge runtime.
 * ---------------------------------------------------------------------------
 */

// Compact English stoplist + a few citation-boilerplate tokens.
const STOPWORDS = new Set(`a an the of and or to in on for with without at by from as is are was were be been being this that these those it its their his her our your my we you they he she i not no nor but if then than so such can may might will would should could into over under between about against during before after above below up down out off then once here there all any both each few more most other some only own same very s t just also using used use study results conclusion background methods objective purpose aim showed found compared vs versus among within across per due via given whether within`.split(/\s+/));

// Very light suffix stemmer — good enough for lexical matching, cheap, deterministic.
export function stem(w) {
  let s = w;
  if (s.length > 4) {
    s = s.replace(/(ies)$/, 'y')
         .replace(/(ational| isation|ization)$/, 'ate')
         .replace(/(ements|ement)$/, 'e')
         .replace(/(ingly|edly)$/, '')
         .replace(/(sses)$/, 'ss')
         .replace(/(ing|ed|ly|es|s)$/, '');
  }
  return s;
}

export function tokenize(text, { doStem = true } = {}) {
  const raw = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out = [];
  for (const w of raw) {
    if (w.length < 2 || STOPWORDS.has(w)) continue;
    out.push(doStem ? stem(w) : w);
  }
  return out;
}

/**
 * Domain synonym / expansion map. Query expansion is how a lexical retriever
 * gets "semantic" reach without an embedding model: a patient who says
 * "back of thigh" should still match papers that say "biceps femoris". Terms
 * are expanded BEFORE stemming; both sides get stemmed downstream.
 */
export const CLINICAL_SYNONYMS = {
  hamstring: ['biceps femoris', 'semitendinosus', 'semimembranosus', 'posterior thigh', 'back of thigh'],
  'biceps femoris': ['hamstring', 'lateral hamstring'],
  reinjury: ['recurrence', 'reinjury', 're-injury', 'recurrent', 'rerupture'],
  recurrence: ['reinjury', 're-injury', 'recurrent'],
  eccentric: ['nordic', 'lengthening', 'eccentric', 'reverse nordic'],
  nordic: ['eccentric', 'nordic hamstring exercise', 'nhe'],
  sprint: ['sprinting', 'high-speed running', 'running', 'acceleration'],
  stretch: ['lengthening', 'flexibility', 'stretch-type', 'apex of stretch'],
  strengthen: ['strengthening', 'resistance', 'loading', 'strength'],
  rehab: ['rehabilitation', 'rehab', 'treatment', 'protocol', 'programme', 'program'],
  rts: ['return to sport', 'return to play', 'return to running', 'rtp'],
  grade: ['grading', 'classification', 'severity', 'bamic', 'mri grade'],
  pain: ['pain-free', 'pain-threshold', 'painful', 'symptom'],
  proximal: ['proximal', 'ischial', 'free tendon', 'intramuscular tendon', 'central tendon'],
  imaging: ['mri', 'ultrasound', 'imaging', 'radiological'],
  isokinetic: ['isokinetic', 'strength deficit', 'peak torque', 'limb symmetry'],
  prevention: ['prevention', 'preventive', 'prophylactic', 'injury prevention'],
};

/** Expand a raw query string with clinical synonyms (surface form, pre-stem). */
export function expandQuery(text) {
  const lower = String(text || '').toLowerCase();
  const extra = [];
  for (const [key, syns] of Object.entries(CLINICAL_SYNONYMS)) {
    if (lower.includes(key)) extra.push(...syns);
  }
  return `${text} ${extra.join(' ')}`.trim();
}

/**
 * Sentence-aware chunking. Groups sentences into ~maxChars windows with a
 * one-sentence overlap so a passage never splits a clinical claim mid-thought.
 */
export function chunkText(text, { maxChars = 480, overlapSentences = 1 } = {}) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]+|\S+$/g) || [clean];
  const chunks = [];
  let cur = [];
  let curLen = 0;
  for (const s of sentences) {
    const sn = s.trim();
    if (curLen + sn.length > maxChars && cur.length) {
      chunks.push(cur.join(' ').trim());
      cur = cur.slice(-overlapSentences);
      curLen = cur.join(' ').length;
    }
    cur.push(sn);
    curLen += sn.length + 1;
  }
  if (cur.length) chunks.push(cur.join(' ').trim());
  return chunks.filter((c) => c.length > 40);
}
