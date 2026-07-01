/**
 * build_anatomy_v2.mjs
 * ---------------------------------------------------------------------------
 * Regenerates public/anatomy_selector_v2.svg from the pristine original by
 * injecting high-precision anatomical sub-region groups. Idempotent: always
 * reads the untouched original, so re-running never compounds edits.
 *
 * New shapes reuse the original's gray fill classes so they are invisible in
 * the resting body map (exactly like the existing vastus/hamstring detail
 * paths) and only appear when the app adds a highlight class on selection.
 * ---------------------------------------------------------------------------
 */
import { readFileSync, writeFileSync } from 'fs';

const SRC = 'public/anatomy_selector.svg';   // pristine, never written
const OUT = 'public/anatomy_selector_v2.svg';

/* ── path helpers ─────────────────────────────────────────────────────────
 * All coordinates are in SVG user units (viewBox 0 0 95.23 88.67).
 * Front figure midline x≈18.95; back figure midline x≈75.85. */

// Smooth closed blob through points via Catmull-Rom → cubic bezier.
function blob(points, k = 1) {
  const p = points;
  const n = p.length;
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * k;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * k;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * k;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * k;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}
function ellipse(cx, cy, rx, ry) {
  return `M${f(cx - rx)},${f(cy)}a${f(rx)},${f(ry)} 0 1,0 ${f(rx * 2)},0a${f(rx)},${f(ry)} 0 1,0 ${f(-rx * 2)},0Z`;
}
// small circular marker for internal (list-only) structures
function pin(cx, cy, r = 0.9) { return ellipse(cx, cy, r, r); }
const f = (n) => (+n).toFixed(2);

// mirror an x about a figure midline
const mfront = (x) => 2 * 18.95 - x;
const mback = (x) => 2 * 75.85 - x;

const CLS = 'st52';          // neutral gray #424242, matches body
const CLS_IN = 'st52';       // internal markers share the gray (invisible at rest)

// Collect groups as {id, label, internal, d}
const groups = [];
function G(id, label, d, internal = false) {
  groups.push({ id, label, internal, d });
}
// Non-clickable context shapes (bone/cartilage outlines) that make a joint
// read correctly. Rendered behind the clickable structures, same gray.
const contextPaths = [];
const CTX = (d) => contextPaths.push(d);
// Add a bilateral pair given a right-side (low-x for front) shape builder.
function pair(idBase, label, buildAtX, internal, mirror) {
  // buildAtX receives a sign helper; we just build twice with mirrored xs.
  // Simpler: caller passes explicit right & left d via arrays.
}

/* =========================================================================
 * FRONT — KNEE   (group front_knee: x11.27–26.64, y58.08–66.70)
 * right knee center ≈ (13.6, 61.8), left knee center ≈ (24.3, 61.8)
 * ========================================================================= */
function kneeFront(cx, tag) {
  // med = direction toward the body midline (medial/inner); lat = outer.
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  const mx = (u) => cx + med * u;   // medial offset in user units
  const lx = (u) => cx + lat * u;   // lateral offset

  /* ---- clickable injury structures (anatomically shaped & placed).
   * Kept within the existing leg outline so they blend at rest (same gray)
   * and only stand out when the app highlights the selected structure. ---- */
  // quadriceps tendon — fans from the quad above, tapering onto the patella
  G(`front_quad_tendon_${tag}`, 'Quadriceps tendon (above kneecap)',
    blob([[cx - 0.9, 57.1], [cx + 0.9, 57.1], [cx + 0.62, 59.2], [cx + 0.22, 59.6],
          [cx - 0.22, 59.6], [cx - 0.62, 59.2]]));
  // patella (patellofemoral joint) — rounded top, blunt point below
  G(`front_patellofemoral_${tag}`, 'Front of knee / kneecap (patellofemoral)',
    blob([[cx, 59.15], [cx + 0.98, 59.75], [cx + 0.9, 61.1], [cx, 62.4],
          [cx - 0.9, 61.1], [cx - 0.98, 59.75]]));
  // patellar tendon — patella apex down to the tibial tubercle
  G(`front_patellar_tendon_${tag}`, 'Patellar tendon (below kneecap)',
    blob([[cx - 0.6, 62.5], [cx + 0.6, 62.5], [cx + 0.74, 64.9], [cx - 0.74, 64.9]]));
  // tibial tubercle — bony bump at the tendon insertion
  G(`front_tibial_tubercle_${tag}`, 'Shin bump below kneecap (tibial tubercle)',
    ellipse(cx, 65.75, 0.8, 0.72));
  // MCL — broad medial collateral band spanning the joint
  G(`front_mcl_${tag}`, 'Inner knee ligament (MCL)',
    blob([[mx(1.75), 60.0], [mx(2.2), 60.35], [mx(2.08), 64.2], [mx(1.63), 63.85]]));
  // LCL — cord-like lateral collateral angling down to the fibular head
  G(`front_lcl_${tag}`, 'Outer knee ligament (LCL)',
    blob([[lx(1.55), 60.1], [lx(1.9), 60.3], [lx(2.25), 63.8], [lx(1.9), 64.0]]));
  // distal IT band — superolateral, toward Gerdy's tubercle
  G(`front_itb_distal_${tag}`, 'Outer-knee band insertion (distal IT band)',
    blob([[lx(1.3), 58.2], [lx(2.0), 58.5], [lx(1.9), 60.8], [lx(1.25), 60.6]]));
  // ACL — anterolateral femur → anteromedial tibia (lat-top to med-bottom)
  G(`front_acl_${tag}`, 'ACL (front cruciate — internal)',
    blob([[lx(0.55), 61.5], [lx(0.15), 61.65], [mx(0.62), 63.6], [mx(0.22), 63.75]]), true);
  // PCL — posteromedial femur → posterolateral tibia, crossing the ACL
  G(`front_pcl_${tag}`, 'PCL (back cruciate — internal)',
    blob([[mx(0.15), 61.4], [mx(0.55), 61.55], [lx(0.62), 63.7], [lx(0.22), 63.85]]), true);
  // menisci — wedge pads on the tibial plateau at the joint line
  G(`front_medial_meniscus_${tag}`, 'Inner meniscus (cartilage — internal)',
    blob([[mx(0.55), 63.35], [mx(1.15), 63.0], [mx(1.85), 63.3], [mx(1.5), 63.75], [mx(0.9), 63.7]]), true);
  G(`front_lateral_meniscus_${tag}`, 'Outer meniscus (cartilage — internal)',
    blob([[lx(0.55), 63.35], [lx(1.15), 63.0], [lx(1.85), 63.3], [lx(1.5), 63.75], [lx(0.9), 63.7]]), true);
}
kneeFront(13.6, 'r');
kneeFront(24.3, 'l');

/* =========================================================================
 * FRONT — ANKLE  (front_ankle x11.48–26.48, y79.39–85.19)
 * right ankle center ≈ (13.1, 82.3), left ankle center ≈ (24.8, 82.3)
 * ========================================================================= */
function ankleFront(cx, tag) {
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  // syndesmosis / AITFL — high ankle, anterior-central, just above mortise
  G(`front_syndesmosis_${tag}`, 'High ankle (syndesmosis / AITFL)',
    ellipse(cx, 80.3, 1.0, 0.9));
  // lateral ligament complex ATFL/CFL — antero-inferior to lateral malleolus
  G(`front_ankle_lateral_lig_${tag}`, 'Outer ankle ligaments (ATFL / CFL)',
    ellipse(cx + lat * 1.15, 82.7, 0.9, 1.35));
  // deltoid ligament — medial, inferior to medial malleolus
  G(`front_ankle_deltoid_lig_${tag}`, 'Inner ankle ligament (deltoid)',
    ellipse(cx + med * 1.15, 82.7, 0.9, 1.35));
  // peroneal tendons — posterior to lateral malleolus (internal on front)
  G(`front_peroneal_tendons_${tag}`, 'Peroneal tendons (behind outer ankle)',
    pin(cx + lat * 1.5, 81.2, 0.6), true);
  // posterior tibial tendon — posterior to medial malleolus (internal on front)
  G(`front_post_tib_tendon_${tag}`, 'Posterior tibial tendon (behind inner ankle)',
    pin(cx + med * 1.5, 81.2, 0.6), true);
}
ankleFront(13.1, 'r');
ankleFront(24.8, 'l');

/* =========================================================================
 * FRONT — SHIN / lower leg  (leg centerline right≈13.5, left≈24.4)
 * ========================================================================= */
function shinFront(cx, tag) {
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  // tibialis anterior — anterolateral shin, just lateral to the tibial crest
  G(`front_tibialis_anterior_${tag}`, 'Shin muscle (tibialis anterior)',
    blob([[cx + med * 0.2, 61.0], [cx + med * 1.6, 62.5], [cx + med * 1.5, 71], [cx + med * 0.9, 77.5],
          [cx + med * 0.1, 77.0], [cx + med * 0.2, 68]]));
  // peroneals / fibularis — lateral compartment
  G(`front_peroneals_${tag}`, 'Outer-shin muscles (peroneals / fibularis)',
    blob([[cx + lat * 1.4, 63.0], [cx + lat * 2.2, 65], [cx + lat * 2.0, 73], [cx + lat * 1.3, 75.5],
          [cx + lat * 0.9, 71], [cx + lat * 1.0, 65.5]]));
  // tibialis posterior / deep posterior compartment — medial, deep (internal)
  G(`front_tibialis_posterior_${tag}`, 'Deep calf (tibialis posterior)',
    pin(cx + med * 1.7, 69, 0.7), true);
}
shinFront(13.5, 'r');
shinFront(24.4, 'l');

/* =========================================================================
 * BACK — CALF  (back calves: right cx≈69.8, left cx≈82.0, y59.5–85)
 * ========================================================================= */
function calfBack(cx, tag) {
  const med = cx < 75.85 ? 1 : -1, lat = -med;
  // gastrocnemius medial head — upper, medial, the prominent inner belly
  G(`back_gastroc_medial_${tag}`, 'Inner calf (gastrocnemius medial head)',
    blob([[cx + med * 0.2, 60.2], [cx + med * 1.8, 62.0], [cx + med * 2.0, 66.5], [cx + med * 1.1, 69.5],
          [cx + med * 0.1, 68.5], [cx + med * 0.0, 63.5]]));
  // gastrocnemius lateral head — upper, lateral
  G(`back_gastroc_lateral_${tag}`, 'Outer calf (gastrocnemius lateral head)',
    blob([[cx + lat * 0.2, 60.0], [cx + lat * 1.7, 61.8], [cx + lat * 1.9, 66], [cx + lat * 1.0, 68.8],
          [cx + lat * 0.1, 67.8], [cx + lat * 0.0, 63.2]]));
  // soleus — deeper, lower, flanks the achilles
  G(`back_soleus_${tag}`, 'Deep calf (soleus)',
    blob([[cx, 67.5], [cx + med * 1.4, 69.5], [cx + med * 1.1, 75], [cx + med * 0.4, 78],
          [cx + lat * 0.4, 78], [cx + lat * 1.1, 75], [cx + lat * 1.4, 69.5]]));
  // achilles tendon — distal posterior, narrow
  G(`back_achilles_${tag}`, 'Achilles tendon',
    blob([[cx - 0.55, 77.5], [cx + 0.55, 77.5], [cx + 0.7, 81], [cx + 0.45, 84], [cx - 0.45, 84], [cx - 0.7, 81]]));
}
calfBack(69.8, 'r');
calfBack(82.0, 'l');

/* =========================================================================
 * FRONT — HIP FLEXOR  (front_iliopsoas x13.26–24.42, y34.85–38.77)
 * ========================================================================= */
function hipFlexorFront(cx, tag) {
  const med = cx < 18.95 ? 1 : -1;
  // iliopsoas — deep anterior hip / groin, medial to ASIS (largely internal)
  G(`front_iliopsoas_${tag}`, 'Hip flexor (iliopsoas)',
    blob([[cx + med * 0.2, 35.0], [cx + med * 1.6, 35.6], [cx + med * 1.9, 38.2], [cx + med * 1.1, 40.0],
          [cx + med * 0.3, 39.5], [cx + med * 0.1, 37]]));
  // rectus femoris proximal origin — AIIS marker, top of thigh below ASIS
  G(`front_rf_origin_${tag}`, 'Thigh-tendon origin at hip (AIIS)',
    pin(cx + med * 0.4, 36.4, 0.75), true);
}
hipFlexorFront(15.4, 'r');
hipFlexorFront(22.5, 'l');

/* =========================================================================
 * FRONT — ABDUCTOR / TFL  (front_tensor_fasciae_latae x9.9–28, y32.16–37.02)
 * lateral hip bulge: right≈11.8, left≈26.1
 * ========================================================================= */
function abductorFront(cx, tag) {
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  // gluteus medius — lateral hip, superior to greater trochanter
  G(`front_glute_medius_${tag}`, 'Side-hip muscle (gluteus medius)',
    blob([[cx + lat * 0.3, 32.4], [cx + lat * 1.3, 33.2], [cx + lat * 1.4, 36.5], [cx + lat * 0.6, 38.2],
          [cx + med * 0.3, 37.5], [cx + med * 0.2, 34]]));
  // gluteus minimus — deep to medius (internal)
  G(`front_glute_minimus_${tag}`, 'Deep side-hip muscle (gluteus minimus)',
    pin(cx + lat * 0.6, 35.4, 0.7), true);
  // greater trochanteric bursa — lateral bony point
  G(`front_trochanteric_bursa_${tag}`, 'Outer-hip bursa (greater trochanter)',
    pin(cx + lat * 1.3, 38.4, 0.75), true);
}
abductorFront(11.8, 'r');
abductorFront(26.1, 'l');

/* =========================================================================
 * BACK — GLUTES  (back_glutes x67.32–84.4, y31.65–44.38)
 * right cheek cx≈71.5, left cheek cx≈80.2
 * ========================================================================= */
function glutesBack(cx, tag) {
  const med = cx < 75.85 ? 1 : -1, lat = -med;
  // gluteus maximus — the main cheek
  G(`back_glute_maximus_${tag}`, 'Main buttock muscle (gluteus maximus)',
    blob([[cx, 33.2], [cx + lat * 3.0, 34.5], [cx + lat * 3.3, 40], [cx + lat * 1.8, 43.6],
          [cx + med * 0.3, 43.9], [cx + med * 0.6, 38]]));
  // gluteus medius — upper-outer, above maximus
  G(`back_glute_medius_${tag}`, 'Upper buttock muscle (gluteus medius)',
    blob([[cx + lat * 1.2, 31.9], [cx + lat * 3.0, 32.6], [cx + lat * 3.2, 35.5], [cx + lat * 2.0, 36.6],
          [cx + lat * 0.9, 35.5], [cx + lat * 0.9, 33.4]]));
  // gluteus minimus — deep (internal)
  G(`back_glute_minimus_${tag}`, 'Deep buttock muscle (gluteus minimus)',
    pin(cx + lat * 2.2, 35.0, 0.7), true);
  // piriformis — deep, mid-glute (internal)
  G(`back_piriformis_${tag}`, 'Deep hip rotator (piriformis)',
    pin(cx + lat * 0.6, 37.6, 0.75), true);
  // proximal hamstring origin — ischial tuberosity, lower glute fold
  G(`back_hamstring_origin_${tag}`, 'Hamstring origin (sit bone / ischial tuberosity)',
    pin(cx + med * 0.4, 43.4, 0.8), true);
}
glutesBack(71.5, 'r');
glutesBack(80.2, 'l');

/* =========================================================================
 * BACK — UPPER/MID BACK  (back_back x65.67–85.99, y6.22–29.15, mid 75.85)
 * ========================================================================= */
// trapezius — kite from neck across the shoulders, tapering down the spine
G('back_trapezius', 'Upper-back muscle (trapezius)',
  blob([[75.85, 6.4], [70.6, 8.6], [67.7, 11.2], [70.2, 15.0], [73.2, 18.6],
        [75.85, 20.2], [78.5, 18.6], [81.5, 15.0], [84.0, 11.2], [81.1, 8.6]]));
// latissimus dorsi — broad lower-lateral sheets down to the flank
function latBack(cx, tag) {
  const med = cx < 75.85 ? 1 : -1, lat = -med;
  // broad sheet: narrow near the spine up top, flaring down-and-out to the flank
  G(`back_latissimus_${tag}`, 'Broad back muscle (latissimus dorsi)',
    blob([[cx + med * 1.55, 18.2], [cx + med * 0.1, 19.2], [cx + lat * 3.2, 21.0],
          [cx + lat * 5.4, 24.2], [cx + lat * 4.2, 27.6], [cx + lat * 0.8, 28.8],
          [cx + med * 1.4, 27.4], [cx + med * 1.7, 22.0]]));
}
latBack(74.0, 'r');
latBack(77.7, 'l');
// rhomboids — deep, between the shoulder blades (internal)
G('back_rhomboid_r', 'Between-shoulderblade muscle (rhomboids)', pin(73.4, 14.2, 0.8), true);
G('back_rhomboid_l', 'Between-shoulderblade muscle (rhomboids)', pin(78.3, 14.2, 0.8), true);

/* =========================================================================
 * BACK — LOWER BACK  (back_lower_back x70.9–80.77, y21.23–33.39, mid 75.85)
 * ========================================================================= */
function lowerBack(cx, tag) {
  const med = cx < 75.85 ? 1 : -1, lat = -med;
  // erector spinae — paraspinal column
  G(`back_erector_spinae_${tag}`, 'Lower-back muscle column (erector spinae)',
    blob([[cx + lat * 0.7, 21.6], [cx + med * 0.7, 21.8], [cx + med * 0.6, 31.8],
          [cx + lat * 0.6, 32.4], [cx + lat * 0.9, 27]]));
  // quadratus lumborum — deeper & lateral (internal)
  G(`back_quadratus_lumborum_${tag}`, 'Deep lower-back muscle (quadratus lumborum)',
    pin(cx + lat * 1.4, 27.5, 0.75), true);
  // sacroiliac joint — at the PSIS / dimple level
  G(`back_si_joint_${tag}`, 'Sacroiliac (SI) joint', pin(cx + med * 0.2, 32.4, 0.8), true);
  // facet joint — paraspinal (internal)
  G(`back_facet_joint_${tag}`, 'Spinal facet joint', pin(cx + lat * 0.15, 24.6, 0.6), true);
}
lowerBack(74.1, 'r');
lowerBack(77.6, 'l');

/* =========================================================================
 * FRONT — CHEST  (front_chest x10.27–27.61, y7.79–17.23)
 * right pec cx≈14.43, left pec cx≈23.45
 * ========================================================================= */
function chestFront(cx, tag) {
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  // clavicular head — upper pec
  G(`front_pec_clavicular_${tag}`, 'Upper chest (pec — clavicular head)',
    blob([[cx + lat * 3.0, 8.7], [cx, 8.0], [cx + med * 3.0, 8.9], [cx + med * 2.5, 10.9],
          [cx, 11.4], [cx + lat * 2.7, 10.9]]));
  // sternal head — lower/main pec
  G(`front_pec_sternal_${tag}`, 'Main chest (pec — sternal head)',
    blob([[cx + lat * 3.2, 11.6], [cx, 11.8], [cx + med * 3.1, 11.7], [cx + med * 2.7, 14.8],
          [cx, 16.9], [cx + lat * 2.9, 15.2]]));
  // distal pec tendon — at the axillary fold (lateral edge near armpit)
  G(`front_pec_tendon_${tag}`, 'Chest tendon at armpit (distal pec)',
    blob([[cx + lat * 3.4, 11.8], [cx + lat * 4.0, 12.2], [cx + lat * 3.7, 14.3], [cx + lat * 3.1, 13.9]]), true);
}
chestFront(14.43, 'r');
chestFront(23.45, 'l');

/* =========================================================================
 * FRONT — ABDOMEN  (front_abdomen x14.26–23.62, y16.62–28.64, mid 18.95)
 * ========================================================================= */
// linea alba — thin midline seam
G('front_linea_alba', 'Midline seam of the abs (linea alba)',
  blob([[18.6, 16.9], [19.3, 16.9], [19.3, 28.3], [18.6, 28.3]]));
// rectus abdominis columns (the "six-pack")
function rectusAb(cx, tag) {
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  G(`front_rectus_abdominis_${tag}`, 'Six-pack muscle (rectus abdominis)',
    blob([[cx + med * 1.7, 17.1], [cx + lat * 1.7, 17.3], [cx + lat * 1.9, 22.5],
          [cx + lat * 1.6, 27.8], [cx + med * 1.5, 27.9], [cx + med * 1.7, 22.5]]));
}
rectusAb(16.9, 'r');
rectusAb(21.0, 'l');

/* =========================================================================
 * FRONT — OBLIQUES  (front_obliques x11.18–26.71, y18.22–34.85)
 * ========================================================================= */
function obliquesFront(cx, tag) {
  const med = cx < 18.95 ? 1 : -1, lat = -med;
  // external oblique — visible flank muscle
  G(`front_external_oblique_${tag}`, 'Side-ab muscle (external oblique)',
    blob([[cx + med * 1.3, 19.6], [cx + lat * 1.3, 19.2], [cx + lat * 1.5, 25],
          [cx + lat * 0.4, 31.5], [cx + med * 1.0, 30.5], [cx + med * 1.4, 24.5]]));
  // internal oblique — deeper (internal)
  G(`front_internal_oblique_${tag}`, 'Deep side-ab muscle (internal oblique)',
    pin(cx, 27, 0.8), true);
  // serratus–oblique interdigitation — "side strain" spot at the lower ribs
  G(`front_serratus_oblique_${tag}`, 'Side-strain spot (serratus–oblique junction)',
    blob([[cx + lat * 1.2, 18.4], [cx + lat * 0.2, 18.2], [cx + med * 0.6, 20.3], [cx + lat * 0.4, 21.2]]), true);
}
obliquesFront(12.95, 'r');
obliquesFront(24.94, 'l');

/* =========================================================================
 * FRONT — LOWER ABDOMEN  (front_lower_abdomen x14.67–23.21, y28.89–39.47)
 * ========================================================================= */
// lower rectus insertion
G('front_rectus_lower', 'Lower ab / rectus insertion',
  blob([[15.6, 29.4], [22.3, 29.4], [21.9, 34.3], [18.95, 35.6], [16.0, 34.3]]));
// pubic symphysis / conjoint tendon — athletic-pubalgia zone (internal)
G('front_pubic_symphysis', 'Groin/pubic tendon zone (athletic pubalgia)',
  blob([[17.7, 36.2], [20.2, 36.2], [20.0, 38.8], [18.95, 39.3], [17.9, 38.8]]), true);

/* =========================================================================
 * FRONT — SHOULDER / BICEPS / ELBOW / FOREARM (per arm)
 * right: shoulder cx≈8.83; left: cx≈29.03
 * ========================================================================= */
function frontArm(tag, S) {
  const med = S.med, lat = -med;
  const { shx, bix, fox, elx } = S;
  // --- shoulder / rotator cuff ---
  // AC joint — top-outer shoulder (clavicle–acromion)
  G(`front_ac_joint_${tag}`, 'Shoulder-top joint (AC joint)', ellipse(shx + lat * 0.7, 7.5, 0.7, 0.6));
  // supraspinatus — top of the shoulder
  G(`front_supraspinatus_${tag}`, 'Rotator cuff — supraspinatus (top)', ellipse(shx, 8.9, 1.0, 0.8), true);
  // subscapularis — anterior, deep (internal)
  G(`front_subscapularis_${tag}`, 'Rotator cuff — subscapularis (front, deep)', pin(shx + med * 0.7, 10.6, 0.75), true);
  // long head of biceps tendon — anterior groove
  G(`front_biceps_lh_tendon_${tag}`, 'Biceps tendon at shoulder (long head)',
    blob([[shx + med * 0.1, 10.6], [shx + med * 0.6, 10.9], [shx + med * 0.5, 13.2], [shx, 13.0]]), true);
  // glenoid labrum — internal joint rim
  G(`front_labrum_${tag}`, 'Shoulder labrum (internal joint rim)', pin(shx + med * 0.35, 11.6, 0.6), true);
  // --- biceps ---
  G(`front_biceps_long_${tag}`, 'Biceps (long head, outer)',
    blob([[bix + lat * 1.6, 15.4], [bix + lat * 0.3, 15.2], [bix + lat * 0.2, 20.2],
          [bix + lat * 1.3, 20.6], [bix + lat * 1.9, 18]]));
  G(`front_biceps_short_${tag}`, 'Biceps (short head, inner)',
    blob([[bix + med * 1.6, 15.4], [bix + med * 0.3, 15.2], [bix + med * 0.2, 20.2],
          [bix + med * 1.3, 20.6], [bix + med * 1.9, 18]]));
  // distal biceps tendon — elbow crease (internal)
  G(`front_biceps_distal_tendon_${tag}`, 'Distal biceps tendon (elbow crease)', ellipse(bix, 21.3, 0.9, 0.7), true);
  // --- elbow ---
  G(`front_lateral_epicondyle_${tag}`, 'Outer elbow (tennis-elbow / lateral epicondyle)', ellipse(elx + lat * 1.7, 22.4, 0.75, 0.9));
  G(`front_medial_epicondyle_${tag}`, 'Inner elbow (golfer’s-elbow / medial epicondyle)', ellipse(elx + med * 1.7, 22.4, 0.75, 0.9));
  // --- forearm ---
  G(`front_flexor_mass_${tag}`, 'Forearm flexor–pronator mass (inner)',
    blob([[fox + med * 1.5, 23.6], [fox + med * 0.2, 23.8], [fox + med * 0.0, 30],
          [fox + med * 1.1, 31], [fox + med * 1.7, 27]]));
  G(`front_extensor_mass_${tag}`, 'Forearm extensor mass (outer)',
    blob([[fox + lat * 1.5, 23.6], [fox + lat * 0.2, 23.8], [fox + lat * 0.0, 30],
          [fox + lat * 1.1, 31], [fox + lat * 1.7, 27]]));
}
frontArm('r', { shx: 8.83, bix: 8.3, fox: 5.4, elx: 7.2, med: 1 });
frontArm('l', { shx: 29.03, bix: 29.5, fox: 32.4, elx: 30.6, med: -1 });

/* =========================================================================
 * BACK — SHOULDER (posterior cuff) / TRICEPS / ELBOW (per arm)
 * right arm: triceps cx≈64, elbow x≈61.8; left arm: cx≈87.5, elbow x≈89.9
 * ========================================================================= */
function backArm(tag, S) {
  const med = S.med, lat = -med;
  const { trx, elx } = S;
  // posterior rotator cuff on the scapula (medial to the arm)
  G(`back_infraspinatus_${tag}`, 'Rotator cuff — infraspinatus (back)', ellipse(trx + med * 2.6, 13.6, 1.1, 0.9), true);
  G(`back_teres_minor_${tag}`, 'Rotator cuff — teres minor (back)', pin(trx + med * 2.3, 15.9, 0.75), true);
  // triceps heads
  G(`back_triceps_long_${tag}`, 'Triceps (long head)',
    blob([[trx + med * 1.3, 13.6], [trx + med * 0.1, 13.8], [trx + lat * 0.1, 22.5],
          [trx + med * 0.9, 23.0], [trx + med * 1.5, 18]]));
  G(`back_triceps_lateral_${tag}`, 'Triceps (lateral head)',
    blob([[trx + lat * 1.7, 13.8], [trx + lat * 0.4, 14.0], [trx + lat * 0.3, 19.5],
          [trx + lat * 1.3, 20.2], [trx + lat * 1.9, 17]]));
  G(`back_triceps_medial_${tag}`, 'Triceps (medial head, deep)', pin(trx + med * 0.8, 21.0, 0.8), true);
  // distal triceps tendon — posterior elbow (internal)
  G(`back_triceps_tendon_${tag}`, 'Distal triceps tendon (back of elbow)', ellipse(elx + med * 0.4, 23.7, 0.8, 0.7), true);
  // olecranon — bony point of the elbow
  G(`back_olecranon_${tag}`, 'Elbow tip (olecranon)', ellipse(elx, 25.4, 0.8, 0.85));
  // UCL — medial elbow ligament (internal)
  G(`back_ucl_${tag}`, 'Inner elbow ligament (UCL)', pin(elx + med * 1.1, 25.2, 0.65), true);
}
backArm('r', { trx: 64.0, elx: 61.8, med: 1 });
backArm('l', { trx: 87.5, elx: 89.9, med: -1 });

/* =========================================================================
 * NECK  (neck group x12.6–80.71, y0–7.78; front cx≈19, back cx≈74)
 * ========================================================================= */
// front — sternocleidomastoid (anterolateral, diagonal)
G('front_scm_r', 'Front-neck muscle (sternocleidomastoid)',
  blob([[17.9, 1.2], [18.7, 1.4], [16.7, 6.6], [15.9, 6.2]]));
G('front_scm_l', 'Front-neck muscle (sternocleidomastoid)',
  blob([[20.0, 1.2], [19.2, 1.4], [21.2, 6.6], [22.0, 6.2]]));
// back — cervical paraspinal columns
G('back_cervical_paraspinal_r', 'Back-of-neck muscles (cervical paraspinals)',
  blob([[73.2, 0.6], [74.9, 0.7], [74.7, 6.8], [73.1, 6.9], [72.7, 3.6]]));
G('back_cervical_paraspinal_l', 'Back-of-neck muscles (cervical paraspinals)',
  blob([[78.5, 0.6], [76.8, 0.7], [77.0, 6.8], [78.6, 6.9], [79.0, 3.6]]));
// back — levator scapulae (posterolateral, deep, internal)
G('back_levator_scapulae_r', 'Neck-to-shoulderblade muscle (levator scapulae)', pin(71.7, 6.4, 0.7), true);
G('back_levator_scapulae_l', 'Neck-to-shoulderblade muscle (levator scapulae)', pin(80.0, 6.4, 0.7), true);
// back — upper trapezius (neck–shoulder slope)
G('back_upper_trapezius_r', 'Upper-trap / neck-shoulder slope', ellipse(70.5, 8.0, 1.4, 0.9), true);
G('back_upper_trapezius_l', 'Upper-trap / neck-shoulder slope', ellipse(81.2, 8.0, 1.4, 0.9), true);

/* ── inject ─────────────────────────────────────────────────────────────── */
let svg = readFileSync(SRC, 'utf8');

// Build a clip from the union of every existing body fill path so injected
// detail can never spill past the silhouette (guarantees a clean resting map).
// Real <path> copies are used (Chromium does not clip via <use> of a <g>).
const bodyPaths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/>/g)].map((m) => m[1]);
const clip =
  `  <clipPath id="v2_bodyclip" clipPathUnits="userSpaceOnUse">\n` +
  bodyPaths.map((d) => `    <path d="${d}"/>`).join('\n') +
  `\n  </clipPath>\n`;
// place the clipPath just before </defs>
svg = svg.replace('</defs>', clip + '</defs>');

let inner = '';
if (contextPaths.length) {
  inner += '    <g data-context="true">\n';
  for (const d of contextPaths) inner += `      <path class="${CLS}" d="${d}"/>\n`;
  inner += '    </g>\n';
}
for (const g of groups) {
  const cls = g.internal ? CLS_IN : CLS;
  const attr = g.internal ? ' data-internal="true"' : '';
  inner += `    <g id="${g.id}" data-label="${g.label}"${attr}><path class="${cls}" d="${g.d}"/></g>\n`;
}
const inject =
  '\n  <!-- ===== v2 anatomical detail regions (auto-generated, clipped to body) ===== -->\n' +
  `  <g clip-path="url(#v2_bodyclip)">\n${inner}  </g>\n`;
svg = svg.replace('</svg>', inject + '</svg>');
writeFileSync(OUT, svg);

// also emit a manifest for the component/test harness
const manifest = groups.map(({ id, label, internal }) => ({ id, label, internal }));
writeFileSync('public/anatomy_v2_manifest.json', JSON.stringify(manifest, null, 2));
console.log(`injected ${groups.length} groups -> ${OUT}`);
