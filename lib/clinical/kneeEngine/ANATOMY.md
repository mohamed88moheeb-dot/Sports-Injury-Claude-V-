# Knee Anatomy — what to show in the selector

The knee is a **joint**, not a single muscle belly, so the selectable parts are a
mix of surface-palpable landmarks (clickable on the body map) and internal
structures (list-only, like the quad engine's deep muscle / tendons). Each maps
to a `KNEE_STRUCTURES` id and routes to an engine entity.

## Recommended selectable parts

| Display label | `structure` id | Surface-clickable? | Routes to |
|---|---|---|---|
| **Front of the knee / kneecap** | `patellofemoral_joint` | ✅ (anterior knee zone) | Patellofemoral pain → also patellar instability if dislocation |
| **Kneecap tendon (below kneecap)** | `patellar_tendon` | ✅ (infrapatellar zone) | **Quad engine** (patellar tendinopathy / rupture) |
| **Quad tendon (above kneecap)** | `quad_tendon` | ✅ (suprapatellar zone) | **Quad engine** |
| **Bump below the kneecap (tibial tubercle)** | `tibial_tubercle` | ✅ (tibial tuberosity) | Osgood-Schlatter (adolescents) |
| **Inner knee (medial)** | `mcl` | ✅ (medial joint line) | MCL — or medial meniscus by mechanism |
| **Outer knee (lateral)** | `lcl` | ✅ (lateral joint line) | LCL/PLC — or ITB / lateral meniscus by mechanism |
| **Outer-knee band (IT band)** | `itb_lateral_knee` | ✅ (lateral, above joint) | IT band syndrome |
| **Inner meniscus (cartilage)** | `medial_meniscus` | ❌ list-only (internal) | Meniscus tear |
| **Outer meniscus (cartilage)** | `lateral_meniscus` | ❌ list-only (internal) | Meniscus tear |
| **ACL (front cruciate, internal)** | `acl` | ❌ list-only (internal) | ACL injury |
| **PCL (back cruciate, internal)** | `pcl` | ❌ list-only (internal) | PCL injury |
| **Deep in the joint / not sure** | `knee_general` | ✅ (whole-knee zone) | Mechanism-driven routing |

## Why some are list-only

ACL, PCL, and the menisci are **inside** the joint with no surface projection — a
user can't point to them on a silhouette. As with the quad engine's deep
vastus intermedius and tendons, these appear in the **"Select specific" dropdown**
(`listOnly: true`) rather than as clickable body shapes. The mechanism questions
in the assessment then confirm the entity (e.g. ACL ← non-contact pivot + pop +
immediate swelling; PCL ← dashboard/hyperflexion).

## How the router resolves overlaps

Several surface zones map to more than one structure (e.g. medial joint line =
MCL **or** medial meniscus). The engine resolves this with the **mechanism +
signal** answers:
- Medial pain + **valgus blow** → MCL; + **twisting + joint-line tenderness** → meniscus.
- Lateral pain + **varus blow** → LCL/PLC; + **gradual running** → ITB; + **twisting** → lateral meniscus.
- Anterior pain + **squat pain** → patellofemoral; + **dislocation/recurrent** → patellar instability; + **adolescent tubercle** → Osgood-Schlatter.

## Red-flag zones → in-person care (never self-managed)

A **locked knee** (can't fully straighten), **gross giving-way**, **immediate large
swelling**, **inability to bear weight**, a **hot/febrile joint**, or a
**high-energy / posterolateral** pattern all route to a referral regardless of
which structure was tapped.

## Future art note

To make the internal structures (ACL/PCL/menisci) and the extensor tendons
tappable, the body-map SVG would need small labelled zones (a cut-away or a
secondary "inside the joint" view). Until then they live in the dropdown — the
routing and assessment behind them are already built.
