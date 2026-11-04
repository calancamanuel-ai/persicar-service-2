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
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  host.classList.add("has-webgl");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.2, 9);

  // Luci: chiave neutra, riempimento morbido e rim verde/rosso come il logo
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 4, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe6ff, 0.8);
  fill.position.set(-5, -1, 3);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1e, 0.6));
  const rimG = new THREE.PointLight(0x1fa35c, 14, 12);
  rimG.position.set(-4, -1, -2);
  scene.add(rimG);
  const rimR = new THREE.PointLight(0xe0434b, 10, 12);
  rimR.position.set(4, 2, -3);
  scene.add(rimR);

  // ---------- Texture procedurali (nessun file da scaricare) ----------
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function canvasTex(size, draw, srgb) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    draw(c.getContext("2d"), size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }
  function rng(seed) { let x = seed; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }

  const R = 1.6, RI = 0.82;
  // Faccia del disco: segni di tornitura concentrici; la fascia di attrito è più lucida dei bordi
  function discFace(isRough) {
    return (g, S) => {
      const r = rng(isRough ? 11 : 5), c = S / 2, k = S / (2 * R);
      g.fillStyle = isRough ? "#5c5c5c" : "#a3a7ad"; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 1600; i++) {
        const rr = (RI + r() * (R - RI)) * k;
        const v = isRough ? 60 + r() * 70 : 130 + r() * 95;
        g.strokeStyle = "rgba(" + v + "," + v + "," + (v + (isRough ? 0 : 5)) + "," + (0.2 + r() * 0.4) + ")";
        g.lineWidth = 0.5 + r() * 1.6;
        g.beginPath(); g.arc(c, c, rr, 0, Math.PI * 2); g.stroke();
      }
      // bordi esterno e interno: acciaio grezzo, più opaco e scuro
      [[R - 0.05, 0.1], [RI + 0.05, 0.1]].forEach(function (b) {
        g.lineWidth = b[1] * k;
        g.strokeStyle = isRough ? "rgba(190,190,190,0.95)" : "rgba(72,74,78,0.9)";
        g.beginPath(); g.arc(c, c, b[0] * k, 0, Math.PI * 2); g.stroke();
      });
    };
  }
  function fitDisc(t) { t.repeat.set(1 / (2 * R), 1 / (2 * R)); t.offset.set(0.5, 0.5); return t; }
  const discMap = fitDisc(canvasTex(1024, discFace(false), true));
  const discRough = fitDisc(canvasTex(1024, discFace(true), false));
  const noiseTex = (base, spread, seed) => canvasTex(256, function (g, S) {
    const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 9000; i++) { const v = r() * spread; g.fillStyle = "rgba(" + v + "," + v + "," + v + ",0.35)"; g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2); }
  }, true);
  const padMap = noiseTex("#3b3734", 120, 3); padMap.wrapS = padMap.wrapT = THREE.RepeatWrapping; padMap.repeat.set(3, 3);

  // ---------- Materiali ----------
  const discMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: discMap, metalness: 0.92, roughness: 1, roughnessMap: discRough, envMapIntensity: 1.5 });
  const discEdge = new THREE.MeshStandardMaterial({ color: 0x7d8086, metalness: 0.85, roughness: 0.55, envMapIntensity: 1.2 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x55585e, metalness: 0.75, roughness: 0.5, envMapIntensity: 1.2 });
  const boltMat = new THREE.MeshStandardMaterial({ color: 0xd9dade, metalness: 1, roughness: 0.25, envMapIntensity: 1.6 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x6c6f75, metalness: 0.7, roughness: 0.6 });
  const friction = new THREE.MeshStandardMaterial({ color: 0xffffff, map: padMap, metalness: 0.05, roughness: 0.95 });
  const red = new THREE.MeshPhysicalMaterial({ color: 0xb5121b, metalness: 0, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.3 });

  const assembly = new THREE.Group();
  scene.add(assembly);
  const rotor = new THREE.Group();
  assembly.add(rotor);

  // ---------- Disco autoventilante forato: due piste unite da alette ----------
  const PT = 0.1, GAP = 0.12, T = 2 * PT + GAP;
  const discShape = new THREE.Shape();
  discShape.absarc(0, 0, R, 0, Math.PI * 2, false);
  discShape.holes.push(circlePath(0, 0, RI));
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const rr = [1.12, 1.28, 1.44][i % 3];
    discShape.holes.push(circlePath(Math.cos(a + i * 0.004) * rr, Math.sin(a + i * 0.004) * rr, 0.042));
  }
  const plateGeo = new THREE.ExtrudeGeometry(discShape, { depth: PT, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 128 });
  const outer = new THREE.Mesh(plateGeo, [discMat, discEdge]);
  outer.position.z = GAP / 2;
  const inner = new THREE.Mesh(plateGeo, [discMat, discEdge]);
  inner.position.z = -GAP / 2 - PT;
  rotor.add(outer, inner);
  const vaneGeo = new THREE.BoxGeometry(R - RI - 0.08, 0.04, GAP + 0.01);
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const v = new THREE.Mesh(vaneGeo, discEdge);
    const rm = (R + RI) / 2;
    v.position.set(Math.cos(a) * rm, Math.sin(a) * rm, 0);
    v.rotation.z = a + 0.28; // alette leggermente curve, come i dischi direzionali
    rotor.add(v);
  }

  // ---------- Campana e mozzo con prigionieri ----------
  const hub = new THREE.Group();
  const HR = 0.86;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(HR, HR + 0.04, 0.42, 96, 1, true), hatMat);
  wall.rotation.x = Math.PI / 2; wall.position.z = T / 2 + 0.21;
  hub.add(wall);
  const capShape = new THREE.Shape();
  capShape.absarc(0, 0, HR, 0, Math.PI * 2, false);
  capShape.holes.push(circlePath(0, 0, 0.32));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
    capShape.holes.push(circlePath(Math.cos(a) * 0.56, Math.sin(a) * 0.56, 0.07));
  }
  const cap = new THREE.Mesh(new THREE.ExtrudeGeometry(capShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 96 }), hatMat);
  cap.position.z = T / 2 + 0.4;
  hub.add(cap);
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 64), boltMat);
  boss.rotation.x = Math.PI / 2; boss.position.z = T / 2 + 0.5;
  hub.add(boss);
  const studGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.42, 20);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
    const st = new THREE.Mesh(studGeo, boltMat);
    st.rotation.x = Math.PI / 2;
    st.position.set(Math.cos(a) * 0.56, Math.sin(a) * 0.56, T / 2 + 0.62);
    hub.add(st);
  }
  rotor.add(hub);

  // ---------- Pastiglie con piastra in acciaio ----------
  const pa0 = Math.PI / 2 - 0.42, pa1 = Math.PI / 2 + 0.42;
  const liningGeo = new THREE.ExtrudeGeometry(sector(1.07, 1.57, pa0, pa1), { depth: 0.1, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1, curveSegments: 40 });
  const backGeo = new THREE.ExtrudeGeometry(sector(1.02, 1.64, pa0 - 0.05, pa1 + 0.05), { depth: 0.045, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1, curveSegments: 40 });
  function makePad(side) {
    const g = new THREE.Group();
    const lining = new THREE.Mesh(liningGeo, friction);
    const plate = new THREE.Mesh(backGeo, plateMat);
    if (side > 0) { lining.position.z = T / 2 + 0.012; plate.position.z = T / 2 + 0.122; }
    else { lining.position.z = -T / 2 - 0.112; plate.position.z = -T / 2 - 0.167; }
    g.add(lining, plate);
    return g;
  }
  const padOut = makePad(1);
  const padIn = makePad(-1);
  assembly.add(padOut, padIn);

  // ---------- Pinza monoblocco con bulloni e spurgo ----------
  const ca0 = Math.PI / 2 - 0.5, ca1 = Math.PI / 2 + 0.5;
  const caliper = new THREE.Group();
  const halfGeo = new THREE.ExtrudeGeometry(sector(1.05, 1.86, ca0, ca1), { depth: 0.13, bevelEnabled: true, bevelSize: 0.085, bevelThickness: 0.085, bevelSegments: 8, curveSegments: 64 });
  const front = new THREE.Mesh(halfGeo, red);
  front.position.z = T / 2 + 0.26;
  const back = new THREE.Mesh(halfGeo, red);
  back.position.z = -T / 2 - 0.39;
  const bridgeGeo = new THREE.ExtrudeGeometry(sector(1.66, 1.9, ca0 + 0.08, ca1 - 0.08), { depth: T + 0.7, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 6, curveSegments: 64 });
  const bridge = new THREE.Mesh(bridgeGeo, red);
  bridge.position.z = -T / 2 - 0.35;
  caliper.add(front, back, bridge);
  // pannello in rilievo sulla faccia esterna, per dare spessore alla fusione
  const panel = new THREE.Mesh(new THREE.ExtrudeGeometry(sector(1.2, 1.74, ca0 + 0.1, ca1 - 0.1), { depth: 0.03, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 5, curveSegments: 64 }), red);
  panel.position.z = T / 2 + 0.26 + 0.13 + 0.07;
  caliper.add(panel);
  // bulloni a testa esagonale sulla faccia esterna
  const hexGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.06, 6);
  const washerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.015, 32);
  [[1.68, Math.PI / 2 - 0.36], [1.68, Math.PI / 2 + 0.36], [1.2, Math.PI / 2 - 0.4], [1.2, Math.PI / 2 + 0.4]].forEach(function (b) {
    const x = Math.cos(b[1]) * b[0], y = Math.sin(b[1]) * b[0], z = T / 2 + 0.26 + 0.13 + 0.085 + (b[0] > 1.25 && b[0] < 1.7 ? 0.06 : 0);
    const w = new THREE.Mesh(washerGeo, boltMat); w.rotation.x = Math.PI / 2; w.position.set(x, y, z + 0.008);
    const h = new THREE.Mesh(hexGeo, boltMat); h.rotation.x = Math.PI / 2; h.position.set(x, y, z + 0.045);
    caliper.add(w, h);
  });
  // valvola di spurgo in cima
  const bleed = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 16), boltMat);
  bleed.position.set(Math.cos(Math.PI / 2 + 0.3) * 1.95, Math.sin(Math.PI / 2 + 0.3) * 1.95, 0.1);
  bleed.rotation.z = 0.3;
  caliper.add(bleed);
  assembly.add(caliper);

  assembly.rotation.set(0.22, -0.62, 0);

  // Dimensioni
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 12 : 9.4;
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
    caliper.position.set(0, 1.15 * e, 1.7 * e);
    padOut.position.set(0, 0.6 * e, 1.1 * e);
    padIn.position.set(0, 0.6 * e, -1.1 * e);
    hub.position.z = -1.1 * e;
    assembly.rotation.y = -0.62 + 0.45 * smooth(0, 1, p) + tx * 0.18;
    assembly.rotation.x = 0.22 + 0.12 * e + ty * 0.12;
    assembly.position.y = -0.7 * e;
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
