/* AnatomyScene — imperative Three.js renderer for the 3D anatomy viewer.
   Geometry: BodyParts3D 4.0 (© DBCLS, CC BY 4.0), see public/anatomy3d/.
   React owns the UI; this class owns the WebGL scene and reports hover /
   selection back through callbacks. */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const HI = new THREE.Color('#2F8CFF');
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}

/* ── materials ─────────────────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
varying vec3 vWPos;
uniform vec3 uAxis;
uniform float uHover;
uniform float uSelect;
uniform vec3 uHi;
uniform float uFibre;
float a3dH(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float a3dN(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(a3dH(i), a3dH(i + vec3(1,0,0)), f.x), mix(a3dH(i + vec3(0,1,0)), a3dH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(a3dH(i + vec3(0,0,1)), a3dH(i + vec3(1,0,1)), f.x), mix(a3dH(i + vec3(0,1,1)), a3dH(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float a3dFibre(vec3 p){
  vec3 ax = normalize(uAxis);
  vec3 t1 = normalize(cross(ax, abs(ax.y) < 0.9 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
  vec3 t2 = cross(ax, t1);
  vec3 c = vec3(dot(p, t1), dot(p, t2), dot(p, ax));
  // fibres run along the muscle's long axis: high frequency across, low along
  float coarse = a3dN(vec3(c.xy * 260.0, c.z * 9.0));
  float fine = a3dN(vec3(c.xy * 900.0, c.z * 30.0));
  float fw = clamp(length(fwidth(c.xy)) * 900.0, 0.0, 1.0); // fade fine detail at distance
  return mix(coarse, mix(fine, 0.5, fw) * 0.5 + coarse * 0.5, 0.6);
}`;

function patch(material, kind, uniforms) {
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    let surface = '';
    if (kind === 'muscle') {
      surface = `float fib = a3dFibre(vWPos);
        diffuseColor.rgb *= mix(1.0, 0.74 + 0.42 * fib, uFibre);`;
    } else if (kind === 'bone') {
      surface = `float por = a3dN(vWPos * 160.0) * 0.6 + a3dN(vWPos * 520.0) * 0.4;
        diffuseColor.rgb *= 0.9 + 0.14 * por;`;
    } else {
      surface = `float str = a3dN(vec3(vWPos.xz * 700.0, vWPos.y * 40.0));
        diffuseColor.rgb *= 0.93 + 0.1 * str;`;
    }
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + NOISE_GLSL)
      .replace('#include <color_fragment>', `#include <color_fragment>
        ${surface}
        diffuseColor.rgb = mix(diffuseColor.rgb, uHi * 0.55, uSelect * 0.88);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float a3dFres = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.2);
        totalEmissiveRadiance += uHi * (uSelect * (0.10 + 1.6 * a3dFres) + uHover * (0.05 + 0.9 * a3dFres));`);
  };
  material.customProgramCacheKey = () => 'a3d-' + kind;
}

const LOOK = {
  muscle: { color: '#9C2B24', roughness: 0.46, clearcoat: 0.28, clearcoatRoughness: 0.38, sheen: 0.45, sheenColor: '#FF8A78', sheenRoughness: 0.5 },
  bone: { color: '#E8DCC4', roughness: 0.64, clearcoat: 0.08, clearcoatRoughness: 0.6, sheen: 0.15, sheenColor: '#FFFFFF', sheenRoughness: 0.8 },
  tendon: { color: '#ECE6D6', roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.25, sheen: 0.7, sheenColor: '#FFFFFF', sheenRoughness: 0.35 },
  ligament: { color: '#E4DDCB', roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: '#FFFFFF', sheenRoughness: 0.4 },
  disc: { color: '#BCD3E4', roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2, sheen: 0.3, sheenColor: '#E6F4FF', sheenRoughness: 0.4 },
  joint: { color: '#BCD3E4', roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2, sheen: 0.3, sheenColor: '#E6F4FF', sheenRoughness: 0.4 },
};
export const LAYER_OF = { muscle: 'muscle', bone: 'bone', tendon: 'connective', ligament: 'connective', disc: 'joint', joint: 'joint' };

function makeMaterial(type, structId, lite) {
  const look = LOOK[type] || LOOK.bone;
  const kind = type === 'muscle' ? 'muscle' : type === 'bone' ? 'bone' : 'connective';
  const color = new THREE.Color(look.color);
  // subtle per-structure variation so neighbouring muscles read as separate bellies
  const j = hashStr(structId) - 0.5;
  if (type === 'muscle') color.offsetHSL(j * 0.018, j * 0.08, j * 0.06);
  else color.offsetHSL(0, 0, j * 0.03);
  const u = {
    uAxis: { value: new THREE.Vector3(0, 1, 0) }, uHover: { value: 0 }, uSelect: { value: 0 },
    uHi: { value: HI.clone() }, uFibre: { value: 1 },
  };
  const mat = lite
    ? new THREE.MeshStandardMaterial({ color, roughness: look.roughness, metalness: 0 })
    : new THREE.MeshPhysicalMaterial({ color, roughness: look.roughness, metalness: 0, clearcoat: look.clearcoat, clearcoatRoughness: look.clearcoatRoughness, sheen: look.sheen, sheenColor: new THREE.Color(look.sheenColor), sheenRoughness: look.sheenRoughness });
  patch(mat, kind, u);
  mat.userData.u = u;
  return mat;
}

function makeGhost(type) {
  const strength = type === 'bone' ? 0.55 : type === 'muscle' ? 0.32 : 0.4;
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    uniforms: { uColor: { value: new THREE.Color(type === 'bone' ? '#9FD0FF' : '#4AA3FF') }, uStrength: { value: strength } },
    vertexShader: /* glsl */`varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`uniform vec3 uColor; uniform float uStrength; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.8);
        gl_FragColor = vec4(uColor * (0.035 + f) * uStrength, 1.0); }`,
  });
}

/* ── floor: soft contact shadow + brand tendon rings ──────── */
function floorTextures() {
  const s = 1024;
  const c1 = document.createElement('canvas'); c1.width = c1.height = s;
  const g = c1.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(2,8,24,0.75)'); grd.addColorStop(0.25, 'rgba(2,8,24,0.42)'); grd.addColorStop(0.6, 'rgba(2,8,24,0.1)'); grd.addColorStop(1, 'rgba(2,8,24,0)');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  const c2 = document.createElement('canvas'); c2.width = c2.height = s;
  const r = c2.getContext('2d');
  [0.2, 0.32, 0.45, 0.6, 0.78].forEach((f, i) => {
    r.beginPath(); r.setLineDash([18 + i * 8, 12 + i * 6]); r.lineWidth = 2.2;
    r.strokeStyle = `rgba(120,190,255,${0.55 - i * 0.09})`; r.arc(s / 2, s / 2, (f * s) / 2, 0, Math.PI * 2); r.stroke();
  });
  const t1 = new THREE.CanvasTexture(c1), t2 = new THREE.CanvasTexture(c2);
  t1.colorSpace = t2.colorSpace = THREE.SRGBColorSpace;
  return [t1, t2];
}

function backgroundTexture() {
  const c = document.createElement('canvas'); c.width = 16; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 512);
  [['#0B1B42', 0], ['#112455', 0.18], ['#172F6E', 0.45], ['#1B3A7A', 0.7], ['#132A62', 0.9], ['#0D1F4A', 1]].forEach(([col, o]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── scene ─────────────────────────────────────────────────── */
export class AnatomyScene {
  constructor(container, cb = {}) {
    this.el = container;
    this.cb = cb;
    this.lite = !!cb.lite;
    this.meshes = [];               // all anatomy meshes
    this.byStruct = new Map();      // structId -> meshes[]
    this.struct = new Map();        // structId -> manifest entry
    this.layers = { muscle: true, bone: true, connective: true, joint: true };
    this.mode = 'anatomy';          // 'anatomy' | 'xray'
    this.isolated = null;           // Set of structIds or null
    this.hidden = new Set();
    this.selected = null;           // { id, side }
    this.hovered = null;            // { id, side }
    this.tween = null;
    this.userMoved = false;
    this._pointer = new THREE.Vector2();
    this._down = null;
    this._clock = new THREE.Clock();
    this._init();
  }

  _init() {
    const w = this.el.clientWidth || 800, h = this.el.clientHeight || 600;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.lite ? 1.5 : 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !this.lite;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
    this.el.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = backgroundTexture();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(30, w / h, 0.02, 40);
    camera.position.set(0, 1.0, 5.2);
    this.camera = camera;

    // studio lighting: warm key, cool electric rim, soft fill
    const key = new THREE.DirectionalLight('#FFF1E2', 2.4);
    key.position.set(-1.6, 3.2, 2.6);
    key.castShadow = !this.lite;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -1.1; key.shadow.camera.right = 1.1; key.shadow.camera.top = 1.2; key.shadow.camera.bottom = -1.2;
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 8;
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.012; key.shadow.radius = 4;
    scene.add(key); scene.add(key.target);
    this.key = key;
    const rim = new THREE.DirectionalLight('#6FB8FF', 2.2); rim.position.set(2.2, 2.0, -2.8); scene.add(rim);
    const rim2 = new THREE.DirectionalLight('#9AD0FF', 1.1); rim2.position.set(-2.4, 1.2, -2.0); scene.add(rim2);
    const fill = new THREE.HemisphereLight('#DDEBFF', '#1A2440', 0.55); scene.add(fill);

    this.root = new THREE.Group();
    scene.add(this.root);

    const [shadowTex, ringTex] = floorTextures();
    this.floorShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }));
    this.floorRings = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8, toneMapped: false }));
    [this.floorShadow, this.floorRings].forEach((m) => { m.rotation.x = -Math.PI / 2; m.renderOrder = -1; scene.add(m); });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9; controls.panSpeed = 0.8;
    controls.minDistance = 0.25; controls.maxDistance = 7;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.55;
    controls.addEventListener('start', () => { this.userMoved = true; controls.autoRotate = false; this.tween = null; });
    this.controls = controls;

    if (!this.lite) {
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const ao = new GTAOPass(scene, camera, w, h);
      ao.output = GTAOPass.OUTPUT.Default;
      ao.blendIntensity = 0.9;
      ao.updateGtaoMaterial({ radius: 0.05, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 16, distanceFallOff: 1 });
      ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
      // ghosted (x-ray) meshes must not occlude anything
      const aoRender = ao.render.bind(ao);
      ao.render = (...args) => {
        const ghosts = this.meshes.filter((m) => m.visible && m.userData.ghost);
        ghosts.forEach((m) => (m.visible = false));
        this.floorRings.visible = this.floorShadow.visible = false;
        aoRender(...args);
        ghosts.forEach((m) => (m.visible = true));
        this.floorRings.visible = this.floorShadow.visible = true;
      };
      composer.addPass(ao);
      composer.addPass(new OutputPass());
      this.composer = composer;
      this.ao = ao;
    }

    this.raycaster = new THREE.Raycaster();
    this._onMove = (e) => this._pointerMove(e);
    this._onDown = (e) => { this._down = { x: e.clientX, y: e.clientY, t: performance.now() }; };
    this._onUp = (e) => this._pointerUp(e);
    this._onLeave = () => { this._pointerInside = false; this._setHover(null); };
    const d = renderer.domElement;
    d.addEventListener('pointermove', this._onMove);
    d.addEventListener('pointerdown', this._onDown);
    d.addEventListener('pointerup', this._onUp);
    d.addEventListener('pointerleave', this._onLeave);
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.el);
    renderer.setAnimationLoop(() => this._frame());
  }

  async load(manifest, base) {
    manifest.structures.forEach((s) => this.struct.set(s.id, s));
    const owner = new Map(); // node name -> { struct, side }
    manifest.structures.forEach((s) => s.nodes.forEach((n) => owner.set(n.n, { s, side: n.s })));

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const files = [...manifest.files].sort((a, b) => (a.startsWith('supplement') ? 1 : 0) - (b.startsWith('supplement') ? 1 : 0));
    const progress = new Array(files.length).fill(0);
    const report = () => this.cb.onProgress?.(progress.reduce((a, b) => a + b, 0) / files.length);
    const box = new THREE.Box3();

    const loadOne = (file, i) => new Promise((resolve, reject) => {
      loader.load(`${base}/models/${file}`, (gltf) => {
        progress[i] = 1; report();
        gltf.scene.updateMatrixWorld(true);
        const found = [];
        gltf.scene.traverse((o) => { if (o.isMesh) found.push(o); });
        found.forEach((mesh) => {
          let p = mesh, own = null;
          while (p && !own) { own = owner.get(p.userData?.name) || owner.get(p.name); p = p.parent; }
          if (!own) return;
          const s = own.s;
          mesh.geometry.computeBoundingSphere();
          mesh.material = makeMaterial(s.type, s.id, this.lite);
          mesh.userData = { ...mesh.userData, struct: s.id, side: own.side, type: s.type, layer: LAYER_OF[s.type] || 'bone', ghost: false, solidMat: mesh.material, hover: 0, select: 0 };
          mesh.castShadow = mesh.receiveShadow = !this.lite;
          // bake world transform so meshes can be re-parented freely
          mesh.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
          this.root.add(mesh);
          this.meshes.push(mesh);
          if (!this.byStruct.has(s.id)) this.byStruct.set(s.id, []);
          this.byStruct.get(s.id).push(mesh);
        });
        resolve();
      }, (ev) => { if (ev.total) { progress[i] = Math.min(0.99, ev.loaded / ev.total); report(); } }, reject);
    });

    // skeleton first so something meaningful appears quickly, then soft tissue
    const baseFiles = files.filter((f) => !f.startsWith('supplement'));
    const supp = files.filter((f) => f.startsWith('supplement'));
    await Promise.all(baseFiles.map((f) => loadOne(f, files.indexOf(f))));
    this._frameModel(true);
    this.cb.onSkeleton?.();
    await Promise.all(supp.map((f) => loadOne(f, files.indexOf(f))));

    this.root.updateMatrixWorld(true);
    this.meshes.forEach((m) => { if (m.userData.type === 'muscle') m.material.userData.u.uAxis.value.copy(this._axisOf(this.byStruct.get(m.userData.struct))); });
    // mirror-share axis sign per structure is irrelevant (fibres are symmetric)
    box.setFromObject(this.root);
    this.bounds = box.clone();
    this._frameModel(false);
    this._apply();
    this.cb.onReady?.();
  }

  _axisOf(meshes) {
    if (meshes._axis) return meshes._axis;
    // principal component of the structure's vertices (one side) = fibre direction
    const m = meshes[0];
    const pos = m.geometry.attributes.position, v = new THREE.Vector3();
    const step = Math.max(1, Math.floor(pos.count / 1500));
    const pts = [];
    for (let i = 0; i < pos.count; i += step) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); pts.push(v.clone()); }
    const c = new THREE.Vector3(); pts.forEach((p) => c.add(p)); c.multiplyScalar(1 / pts.length);
    const C = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    pts.forEach((p) => { const d = [p.x - c.x, p.y - c.y, p.z - c.z]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) C[a * 3 + b] += d[a] * d[b]; });
    let e = new THREE.Vector3(0.1, 1, 0.1).normalize();
    for (let k = 0; k < 24; k++) {
      e = new THREE.Vector3(C[0] * e.x + C[1] * e.y + C[2] * e.z, C[3] * e.x + C[4] * e.y + C[5] * e.z, C[6] * e.x + C[7] * e.y + C[8] * e.z).normalize();
    }
    meshes._axis = e;
    return e;
  }

  _frameModel(instant) {
    const b = new THREE.Box3().setFromObject(this.root);
    if (b.isEmpty()) return;
    const c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3());
    this.center = c; this.height = size.y;
    const floorY = b.min.y - 0.004;
    this.floorShadow.position.set(c.x, floorY, c.z);
    this.floorRings.position.set(c.x, floorY - 0.001, c.z);
    this.key.target.position.copy(c);
    // on phones the search/layer panel covers the top of the stage: pull back and aim higher
    const aim = c.clone(); if (this.lite) aim.y += size.y * 0.085;
    this.home = this._fitView(aim, size.y * 0.5 * (this.lite ? 1.26 : 1.08), new THREE.Vector3(0.12, 0.08, 1).normalize());
    this.controls.maxDistance = this.home.dist * 2.2;
    if (instant) { this.camera.position.copy(this.home.pos); this.controls.target.copy(this.home.target); this.controls.update(); }
  }

  _fitView(center, radius, dir) {
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const vFit = radius / Math.sin(fov / 2);
    const hFov = 2 * Math.atan(Math.tan(fov / 2) * this.camera.aspect);
    const hFit = radius / Math.sin(hFov / 2);
    const dist = Math.max(vFit, hFit * 0.55, 0.28);
    return { target: center.clone(), pos: center.clone().add(dir.clone().multiplyScalar(dist)), dist };
  }

  _flyTo(view, dur = 0.9) {
    this.controls.autoRotate = false;
    this.tween = { from: { pos: this.camera.position.clone(), target: this.controls.target.clone() }, to: view, t0: performance.now(), dur };
  }

  /* ── public API ── */
  setLayer(layer, on) { this.layers[layer] = on; this._apply(); }
  setMode(mode) { this.mode = mode; this._apply(); }
  setFibres(on) { this.meshes.forEach((m) => m.userData.solidMat.userData.u.uFibre.value = on ? 1 : 0); }

  select(id, side = null, { fly = true } = {}) {
    this.selected = id ? { id, side } : null;
    if (this.isolated && id && !this.isolated.has(id)) this.isolated = new Set([id]);
    this._apply();
    if (id && fly) this.focusStructure(id, side);
    this.cb.onSelect?.(this.selected);
  }

  focusStructure(id, side = null) {
    const meshes = (this.byStruct.get(id) || []).filter((m) => !side || m.userData.side === side || m.userData.side === 'M');
    if (!meshes.length) return;
    const b = new THREE.Box3(); meshes.forEach((m) => b.expandByObject(m));
    const sph = b.getBoundingSphere(new THREE.Sphere());
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this._flyTo(this._fitView(sph.center, Math.max(sph.radius * 1.25, 0.06), dir));
  }

  focusRegion(region) {
    if (!region || region === 'all') { this._flyTo(this.home, 1.0); return; }
    const b = new THREE.Box3();
    this.meshes.forEach((m) => { if (this.struct.get(m.userData.struct).region === region && m.visible) b.expandByObject(m); });
    if (b.isEmpty()) return;
    const sph = b.getBoundingSphere(new THREE.Sphere());
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this._flyTo(this._fitView(sph.center, sph.radius * 0.95, dir));
  }

  resetView() { this.isolated = null; this.hidden.clear(); this.select(null); this._flyTo(this.home, 1.0); this._apply(); }
  isolate(on) { this.isolated = on && this.selected ? new Set([this.selected.id]) : null; this._apply(); }
  hide(id) { this.hidden.add(id); if (this.selected?.id === id) this.select(null); this._apply(); }
  showAll() { this.hidden.clear(); this.isolated = null; this._apply(); }
  rotateBy(deg) { const o = this.camera.position.clone().sub(this.controls.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(deg)); this._flyTo({ target: this.controls.target.clone(), pos: this.controls.target.clone().add(o) }, 0.8); }
  viewFrom(face) {
    const dirs = { front: [0.12, 0.08, 1], back: [-0.12, 0.08, -1], left: [1, 0.08, 0.05], right: [-1, 0.08, 0.05] };
    const d = new THREE.Vector3(...dirs[face]).normalize();
    const dist = this.camera.position.distanceTo(this.controls.target);
    this._flyTo({ target: this.controls.target.clone(), pos: this.controls.target.clone().add(d.multiplyScalar(dist)) }, 0.9);
  }

  _apply() {
    const sel = this.selected;
    this.meshes.forEach((m) => {
      const u = m.userData, id = u.struct;
      const isSel = sel && sel.id === id && (!sel.side || u.side === sel.side || u.side === 'M');
      let visible = this.layers[u.layer] && !this.hidden.has(id);
      let ghost = false;
      if (this.isolated) ghost = !this.isolated.has(id);
      else if (this.mode === 'xray') ghost = u.layer !== 'bone' && !isSel;
      if (isSel) { visible = true; ghost = false; }
      m.visible = visible;
      u.ghost = ghost;
      u.selectTarget = isSel ? 1 : 0;
      m.material = ghost ? (this._ghosts ||= {}, this._ghosts[u.type] ||= makeGhost(u.type)) : u.solidMat;
      m.castShadow = !ghost && !this.lite;
      m.renderOrder = ghost ? 2 : 0;
    });
  }

  _setHover(h) {
    const same = (a, b) => (a && b && a.id === b.id && a.side === b.side) || (!a && !b);
    if (same(h, this.hovered)) return;
    this.hovered = h;
    this.renderer.domElement.style.cursor = h ? 'pointer' : 'grab';
    this.cb.onHover?.(h);
  }

  _pick(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this._pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this._pointer, this.camera);
    const vis = this.meshes.filter((m) => m.visible);
    const solid = vis.filter((m) => !m.userData.ghost);
    let hit = this.raycaster.intersectObjects(solid, false)[0];
    // in x-ray, ghosted tissue in front of the skeleton stays pickable
    if (this.mode === 'xray' || this.isolated) {
      const g = this.raycaster.intersectObjects(vis.filter((m) => m.userData.ghost), false)[0];
      if (g && (!hit || g.distance < hit.distance)) hit = g;
    }
    return hit ? { id: hit.object.userData.struct, side: hit.object.userData.side, x: e.clientX - r.left, y: e.clientY - r.top } : null;
  }

  _pointerMove(e) {
    this._lastMove = e;
    this._pointerInside = true;
  }

  _pointerUp(e) {
    const d = this._down; this._down = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 600) return;
    const hit = this._pick(e);
    if (hit) this.select(hit.id, hit.side === 'M' ? null : hit.side);
    else if (e.pointerType === 'mouse') this.select(null);
  }

  _resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
  }

  _frame() {
    this._rawDt = this._clock.getDelta();
    const dt = Math.min(this._rawDt, 0.05);
    if (this.tween) {
      // wall-clock based so camera moves finish on time even at low frame rates
      const tw = this.tween, el = (performance.now() - tw.t0) / 1000;
      const p = easeInOut(Math.min(1, el / tw.dur));
      this.camera.position.lerpVectors(tw.from.pos, tw.to.pos, p);
      this.controls.target.lerpVectors(tw.from.target, tw.to.target, p);
      if (el >= tw.dur) this.tween = null;
    }
    this.controls.update();
    // hover picking at most once per frame, only when the pointer moved and no drag is active
    if (this._lastMove && this._pointerInside && !this._down && this._lastMove.pointerType === 'mouse') {
      const h = this._pick(this._lastMove);
      this._setHover(h);
      if (h) this.cb.onHoverMove?.(h);
      this._lastMove = null;
    }
    const k = 1 - Math.exp(-Math.min(this._rawDt, 0.25) * 12);
    const hv = this.hovered;
    this.meshes.forEach((m) => {
      const u = m.userData;
      const hovT = hv && hv.id === u.struct && (hv.side === u.side || hv.side === 'M' || u.side === 'M') ? 1 : 0;
      u.hover += (hovT - u.hover) * k;
      u.select += ((u.selectTarget || 0) - u.select) * k;
      const uu = u.solidMat.userData.u;
      uu.uHover.value = u.hover;
      uu.uSelect.value = u.select * (0.85 + 0.15 * Math.sin(this._clock.elapsedTime * 3.2));
    });
    this.floorRings.rotation.z += dt * 0.05;
    if (this.composer) this.composer.render(dt); else this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this._ro.disconnect();
    const d = this.renderer.domElement;
    d.removeEventListener('pointermove', this._onMove);
    d.removeEventListener('pointerdown', this._onDown);
    d.removeEventListener('pointerup', this._onUp);
    d.removeEventListener('pointerleave', this._onLeave);
    this.controls.dispose();
    this.meshes.forEach((m) => { m.geometry.dispose(); m.userData.solidMat.dispose(); });
    Object.values(this._ghosts || {}).forEach((g) => g.dispose());
    this.composer?.dispose?.();
    this.renderer.dispose();
    d.remove();
  }
}
