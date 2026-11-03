/* Persicar Service – impianto frenante 3D "esploso" allo scroll.
 * Geometria procedurale (nessun modello da scaricare). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("brake-canvas");
const section = document.getElementById("freni");
const pin = section && section.querySelector(".brake__pin");
const steps = section ? [...section.querySelectorAll(".brake__steps li")] : [];
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setStep(i) {
  steps.forEach((li, k) => li.classList.toggle("is-active", reduce || i < 0 ? true : k === i));
}
setStep(0);

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

if (host && webglOK()) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); init(); }
  }, { rootMargin: "400px 0px" });
  io.observe(host);
} else if (reduce) {
  setStep(-1);
}

function sector(r1, r2, a0, a1) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r2, a0, a1, false);
  s.absarc(0, 0, r1, a1, a0, true);
  s.closePath();
  return s;
}
function circlePath(x, y, r, PathType = THREE.Path) {
  const p = new PathType();
  p.absarc(x, y, r, 0, Math.PI * 2, true);
  return p;
}

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  host.classList.add("has-webgl");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.2, 9);

  // Luci: chiave neutra + rim verde/rosso come il logo
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222226, 0.9));
  const rimG = new THREE.PointLight(0x1fa35c, 18, 12);
  rimG.position.set(-4, -1, -2);
  scene.add(rimG);
  const rimR = new THREE.PointLight(0xe0434b, 14, 12);
  rimR.position.set(4, 2, -3);
  scene.add(rimR);

  // Materiali
  const steel = new THREE.MeshStandardMaterial({ color: 0xc9ccd2, metalness: 0.85, roughness: 0.38, envMapIntensity: 1.8 });
  const steelDark = new THREE.MeshStandardMaterial({ color: 0x8a8d93, metalness: 0.8, roughness: 0.45, envMapIntensity: 1.6 });
  const friction = new THREE.MeshStandardMaterial({ color: 0x4a4541, metalness: 0.1, roughness: 0.85 });
  const red = new THREE.MeshPhysicalMaterial({ color: 0xc8242c, metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });

  const assembly = new THREE.Group();
  scene.add(assembly);
  const rotor = new THREE.Group();
  assembly.add(rotor);

  // Disco forato
  const R = 1.6, RI = 0.8, T = 0.3;
  const discShape = new THREE.Shape();
  discShape.absarc(0, 0, R, 0, Math.PI * 2, false);
  discShape.holes.push(circlePath(0, 0, RI));
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const r = i % 2 ? 1.18 : 1.38;
    discShape.holes.push(circlePath(Math.cos(a) * r, Math.sin(a) * r, 0.045));
  }
  const discGeo = new THREE.ExtrudeGeometry(discShape, { depth: T, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 96 });
  discGeo.translate(0, 0, -T / 2);
  const disc = new THREE.Mesh(discGeo, steel);
  rotor.add(disc);

  // Campana / mozzo
  const hub = new THREE.Group();
  const capShape = new THREE.Shape();
  capShape.absarc(0, 0, 0.82, 0, Math.PI * 2, false);
  capShape.holes.push(circlePath(0, 0, 0.3));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
    capShape.holes.push(circlePath(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0.075));
  }
  const capGeo = new THREE.ExtrudeGeometry(capShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, curveSegments: 64 });
  const cap = new THREE.Mesh(capGeo, steelDark);
  cap.position.z = 0.42;
  hub.add(cap);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.42, 64, 1, true), steelDark);
  wall.rotation.x = Math.PI / 2;
  wall.position.z = 0.21;
  hub.add(wall);
  rotor.add(hub);

  // Pastiglie (interna ed esterna) con piastra in acciaio
  const pa0 = Math.PI / 2 - 0.42, pa1 = Math.PI / 2 + 0.42;
  function makePad(side) {
    const g = new THREE.Group();
    const lining = new THREE.Mesh(new THREE.ExtrudeGeometry(sector(1.08, 1.56, pa0, pa1), { depth: 0.1, bevelEnabled: false, curveSegments: 32 }), friction);
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(sector(1.03, 1.62, pa0 - 0.04, pa1 + 0.04), { depth: 0.05, bevelEnabled: false, curveSegments: 32 }), steelDark);
    if (side > 0) { lining.position.z = T / 2 + 0.01; plate.position.z = T / 2 + 0.11; }
    else { lining.position.z = -T / 2 - 0.11; plate.position.z = -T / 2 - 0.16; }
    g.add(lining, plate);
    return g;
  }
  const padOut = makePad(1);
  const padIn = makePad(-1);
  assembly.add(padOut, padIn);

  // Pinza
  const ca0 = Math.PI / 2 - 0.46, ca1 = Math.PI / 2 + 0.46;
  const caliper = new THREE.Group();
  const bodyGeo = new THREE.ExtrudeGeometry(sector(1.06, 1.86, ca0, ca1), { depth: 0.14, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 4, curveSegments: 48 });
  const front = new THREE.Mesh(bodyGeo, red);
  front.position.z = T / 2 + 0.2;
  const back = new THREE.Mesh(bodyGeo, red);
  back.position.z = -T / 2 - 0.36;
  const bridge = new THREE.Mesh(new THREE.ExtrudeGeometry(sector(1.66, 1.86, ca0 + 0.05, ca1 - 0.05), { depth: T + 0.56, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 48 }), red);
  bridge.position.z = -T / 2 - 0.2;
  caliper.add(front, back, bridge);
  assembly.add(caliper);

  assembly.rotation.set(0.22, -0.62, 0);

  // Dimensioni
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1.1 ? 12 : 8.6;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  // Stato
  let progress = reduce ? 0.62 : 0;
  let shown = progress;
  let mx = 0, my = 0, tx = 0, ty = 0;
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  host.addEventListener("pointerleave", () => { mx = 0; my = 0; });

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function apply(p) {
    const e = smooth(0.12, 0.72, p);
    caliper.position.set(0, 1.7 * e, 1.9 * e);
    padOut.position.set(0, 0.85 * e, 1.15 * e);
    padIn.position.set(0, 0.85 * e, -1.15 * e);
    hub.position.z = -1.1 * e;
    assembly.rotation.y = -0.62 + 0.45 * smooth(0, 1, p) + tx * 0.18;
    assembly.rotation.x = 0.22 + 0.12 * e + ty * 0.12;
    assembly.position.y = -0.55 * e;
  }

  // Scroll
  const ST = window.ScrollTrigger;
  if (!reduce && ST && window.gsap) {
    const desktop = window.matchMedia("(min-width: 961px)").matches;
    const idx = (p) => (p < 0.28 ? 0 : p < 0.52 ? 1 : p < 0.78 ? 2 : 3);
    ST.create(desktop ? {
      trigger: pin, start: "top top", end: "+=220%", pin: true, scrub: true,
      onUpdate: (s) => { progress = s.progress; setStep(idx(progress)); }
    } : {
      trigger: pin, start: "top 20%", end: "bottom 70%", scrub: true,
      onUpdate: (s) => { progress = s.progress; setStep(idx(progress)); }
    });
    ST.refresh();
  } else {
    setStep(-1);
  }

  // Render solo quando visibile
  let visible = true;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(host);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    shown += (progress - shown) * Math.min(1, dt * 8);
    tx += (mx - tx) * Math.min(1, dt * 4);
    ty += (my - ty) * Math.min(1, dt * 4);
    if (!reduce) rotor.rotation.z -= dt * (0.35 + (1 - shown) * 0.6);
    apply(shown);
    renderer.render(scene, camera);
  }
  apply(shown);
  frame();
}
