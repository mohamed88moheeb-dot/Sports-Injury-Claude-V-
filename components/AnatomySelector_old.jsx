'use client';
import { useState, useRef, useEffect } from 'react';

const MUSCLE_GROUPS = {
  front: [
    {
      id: 'abdomen',
      name: 'Abdomen',
      side: 'front',
      color: '#7C3AED',
      path: 'M42,68 L78,68 L78,112 L42,112 Z',
      labelX: 60, labelY: 92,
      tip: { x: 95, y: 90 },
    },
    {
      id: 'hip_pelvis',
      name: 'Hips / Pelvis',
      side: 'front',
      color: '#EC4899',
      path: 'M38,108 L82,108 L86,128 L76,142 L60,148 L44,142 L34,128 Z',
      labelX: 60, labelY: 126,
      tip: { x: 96, y: 126 },
    },
    {
      id: 'quadriceps',
      name: 'Quadriceps',
      side: 'front',
      color: '#0891B2',
      path: 'M40,132 L58,132 L60,178 L48,184 L38,174 Z M62,132 L80,132 L82,174 L72,184 L60,178 Z',
      labelX: 60, labelY: 158,
      tip: { x: 96, y: 158 },
    },
    {
      id: 'adductors',
      name: 'Adductors',
      side: 'front',
      color: '#DC2626',
      path: 'M54,132 L60,132 L60,180 L52,176 Z M60,132 L66,132 L68,176 L60,180 Z',
      labelX: 60, labelY: 152,
      tip: { x: 96, y: 152 },
    },
    {
      id: 'knee',
      name: 'Knee',
      side: 'front',
      color: '#059669',
      path: 'M42,178 L58,176 L60,194 L44,196 Z M62,176 L78,178 L76,196 L60,194 Z',
      labelX: 60, labelY: 188,
      tip: { x: 96, y: 188 },
    },
    {
      id: 'shins',
      name: 'Shins',
      side: 'front',
      color: '#2563EB',
      path: 'M44,196 L58,194 L58,232 L48,236 L40,224 Z M62,194 L76,196 L80,224 L70,236 L62,232 Z',
      labelX: 60, labelY: 216,
      tip: { x: 96, y: 216 },
    },
    {
      id: 'ankle',
      name: 'Ankle',
      side: 'front',
      color: '#D97706',
      path: 'M46,232 L58,232 L58,250 L46,250 Z M62,232 L74,232 L74,250 L62,250 Z',
      labelX: 60, labelY: 242,
      tip: { x: 96, y: 242 },
    },
  ],
  back: [
    {
      id: 'glutes',
      name: 'Glutes',
      side: 'back',
      color: '#EC4899',
      path: 'M38,108 L60,108 L60,144 L42,148 L34,128 Z M60,108 L82,108 L86,128 L78,148 L60,144 Z',
      labelX: 60, labelY: 128,
      tip: { x: 96, y: 128 },
    },
    {
      id: 'hip_pelvis_back',
      name: 'Hips / Pelvis',
      side: 'back',
      color: '#BE185D',
      path: 'M40,102 L80,102 L86,122 L78,138 L60,144 L42,138 L34,122 Z',
      labelX: 60, labelY: 118,
      tip: { x: 96, y: 118 },
    },
    {
      id: 'abductors',
      name: 'Abductors',
      side: 'back',
      color: '#7C3AED',
      path: 'M34,124 L44,124 L48,190 L38,196 L32,164 Z M76,124 L86,124 L88,164 L82,196 L72,190 Z',
      labelX: 60, labelY: 160,
      tip: { x: 96, y: 160 },
    },
    {
      id: 'hamstrings',
      name: 'Hamstrings',
      side: 'back',
      color: '#0891B2',
      path: 'M44,136 L58,136 L60,180 L48,188 L38,174 Z M62,136 L76,136 L82,174 L72,188 L60,180 Z',
      labelX: 60, labelY: 158,
      tip: { x: 96, y: 158 },
    },
    {
      id: 'knee',
      name: 'Knee',
      side: 'back',
      color: '#059669',
      path: 'M42,180 L58,178 L60,196 L44,198 Z M62,178 L78,180 L76,198 L60,196 Z',
      labelX: 60, labelY: 190,
      tip: { x: 96, y: 190 },
    },
    {
      id: 'calves_shins',
      name: 'Calves / Shins',
      side: 'back',
      color: '#059669',
      path: 'M44,196 L58,192 L60,232 L48,238 L40,224 Z M62,192 L76,196 L80,224 L70,238 L60,232 Z',
      labelX: 60, labelY: 216,
      tip: { x: 96, y: 216 },
    },
    {
      id: 'ankle',
      name: 'Ankle / Achilles',
      side: 'back',
      color: '#D97706',
      path: 'M48,232 L58,232 L58,252 L48,252 Z M62,232 L72,232 L72,252 L62,252 Z',
      labelX: 60, labelY: 244,
      tip: { x: 96, y: 244 },
    },
  ],
};

const ZOOM_DATA = {
  quadriceps: {
    title: 'Quadriceps',
    viewBox: '20 100 80 100',
    bodyClip: true,
    muscles: [
      { id: 'rectus_femoris',    name: 'Rectus femoris',     detail: 'Front-centre thigh. Biarticular; stressed by sprinting and kicking.', path: 'M55,115 L65,115 L66,175 L60,178 L54,175 Z', color: '#0891B2' },
      { id: 'vastus_lateralis',  name: 'Vastus lateralis',   detail: 'Outer quad. Loaded in squats, running, deceleration.', path: 'M65,116 L75,118 L78,174 L66,176 Z', color: '#0E7490' },
      { id: 'vastus_medialis',   name: 'Vastus medialis / VMO', detail: 'Inner quad near knee. Key for tracking and control.', path: 'M45,116 L55,116 L54,174 L42,172 Z', color: '#164E63' },
      { id: 'vastus_intermedius',name: 'Vastus intermedius',  detail: 'Deep central quad. Deep anterior thigh ache.', path: 'M54,118 L66,118 L66,170 L54,170 Z', color: '#1E40AF', opacity: 0.55 },
      { id: 'quad_tendon',       name: 'Quad tendon',         detail: 'Above the kneecap. Treat as tendon, not simple strain.', path: 'M46,175 L74,175 L76,188 L60,192 L44,188 Z', color: '#7C3AED' },
    ],
  },
  hamstrings: {
    title: 'Hamstrings',
    viewBox: '20 100 80 100',
    muscles: [
      { id: 'biceps_femoris_long',  name: 'Biceps femoris long head',  detail: 'Outer / posterior thigh. Sprinting & high-speed running.', path: 'M63,122 L74,124 L78,175 L64,178 Z', color: '#0891B2' },
      { id: 'biceps_femoris_short', name: 'Biceps femoris short head', detail: 'Outer lower hamstring near the back/outside of knee.', path: 'M63,150 L74,152 L76,178 L64,178 Z', color: '#0E7490' },
      { id: 'semitendinosus',       name: 'Semitendinosus',            detail: 'Inner / posterior hamstring. Hip ext. and knee flex.', path: 'M46,122 L57,122 L56,178 L44,175 Z', color: '#164E63' },
      { id: 'semimembranosus',      name: 'Semimembranosus',           detail: 'Deep inner hamstring. Deep posterior thigh pull.', path: 'M54,124 L62,124 L62,174 L54,174 Z', color: '#1E3A5F', opacity: 0.55 },
      { id: 'proximal_tendon',      name: 'Proximal tendon / high hamstring', detail: 'Pain near sitting bone. Slower loading; refer if severe.', path: 'M44,118 L76,118 L74,128 L46,128 Z', color: '#7C3AED' },
    ],
  },
  adductors: {
    title: 'Adductors',
    viewBox: '25 100 70 90',
    muscles: [
      { id: 'adductor_longus',    name: 'Adductor longus',    detail: 'Main inner-thigh tendon. Common in football and cutting.', path: 'M52,120 L68,120 L66,168 L60,172 L54,168 Z', color: '#DC2626' },
      { id: 'adductor_brevis',    name: 'Adductor brevis',    detail: 'Deep upper groin; deep adductor pain.', path: 'M54,120 L66,120 L65,148 L55,148 Z', color: '#991B1B', opacity: 0.7 },
      { id: 'adductor_magnus',    name: 'Adductor magnus',    detail: 'Large inner/posterior thigh adductor. Wide stance and sprinting.', path: 'M46,128 L74,128 L70,178 L50,178 Z', color: '#B91C1C', opacity: 0.6 },
      { id: 'gracilis',           name: 'Gracilis',           detail: 'Long inner-thigh muscle crossing the knee.', path: 'M58,118 L62,118 L64,176 L56,176 Z', color: '#7F1D1D' },
      { id: 'inguinal_pubalgia',  name: 'Inguinal / pubic area', detail: 'Lower abdominal or pubic pain. Screen for hernia.', path: 'M44,108 L76,108 L74,122 L46,122 Z', color: '#F59E0B' },
    ],
  },
  calves_shins: {
    title: 'Calves / Shins',
    viewBox: '20 180 80 90',
    muscles: [
      { id: 'gastrocnemius_medial',  name: 'Medial gastrocnemius',  detail: 'Inner upper calf. Push-off and acceleration.', path: 'M45,193 L57,190 L58,228 L44,232 Z', color: '#059669' },
      { id: 'gastrocnemius_lateral', name: 'Lateral gastrocnemius', detail: 'Outer upper calf. Sprinting and jumping.', path: 'M63,190 L75,193 L76,232 L62,228 Z', color: '#047857' },
      { id: 'soleus',                name: 'Soleus',                detail: 'Deep lower calf. Distance running, bent-knee loading.', path: 'M46,218 L58,214 L62,214 L74,218 L72,234 L60,238 L48,234 Z', color: '#065F46', opacity: 0.7 },
      { id: 'tibialis_anterior',     name: 'Tibialis anterior',     detail: 'Front shin. Overloaded by running volume or downhill.', path: 'M44,193 L54,192 L53,230 L42,228 Z', color: '#0891B2' },
      { id: 'medial_tibial',         name: 'Medial tibial / MTSS',  detail: 'Inside shin. Focal bone pain needs stress-fracture caution.', path: 'M42,195 L46,195 L46,232 L40,232 Z', color: '#DC2626' },
    ],
  },
  abductors: {
    title: 'Abductors / Lateral Hip',
    viewBox: '20 100 80 110',
    muscles: [
      { id: 'proximal_itb_tfl', name: 'TFL / upper lateral hip',  detail: 'Upper lateral hip tension and load sensitivity.', path: 'M36,110 L46,110 L48,140 L34,142 Z M74,110 L84,110 L86,142 L72,140 Z', color: '#7C3AED' },
      { id: 'mid_itb',          name: 'Mid IT band',              detail: 'Outer thigh sensitivity. Tied to load and hip control.', path: 'M34,142 L46,140 L46,196 L34,198 Z M74,140 L86,142 L86,198 L74,196 Z', color: '#6D28D9' },
      { id: 'distal_itb',       name: 'Distal IT band / lateral knee', detail: 'Outer knee pain. Common in runners and cyclists.', path: 'M34,196 L46,194 L48,210 L36,212 Z M72,194 L84,196 L84,212 L72,210 Z', color: '#5B21B6' },
      { id: 'glute_med',        name: 'Glute medius',             detail: 'Hip control. Central to lateral-chain rehab.', path: 'M36,105 L84,105 L82,115 L38,115 Z', color: '#DC2626' },
    ],
  },
  abdomen: {
    title: 'Abdomen / Core',
    viewBox: '20 55 80 70',
    muscles: [
      { id: 'lower_rectus',     name: 'Lower rectus abdominis', detail: 'Lower abdominal strain symptoms.', path: 'M52,70 L68,70 L68,108 L52,108 Z', color: '#7C3AED' },
      { id: 'oblique',          name: 'Obliques',               detail: 'Side-ab pain with rotation, cutting, or kicking.', path: 'M36,68 L52,70 L52,108 L40,112 Z M68,70 L84,68 L80,112 L68,108 Z', color: '#6D28D9' },
      { id: 'inguinal_canal',   name: 'Inguinal canal',         detail: 'Groin crease pain or pressure. Screen for hernia.', path: 'M44,108 L56,108 L54,118 L42,116 Z M64,108 L76,108 L78,116 L66,118 Z', color: '#DC2626' },
      { id: 'pubic_symphysis',  name: 'Pubic symphysis',        detail: 'Central pubic pain. Often overlaps adductor problems.', path: 'M54,116 L66,116 L66,124 L54,124 Z', color: '#F59E0B' },
    ],
  },
  ankle: {
    title: 'Ankle',
    viewBox: '20 215 80 60',
    muscles: [
      { id: 'atfl',        name: 'ATFL / outside front ankle', detail: 'Most common lateral ankle sprain location.', path: 'M72,228 L80,232 L78,248 L70,244 Z', color: '#DC2626' },
      { id: 'cfl',         name: 'CFL / outside lower ankle',  detail: 'Lateral ankle ligament below the fibula.', path: 'M70,244 L78,248 L76,256 L66,254 Z', color: '#B91C1C' },
      { id: 'deltoid',     name: 'Deltoid / inner ankle',      detail: 'Medial ankle pain. Needs more caution than lateral.', path: 'M40,228 L48,232 L50,248 L40,246 Z', color: '#0891B2' },
      { id: 'syndesmosis', name: 'High ankle / syndesmosis',   detail: 'Pain above joint. Often needs longer rehab and review.', path: 'M48,218 L72,218 L74,230 L46,230 Z', color: '#7C3AED' },
      { id: 'achilles',    name: 'Achilles tendon',            detail: 'Back of ankle tendon. Load progressively; avoid early plyos.', path: 'M54,228 L66,228 L68,258 L52,258 Z', color: '#059669' },
    ],
  },
  knee: {
    title: 'Knee',
    viewBox: '20 165 80 50',
    muscles: [
      { id: 'patellar_tendon',   name: 'Patellar tendon',        detail: 'Below kneecap. Isometrics → heavy slow → plyometrics.', path: 'M50,185 L70,185 L72,200 L48,200 Z', color: '#7C3AED' },
      { id: 'patellofemoral',    name: 'Patellofemoral joint',   detail: 'Front knee around kneecap. Load management + hip/quad work.', path: 'M48,175 L72,175 L72,186 L48,186 Z', color: '#6D28D9' },
      { id: 'mcl',               name: 'MCL / inner knee',       detail: 'Medial ligament. Avoid valgus stress early.', path: 'M38,178 L48,178 L46,202 L36,198 Z', color: '#0891B2' },
      { id: 'lcl',               name: 'LCL / outer knee',       detail: 'Outer ligament. Screen instability carefully.', path: 'M72,178 L82,178 L84,198 L74,202 Z', color: '#059669' },
      { id: 'meniscus',          name: 'Meniscus / joint line',  detail: 'Joint-line pain, locking, or catching — needs caution.', path: 'M46,186 L74,186 L74,200 L46,200 Z', color: '#D97706' },
      { id: 'acl_pcl',           name: 'ACL/PCL instability',    detail: 'Giving way, pop, swelling, or instability → medical-first.', path: 'M52,185 L68,185 L68,195 L52,195 Z', color: '#DC2626', opacity: 0.8 },
    ],
  },
};

const BODY_FRONT = `
  M60,8 m-13,0 a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0
  M52,34 C44,36 38,44 37,52 L35,68 L40,70 L42,58 L42,110
    C38,112 36,118 36,124 L34,140 L30,142 L28,160 L32,162
    L30,175 L34,178 L35,200 L32,220 L34,232 L40,234
    L42,258 L46,260 L50,258 L52,240 L52,195 L54,175
    L60,178 L66,175 L68,195 L68,240 L70,258 L74,260
    L78,258 L80,234 L86,232 L88,220 L85,200 L86,178
    L90,175 L88,162 L92,160 L90,142 L86,140 L84,124
    C84,118 82,112 78,110 L78,58 L80,70 L85,68 L83,52
    C82,44 76,36 68,34 Z
  M42,58 L28,68 L26,100 L30,102 L34,80 L37,110
  M78,58 L92,68 L94,100 L90,102 L86,80 L83,110
`;

const BODY_BACK = `
  M60,8 m-13,0 a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0
  M52,34 C44,36 38,44 37,52 L35,68 L40,70 L42,58 L42,110
    C38,112 36,118 36,124 L34,140 L30,142 L28,160 L32,162
    L30,175 L34,178 L35,200 L32,220 L34,232 L40,234
    L42,258 L46,260 L50,258 L52,240 L52,195 L54,175
    L60,178 L66,175 L68,195 L68,240 L70,258 L74,260
    L78,258 L80,234 L86,232 L88,220 L85,200 L86,178
    L90,175 L88,162 L92,160 L90,142 L86,140 L84,124
    C84,118 82,112 78,110 L78,58 L80,70 L85,68 L83,52
    C82,44 76,36 68,34 Z
  M42,58 L28,68 L26,100 L30,102 L34,80 L37,110
  M78,58 L92,68 L94,100 L90,102 L86,80 L83,110
  M40,112 C36,120 36,130 38,138
  M80,112 C84,120 84,130 82,138
  M44,140 C40,144 38,150 38,155 L40,168
  M76,140 C80,144 82,150 82,155 L80,168
`;

function Tooltip({ x, y, name, detail, visible }) {
  if (!visible) return null;
  const side = x > 70 ? 'right' : 'left';
  return (
    <g style={{ pointerEvents: 'none' }}>
      {side === 'right' ? (
        <>
          <line x1={x - 8} y1={y} x2={x + 4} y2={y} stroke="#00C896" strokeWidth="0.8" />
          <rect x={x + 4} y={y - 14} width={Math.max(name.length * 5.8, 90)} height={detail ? 30 : 18} rx="4"
            fill="#0F1923" stroke="#00C896" strokeWidth="0.6" />
          <text x={x + 9} y={y - 3} fontSize="7.5" fontWeight="700" fill="white">{name}</text>
          {detail && <text x={x + 9} y={y + 9} fontSize="6" fill="rgba(255,255,255,0.6)">{detail.slice(0, 38)}{detail.length > 38 ? '…' : ''}</text>}
        </>
      ) : (
        <>
          <line x1={x + 8} y1={y} x2={x - 4} y2={y} stroke="#00C896" strokeWidth="0.8" />
          <rect x={x - 4 - Math.max(name.length * 5.8, 90)} y={y - 14} width={Math.max(name.length * 5.8, 90)} height={detail ? 30 : 18} rx="4"
            fill="#0F1923" stroke="#00C896" strokeWidth="0.6" />
          <text x={x - 8 - Math.max(name.length * 5.8, 84)} y={y - 3} fontSize="7.5" fontWeight="700" fill="white">{name}</text>
          {detail && <text x={x - 8 - Math.max(name.length * 5.8, 84)} y={y + 9} fontSize="6" fill="rgba(255,255,255,0.6)">{detail.slice(0, 38)}{detail.length > 38 ? '…' : ''}</text>}
        </>
      )}
    </g>
  );
}

function FullBodyView({ side, onSelect, selectedId }) {
  const [hovered, setHovered] = useState(null);
  const groups = MUSCLE_GROUPS[side] || [];

  return (
    <svg
      viewBox="10 0 110 275"
      style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto', overflow: 'visible' }}
      aria-label="Human anatomy diagram, front view"
    >
      <path
        d={side === 'front' ? BODY_FRONT : BODY_BACK}
        fill="#E2E8F0"
        stroke="#CBD5E1"
        strokeWidth="0.8"
        fillRule="evenodd"
      />

      {groups.map((g) => {
        const isHov = hovered === g.id;
        const isSel = selectedId === g.id;
        return (
          <g
            key={g.id}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(g.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(g.id)}
          >
            <path
              d={g.path}
              fill={isSel ? g.color : isHov ? g.color : g.color}
              fillOpacity={isSel ? 0.85 : isHov ? 0.7 : 0.35}
              stroke={g.color}
              strokeWidth={isSel ? 1.2 : isHov ? 1 : 0.5}
              style={{ transition: 'fill-opacity 0.15s, stroke-width 0.15s' }}
            />
            {(isHov || isSel) && (
              <Tooltip
                x={g.tip.x}
                y={g.tip.y}
                name={g.name}
                visible
              />
            )}
          </g>
        );
      })}

      {groups.map((g) => (
        (!hovered || hovered !== g.id) && !(selectedId === g.id) && (
          <text
            key={`lbl-${g.id}`}
            x={g.labelX}
            y={g.labelY + 3}
            fontSize="5.5"
            fontWeight="700"
            fill={g.color}
            textAnchor="middle"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {g.name.split(' / ')[0]}
          </text>
        )
      ))}
    </svg>
  );
}

function ZoomView({ groupId, selectedMuscle, onMuscleSelect, onBack }) {
  const [hovered, setHovered] = useState(null);
  const data = ZOOM_DATA[groupId];
  if (!data) return null;

  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, color: '#6B7C8F',
          marginBottom: 12, padding: '4px 0',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#0F1923'}
        onMouseLeave={e => e.currentTarget.style.color = '#6B7C8F'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        All muscle groups
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{
          background: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: '12px 8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7C8F', marginBottom: 4 }}>
            {data.title}
          </span>
          <svg
            viewBox={data.viewBox}
            style={{ width: '100%', maxWidth: 140, overflow: 'visible' }}
            aria-label={`Detailed anatomy of ${data.title}`}
          >
            <path
              d={BODY_FRONT}
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              fillRule="evenodd"
            />
            {data.muscles.map((m) => {
              const isHov = hovered === m.id;
              const isSel = selectedMuscle === m.id;
              return (
                <g
                  key={m.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onMuscleSelect(m.id)}
                >
                  <path
                    d={m.path}
                    fill={m.color}
                    fillOpacity={isSel ? 0.92 : isHov ? 0.75 : (m.opacity || 0.45)}
                    stroke={m.color}
                    strokeWidth={isSel ? 1.5 : isHov ? 1 : 0.4}
                    style={{ transition: 'fill-opacity 0.15s' }}
                  />
                  {isSel && (
                    <circle
                      cx={(() => {
                        try {
                          const coords = m.path.match(/[ML]\s*([\d.]+),([\d.]+)/g);
                          if (!coords || coords.length === 0) return 60;
                          const pts = coords.map(c => {
                            const [, x, y] = c.match(/[ML]\s*([\d.]+),([\d.]+)/);
                            return [parseFloat(x), parseFloat(y)];
                          });
                          return pts.reduce((s, p) => s + p[0], 0) / pts.length;
                        } catch { return 60; }
                      })()}
                      cy={(() => {
                        try {
                          const coords = m.path.match(/[ML]\s*([\d.]+),([\d.]+)/g);
                          if (!coords || coords.length === 0) return 150;
                          const pts = coords.map(c => {
                            const [, x, y] = c.match(/[ML]\s*([\d.]+),([\d.]+)/);
                            return [parseFloat(x), parseFloat(y)];
                          });
                          return pts.reduce((s, p) => s + p[1], 0) / pts.length;
                        } catch { return 150; }
                      })()}
                      r="3"
                      fill="white"
                      stroke={m.color}
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.muscles.map((m) => {
            const isSel = selectedMuscle === m.id;
            const isHov = hovered === m.id;
            return (
              <button
                key={m.id}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onMuscleSelect(isSel ? null : m.id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 2,
                  padding: '10px 12px',
                  background: isSel ? '#0F1923' : isHov ? '#F1F5F9' : '#FFFFFF',
                  border: `1.5px solid ${isSel ? '#0F1923' : isHov ? m.color : '#E2E8F0'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: m.color, flexShrink: 0,
                    boxShadow: isSel ? `0 0 0 2px rgba(255,255,255,0.3)` : 'none',
                  }} />
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: isSel ? 'white' : '#0F1923',
                  }}>
                    {m.name}
                  </span>
                  {isSel && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                      color: '#00C896', background: 'rgba(0,200,150,0.15)',
                      padding: '2px 8px', borderRadius: 20,
                    }}>Selected</span>
                  )}
                </div>
                {(isSel || isHov) && (
                  <span style={{
                    fontSize: 11, color: isSel ? 'rgba(255,255,255,0.65)' : '#6B7C8F',
                    lineHeight: 1.5, paddingLeft: 18,
                  }}>
                    {m.detail}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AnatomySelector({ assessment, setAssessment }) {
  const [side, setSide] = useState('front');
  const [zoomed, setZoomed] = useState(assessment.primaryRegion || null);

  function handleGroupSelect(groupId) {
    setZoomed(groupId);
    setAssessment({ ...assessment, primaryRegion: groupId, exactArea: '' });
  }

  function handleMuscleSelect(muscleId) {
    setAssessment({ ...assessment, exactArea: muscleId });
  }

  function handleBack() {
    setZoomed(null);
    setAssessment({ ...assessment, exactArea: '' });
  }

  const zoomData = zoomed ? ZOOM_DATA[zoomed] : null;
  const selectedMuscleData = zoomed && assessment.exactArea
    ? ZOOM_DATA[zoomed]?.muscles?.find(m => m.id === assessment.exactArea)
    : null;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      border: '1px solid rgba(15, 25, 35, 0.08)',
      borderRadius: 28,
      padding: 28,
      marginTop: 22,
      boxShadow: '0 24px 60px rgba(15, 25, 35, 0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00C896', marginBottom: 3 }}>
            {zoomed ? 'Step 2 — Choose exact injury point' : 'Step 1 — Tap the area that hurts'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1923' }}>
            {zoomed
              ? `${zoomData?.title || ''} — tap the muscle you feel`
              : 'Tap the area where you feel it'}
          </div>
        </div>
        {!zoomed && (
          <div style={{
            display: 'flex', gap: 0,
            background: '#F1F5F9', borderRadius: 999, padding: 3,
          }}>
            {['front', 'back'].map(s => (
              <button
                key={s}
                onClick={() => setSide(s)}
                style={{
                  padding: '6px 14px', borderRadius: 999,
                  background: side === s ? '#0F1923' : 'transparent',
                  color: side === s ? 'white' : '#6B7C8F',
                  fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {!zoomed ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          <div>
            <FullBodyView
              side={side}
              onSelect={handleGroupSelect}
              selectedId={assessment.primaryRegion}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9AABB8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {side === 'front' ? 'Front view' : 'Back view'}
            </div>
            {MUSCLE_GROUPS[side].map(g => {
              const isSel = assessment.primaryRegion === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => handleGroupSelect(g.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    background: isSel ? '#0F1923' : '#F8FAFC',
                    border: `1.5px solid ${isSel ? '#0F1923' : '#E2E8F0'}`,
                    borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.background = '#F1F5F9'; } }}
                  onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; } }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: isSel ? 'white' : '#0F1923' }}>{g.name}</span>
                  {isSel && (
                    <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div style={{ marginTop: 4, padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>
                Can't find it? Toggle front ↔ back view above.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <ZoomView
          groupId={zoomed}
          selectedMuscle={assessment.exactArea}
          onMuscleSelect={handleMuscleSelect}
          onBack={handleBack}
        />
      )}

      {(assessment.primaryRegion || assessment.exactArea) && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(0,200,150,0.04))',
          border: '1px solid rgba(0,200,150,0.25)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assessment.primaryRegion && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0F1923' }}>
                Region: {MUSCLE_GROUPS.front.concat(MUSCLE_GROUPS.back).find(g => g.id === assessment.primaryRegion)?.name || assessment.primaryRegion}
              </span>
            )}
            {selectedMuscleData && (
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                Muscle: {selectedMuscleData.name}
              </span>
            )}
            {!assessment.exactArea && zoomed && (
              <span style={{ fontSize: 11, color: '#6B7C8F' }}>
                Select a specific muscle above for a more targeted plan
              </span>
            )}
          </div>
          {zoomed && assessment.exactArea && (
            <button
              onClick={() => { setZoomed(null); }}
              style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                color: '#00C896', background: 'rgba(0,200,150,0.1)',
                border: '1px solid rgba(0,200,150,0.3)', borderRadius: 20,
                padding: '4px 10px', cursor: 'pointer',
              }}
            >
              ✓ Confirmed
            </button>
          )}
        </div>
      )}
    </div>
  );
}

