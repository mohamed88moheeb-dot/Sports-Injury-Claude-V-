/* Anatomy reference content for the 3D anatomy viewer.
   Origin / insertion / action / innervation follow standard anatomy texts
   (Gray's Anatomy, Moore's Clinically Oriented Anatomy). `app` maps a
   structure to the region/exact-area ids used by components/InteractiveAnatomy.jsx
   so a 3D pick can start the normal assessment flow. `conditions` lists
   conditions ROYO covers that involve the structure. */

const m = (o, i, a, n, extra = {}) => ({ origin: o, insertion: i, action: a, nerve: n, ...extra });

export const MUSCLES = {
  'rectus-femoris': m('Anterior inferior iliac spine (straight head) and ilium above the acetabulum (reflected head)', 'Base of patella, then tibial tuberosity via the patellar ligament', 'Extends the knee; flexes the hip', 'Femoral nerve (L2–L4)', {
    note: 'The only quadriceps muscle crossing both hip and knee, which is why it is the one most often strained — typically while kicking or sprinting.' }),
  'vastus-lateralis': m('Greater trochanter and lateral lip of the linea aspera', 'Lateral patella and quadriceps tendon', 'Extends the knee', 'Femoral nerve (L2–L4)', { note: 'Largest of the quadriceps.' }),
  'vastus-medialis': m('Intertrochanteric line and medial lip of the linea aspera', 'Medial patella and quadriceps tendon', 'Extends the knee; its oblique fibres help stabilise the patella', 'Femoral nerve (L2–L4)'),
  'vastus-intermedius': m('Anterior and lateral surfaces of the femoral shaft', 'Deep surface of the quadriceps tendon', 'Extends the knee', 'Femoral nerve (L2–L4)', { note: 'Lies directly on the femur — the muscle most often involved in a deep "dead leg" contusion.' }),
  'sartorius': m('Anterior superior iliac spine', 'Upper medial tibia (pes anserinus)', 'Flexes, abducts and laterally rotates the hip; flexes the knee', 'Femoral nerve (L2–L3)', { note: 'The longest muscle in the body.' }),
  'adductor-brevis': m('Body and inferior ramus of the pubis', 'Pectineal line and upper linea aspera', 'Adducts the hip; assists flexion', 'Obturator nerve (L2–L4)'),
  'adductor-longus': m('Body of the pubis, below the pubic crest', 'Middle third of the linea aspera', 'Adducts and flexes the hip', 'Obturator nerve (L2–L4)', { note: 'The most commonly injured adductor in kicking and change-of-direction sports.' }),
  'adductor-magnus': m('Inferior pubic ramus, ischial ramus and ischial tuberosity', 'Linea aspera and adductor tubercle of the femur', 'Adducts the hip; the hamstring part extends it', 'Obturator nerve and tibial part of the sciatic nerve'),
  'gracilis': m('Body and inferior ramus of the pubis', 'Upper medial tibia (pes anserinus)', 'Adducts the hip; flexes the knee', 'Obturator nerve (L2–L3)'),
  'biceps-femoris': m('Long head: ischial tuberosity. Short head: linea aspera', 'Head of the fibula', 'Flexes the knee; long head extends the hip', 'Sciatic nerve (tibial and common fibular parts)', { note: 'The long head is the most frequently strained hamstring in sprinting.' }),
  'semitendinosus': m('Ischial tuberosity', 'Upper medial tibia (pes anserinus)', 'Flexes the knee; extends the hip; medially rotates the tibia', 'Tibial part of the sciatic nerve (L5–S2)'),
  'semimembranosus': m('Ischial tuberosity', 'Posterior medial tibial condyle', 'Flexes the knee; extends the hip; medially rotates the tibia', 'Tibial part of the sciatic nerve (L5–S2)'),
  'iliacus': m('Iliac fossa', 'Lesser trochanter of the femur (with psoas)', 'Flexes the hip', 'Femoral nerve (L2–L3)'),
  'psoas-major': m('Bodies and transverse processes of T12–L5', 'Lesser trochanter of the femur', 'Flexes the hip; stabilises the lumbar spine', 'Anterior rami of L1–L3'),
  'gluteus-maximus': m('Posterior ilium, sacrum, coccyx and sacrotuberous ligament', 'Iliotibial tract and gluteal tuberosity of the femur', 'Extends and laterally rotates the hip', 'Inferior gluteal nerve (L5–S2)'),
  'gluteus-medius': m('Outer ilium between the anterior and posterior gluteal lines', 'Lateral greater trochanter', 'Abducts the hip; keeps the pelvis level in single-leg stance', 'Superior gluteal nerve (L4–S1)'),
  'gluteus-minimus': m('Outer ilium between the anterior and inferior gluteal lines', 'Anterior greater trochanter', 'Abducts and medially rotates the hip', 'Superior gluteal nerve (L4–S1)'),
  'piriformis': m('Anterior surface of the sacrum', 'Superior greater trochanter', 'Laterally rotates the extended hip; abducts the flexed hip', 'Nerve to piriformis (S1–S2)'),
  'obturator-internus': m('Inner surface of the obturator membrane and surrounding bone', 'Medial greater trochanter', 'Laterally rotates the hip; stabilises the femoral head', 'Nerve to obturator internus (L5–S2)'),
  'gastrocnemius': m('Medial and lateral femoral condyles', 'Calcaneus, via the calcaneal (Achilles) tendon', 'Plantarflexes the ankle; flexes the knee', 'Tibial nerve (S1–S2)', { note: 'Medial head strains are the classic "tennis leg".' }),
  'soleus': m('Soleal line of the tibia and upper posterior fibula', 'Calcaneus, via the calcaneal tendon', 'Plantarflexes the ankle, especially with the knee bent', 'Tibial nerve (S1–S2)'),
  'plantaris': m('Lateral supracondylar line of the femur', 'Calcaneus, medial to the Achilles tendon', 'Weakly plantarflexes the ankle and flexes the knee', 'Tibial nerve (S1–S2)'),
  'popliteus': m('Lateral femoral condyle', 'Posterior tibia above the soleal line', 'Unlocks the extended knee by medially rotating the tibia', 'Tibial nerve (L4–S1)'),
  'tibialis-anterior': m('Lateral tibial condyle and upper lateral tibia', 'Medial cuneiform and base of the first metatarsal', 'Dorsiflexes and inverts the foot', 'Deep fibular nerve (L4–L5)'),
  'tibialis-posterior': m('Posterior tibia, fibula and interosseous membrane', 'Navicular tuberosity and cuneiforms', 'Inverts and plantarflexes the foot; supports the medial arch', 'Tibial nerve (L4–L5)'),
  'extensor-digitorum-longus': m('Lateral tibial condyle, fibula and interosseous membrane', 'Extensor expansions of toes 2–5', 'Extends the toes; dorsiflexes the ankle', 'Deep fibular nerve (L5–S1)'),
  'flexor-digitorum-longus': m('Posterior tibia', 'Distal phalanges of toes 2–5', 'Flexes the toes; plantarflexes and inverts the foot', 'Tibial nerve (S2–S3)'),
  'flexor-digitorum-brevis': m('Medial process of the calcaneal tuberosity', 'Middle phalanges of toes 2–5', 'Flexes the toes; supports the arch', 'Medial plantar nerve (S2–S3)'),
  'fibularis-longus': m('Head and upper lateral fibula', 'Medial cuneiform and base of the first metatarsal', 'Everts and plantarflexes the foot; supports the arch', 'Superficial fibular nerve (L5–S1)'),
  'fibularis-brevis': m('Lower two-thirds of the lateral fibula', 'Tuberosity of the fifth metatarsal', 'Everts and plantarflexes the foot', 'Superficial fibular nerve (L5–S1)'),
  'erector-spinae': m('Sacrum, iliac crest and lumbar/lower thoracic spinous processes', 'Ribs, vertebral processes and mastoid process', 'Extends and side-bends the spine', 'Dorsal rami of spinal nerves'),
  'external-oblique': m('Outer surfaces of ribs 5–12', 'Linea alba, pubic tubercle and anterior iliac crest', 'Flexes and rotates the trunk to the opposite side', 'Thoraco-abdominal nerves (T7–T12)'),
  'pectoralis-major': m('Clavicle, sternum and costal cartilages 1–6', 'Lateral lip of the intertubercular groove of the humerus', 'Adducts, medially rotates and flexes the shoulder', 'Medial and lateral pectoral nerves (C5–T1)'),
  'pectoralis-minor': m('Ribs 3–5', 'Coracoid process of the scapula', 'Draws the scapula forward and down', 'Medial pectoral nerve (C8–T1)'),
  'serratus-anterior': m('Outer surfaces of ribs 1–8', 'Anterior medial border of the scapula', 'Protracts and upwardly rotates the scapula', 'Long thoracic nerve (C5–C7)'),
  'trapezius': m('Occipital bone, nuchal ligament and spinous processes C7–T12', 'Lateral clavicle, acromion and spine of the scapula', 'Elevates, retracts, depresses and upwardly rotates the scapula', 'Accessory nerve (CN XI)'),
  'rhomboid-major': m('Spinous processes of T2–T5', 'Medial border of the scapula', 'Retracts and stabilises the scapula', 'Dorsal scapular nerve (C4–C5)'),
  'levator-scapulae': m('Transverse processes of C1–C4', 'Superior angle of the scapula', 'Elevates the scapula; side-bends the neck', 'Dorsal scapular nerve and C3–C4'),
  'deltoid': m('Lateral clavicle, acromion and spine of the scapula', 'Deltoid tuberosity of the humerus', 'Abducts the shoulder; anterior fibres flex, posterior fibres extend', 'Axillary nerve (C5–C6)'),
  'supraspinatus': m('Supraspinous fossa of the scapula', 'Superior facet of the greater tubercle', 'Initiates abduction; centres the humeral head', 'Suprascapular nerve (C5–C6)', { note: 'The rotator cuff tendon most often affected by tendinopathy and tears.' }),
  'infraspinatus': m('Infraspinous fossa of the scapula', 'Middle facet of the greater tubercle', 'Laterally rotates the shoulder', 'Suprascapular nerve (C5–C6)'),
  'teres-minor': m('Lateral border of the scapula', 'Inferior facet of the greater tubercle', 'Laterally rotates the shoulder', 'Axillary nerve (C5–C6)'),
  'subscapularis': m('Subscapular fossa', 'Lesser tubercle of the humerus', 'Medially rotates the shoulder', 'Upper and lower subscapular nerves (C5–C6)'),
  'teres-major': m('Inferior angle of the scapula', 'Medial lip of the intertubercular groove', 'Adducts, medially rotates and extends the shoulder', 'Lower subscapular nerve (C5–C6)'),
  'biceps-brachii': m('Short head: coracoid process. Long head: supraglenoid tubercle', 'Radial tuberosity and bicipital aponeurosis', 'Flexes the elbow; supinates the forearm', 'Musculocutaneous nerve (C5–C6)'),
  'triceps-brachii': m('Long head: infraglenoid tubercle. Lateral and medial heads: posterior humerus', 'Olecranon of the ulna', 'Extends the elbow; long head extends the shoulder', 'Radial nerve (C6–C8)'),
  'brachioradialis': m('Lateral supracondylar ridge of the humerus', 'Radial styloid process', 'Flexes the elbow in a mid-prone position', 'Radial nerve (C5–C6)'),
  'supinator': m('Lateral epicondyle and supinator crest of the ulna', 'Proximal radius', 'Supinates the forearm', 'Deep branch of the radial nerve (C6)'),
  'pronator-quadratus': m('Distal anterior ulna', 'Distal anterior radius', 'Pronates the forearm', 'Anterior interosseous nerve (C8–T1)'),
  'extensor-carpi-radialis-brevis': m('Lateral epicondyle (common extensor origin)', 'Base of the third metacarpal', 'Extends and radially deviates the wrist', 'Deep branch of the radial nerve (C7–C8)', { note: 'Its origin is the usual site of lateral elbow tendinopathy ("tennis elbow").' }),
  'extensor-carpi-radialis-longus': m('Lateral supracondylar ridge of the humerus', 'Base of the second metacarpal', 'Extends and radially deviates the wrist', 'Radial nerve (C6–C7)'),
  'extensor-carpi-ulnaris': m('Lateral epicondyle and posterior ulna', 'Base of the fifth metacarpal', 'Extends and ulnarly deviates the wrist', 'Posterior interosseous nerve (C7–C8)'),
  'extensor-digitorum': m('Lateral epicondyle (common extensor origin)', 'Extensor expansions of fingers 2–5', 'Extends the fingers and wrist', 'Posterior interosseous nerve (C7–C8)'),
  'flexor-carpi-radialis': m('Medial epicondyle (common flexor origin)', 'Base of the second metacarpal', 'Flexes and radially deviates the wrist', 'Median nerve (C6–C7)'),
  'palmaris-longus': m('Medial epicondyle (common flexor origin)', 'Palmar aponeurosis', 'Flexes the wrist; tenses the palmar fascia', 'Median nerve (C7–C8)', { note: 'Absent in roughly 1 in 7 people.' }),
  'finger-flexors': m('Medial epicondyle, ulna and radius', 'Middle (superficial flexor) and distal (deep flexor) phalanges', 'Flex the fingers and wrist', 'Median and ulnar nerves (C7–T1)'),
  'sternocleidomastoid': m('Manubrium of the sternum and medial clavicle', 'Mastoid process of the temporal bone', 'Flexes the neck; rotates the head to the opposite side', 'Accessory nerve (CN XI)'),
};

export const OTHER = {
  'calcaneal-tendon': { desc: 'The Achilles tendon — the thickest, strongest tendon in the body. It joins gastrocnemius and soleus to the calcaneus and stores energy with every stride.' },
  'long-plantar-ligament': { desc: 'The longest ligament of the sole, running from the calcaneus to the cuboid and metatarsal bases. It supports the lateral longitudinal arch.' },
  'flexor-retinaculum-of-wrist': { desc: 'A fibrous band forming the roof of the carpal tunnel, through which the median nerve and finger flexor tendons pass.' },
  'interosseous-membrane-of-forearm': { desc: 'A fibrous sheet binding the radius and ulna, transferring load between them and giving muscles an attachment surface.' },
  'interosseous-membrane-of-leg': { desc: 'A fibrous sheet between the tibia and fibula that separates the front and back compartments of the lower leg.' },
  'stylohyoid-ligament': { desc: 'A thin ligament from the styloid process of the temporal bone to the hyoid.' },
  'intermediate-tendon': { desc: 'The intermediate tendon of the digastric muscle, looped to the hyoid bone.' },
  femur: { desc: 'The thigh bone — the longest and strongest bone in the body. The quadriceps, hamstrings and adductors act across it.' },
  tibia: { desc: 'The shin bone and main weight-bearing bone of the lower leg. The cruciate and collateral ligaments of the knee attach to it (not modelled in the source data).' },
  fibula: { desc: 'The slender outer bone of the lower leg. It anchors the lateral collateral ligament, biceps femoris and fibularis muscles.' },
  patella: { desc: 'The kneecap — a sesamoid bone in the quadriceps tendon that increases its lever arm. Its cartilage surface is the source of patellofemoral pain.' },
  'hip-bone': { desc: 'The ilium, ischium and pubis fused into one bone. Origin of the hamstrings, adductors, glutes and rectus femoris.' },
  sacrum: { desc: 'Five fused vertebrae forming the back of the pelvis and the sacroiliac joints.' },
  scapula: { desc: 'The shoulder blade — origin of the rotator cuff and a moving base for the arm.' },
  clavicle: { desc: 'The collarbone — the only bony strut connecting the arm to the trunk.' },
  humerus: { desc: 'The upper arm bone, from the shoulder socket to the elbow.' },
  radius: { desc: 'The lateral forearm bone, which rotates around the ulna in pronation and supination.' },
  ulna: { desc: 'The medial forearm bone; its olecranon forms the point of the elbow.' },
  calcaneus: { desc: 'The heel bone, where the Achilles tendon and the plantar fascia attach.' },
  talus: { desc: 'Transmits body weight from the tibia to the foot and forms the ankle joint.' },
};

export const APP = {
  'rectus-femoris': ['quadriceps', 'rectus_femoris'], 'vastus-lateralis': ['quadriceps', 'vastus_lateralis'],
  'vastus-medialis': ['quadriceps', 'vastus_medialis'], 'vastus-intermedius': ['quadriceps', 'vastus_intermedius'],
  sartorius: ['quadriceps', 'sartorius'], patella: ['knee'], popliteus: ['knee'],
  'biceps-femoris': ['hamstring', 'biceps_femoris_long'], semitendinosus: ['hamstring', 'semitendinosus'], semimembranosus: ['hamstring', 'semimembranosus'],
  'adductor-longus': ['adductor_groin', 'adductor_longus'], 'adductor-magnus': ['adductor_groin', 'adductor_magnus'],
  'adductor-brevis': ['adductor_groin', 'adductor_brevis'], gracilis: ['adductor_groin', 'gracilis'],
  iliacus: ['hip_flexor'], 'psoas-major': ['hip_flexor'],
  'gluteus-maximus': ['glutes'], piriformis: ['glutes'], 'obturator-internus': ['glutes'],
  'gluteus-medius': ['abductor'], 'gluteus-minimus': ['abductor'],
  gastrocnemius: ['calf_shin'], soleus: ['calf_shin'], plantaris: ['calf_shin'], 'tibialis-anterior': ['calf_shin'],
  'tibialis-posterior': ['calf_shin'], 'extensor-digitorum-longus': ['calf_shin'], 'flexor-digitorum-longus': ['calf_shin'],
  'fibularis-longus': ['calf_shin'], 'fibularis-brevis': ['calf_shin'], tibia: ['calf_shin'], fibula: ['calf_shin'],
  'calcaneal-tendon': ['ankle'], 'long-plantar-ligament': ['ankle'], 'flexor-digitorum-brevis': ['ankle'], calcaneus: ['ankle'], talus: ['ankle'],
  'erector-spinae': ['lower_back'], sacrum: ['lower_back'], trapezius: ['back'], 'rhomboid-major': ['back'],
  'levator-scapulae': ['neck'], sternocleidomastoid: ['neck'],
  deltoid: ['shoulder'], supraspinatus: ['shoulder'], infraspinatus: ['shoulder'], 'teres-minor': ['shoulder'],
  subscapularis: ['shoulder'], 'teres-major': ['shoulder'], scapula: ['shoulder'], clavicle: ['shoulder'],
  'pectoralis-major': ['chest'], 'pectoralis-minor': ['chest'], 'serratus-anterior': ['serratus'], 'external-oblique': ['obliques'],
  'biceps-brachii': ['biceps'], 'triceps-brachii': ['triceps'],
  brachioradialis: ['forearm'], supinator: ['forearm'], 'pronator-quadratus': ['forearm'], 'extensor-carpi-radialis-brevis': ['elbow'],
  'extensor-carpi-radialis-longus': ['forearm'], 'extensor-carpi-ulnaris': ['forearm'], 'extensor-digitorum': ['forearm'],
  'flexor-carpi-radialis': ['forearm'], 'palmaris-longus': ['forearm'], 'finger-flexors': ['forearm'],
};

export const CONDITIONS = {
  'rectus-femoris': ['Rectus femoris strain', 'Quadriceps contusion'],
  'vastus-lateralis': ['Vastus strain', 'Quadriceps contusion'], 'vastus-medialis': ['Vastus strain', 'Patellofemoral pain'],
  'vastus-intermedius': ['Quadriceps contusion', 'Vastus strain'],
  patella: ['Patellofemoral pain', 'Patellar instability', 'Patellar tendinopathy'],
  femur: ['Knee ligament injuries (ACL, PCL, MCL, LCL attach here)', 'Knee osteoarthritis'],
  tibia: ['Meniscus tear', 'ACL / PCL injury', 'Osgood–Schlatter (tibial tuberosity)'],
  fibula: ['LCL / posterolateral corner injury'],
  'biceps-femoris': ['Hamstring strain'], semitendinosus: ['Hamstring strain'], semimembranosus: ['Hamstring strain'],
  'adductor-longus': ['Adductor-related groin pain'], 'adductor-magnus': ['Adductor-related groin pain'],
  'adductor-brevis': ['Adductor-related groin pain'], gracilis: ['Adductor-related groin pain'],
  iliacus: ['Hip flexor strain'], 'psoas-major': ['Hip flexor strain'],
  'gluteus-medius': ['Gluteal tendinopathy'], 'gluteus-minimus': ['Gluteal tendinopathy'],
  gastrocnemius: ['Calf strain'], soleus: ['Calf strain'],
  'calcaneal-tendon': ['Achilles tendinopathy', 'Achilles rupture'],
  supraspinatus: ['Rotator cuff tendinopathy'], infraspinatus: ['Rotator cuff tendinopathy'],
  'extensor-carpi-radialis-brevis': ['Lateral elbow tendinopathy'],
  'erector-spinae': ['Low back pain'],
};

// Quadriceps is one compound structure in the source; split it by BodyParts3D
// element id. Identification checked against geometry: FJ1433 is the only
// element reaching the hip and is the most anterior (rectus femoris);
// FJ1442 most lateral; FJ1443 most medial and most distal; FJ1441 deepest.
export const QUAD_SPLIT = {
  FJ1433: 'rectus-femoris', FJ1442: 'vastus-lateralis', FJ1443: 'vastus-medialis', FJ1441: 'vastus-intermedius',
};
export const QUAD_LABELS = {
  'rectus-femoris': 'Rectus femoris', 'vastus-lateralis': 'Vastus lateralis',
  'vastus-medialis': 'Vastus medialis', 'vastus-intermedius': 'Vastus intermedius',
};
