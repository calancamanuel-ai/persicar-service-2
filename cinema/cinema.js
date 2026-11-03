/* Persicar Service – versione "cinema": video IA riprodotto fotogramma per fotogramma allo scroll */
(function () {
  "use strict";

  /* ---------- CONFIGURAZIONE ---------- */
  var WHATSAPP = "393667212576";
  // Fotogrammi per ciascuna delle 4 transizioni (in frames/desk e frames/mob)
  var FRAME_COUNTS = window.CINEMA_FRAMES || [62, 62, 50, 62];
  var EXT = ".webp";

  // Racconto: pause (hold) sulle immagini chiave e movimenti (move) tra una e l'altra. len = altezza in schermate.
  var STEPS = [
    { hold: 0, len: 1.0, show: "hero", chapter: 0 },
    { move: 0, len: 1.6 },
    { hold: 1, len: 1.0, show: "inside", chapter: 1 },
    { move: 1, len: 1.8 },
    { hold: 2, len: 2.4, show: "map", chapter: 2 },
    { move: 2, len: 1.6 },
    { hold: 3, len: 1.0, show: "brake", chapter: 3 },
    { move: 3, len: 1.6 },
    { hold: 4, len: 1.2, show: "diag", chapter: 4 }
  ];

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 800px)").matches;
  var DIR = mobile ? "frames/mob/" : "frames/desk/";

  /* ---------- WhatsApp e orari ---------- */
  document.querySelectorAll(".js-wa").forEach(function (a) {
    if (!WHATSAPP) { if (a.getAttribute("data-fallback") !== "tel") a.hidden = true; return; }
    var text = a.getAttribute("data-wa-text") || "";
    a.href = "https://wa.me/" + WHATSAPP + (text ? "?text=" + encodeURIComponent(text) : "");
    a.target = "_blank"; a.rel = "noopener";
  });

  var SLOTS = [[8 * 60 + 30, 12 * 60 + 30], [14 * 60 + 30, 18 * 60 + 15]];
  function romeNow() {
    var o = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function fmt(m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); }
  function updateStatus() {
    var el = document.getElementById("status"); if (!el) return;
    var n = romeNow(), open = false, text = "";
    if (n.day >= 1 && n.day <= 5) {
      SLOTS.forEach(function (s) { if (!open && n.min >= s[0] && n.min < s[1]) { open = true; text = "Aperto ora · chiude alle " + fmt(s[1]); } });
      if (!open) { var nx = SLOTS.filter(function (s) { return s[0] > n.min; })[0]; if (nx) text = "Chiuso ora · riapre alle " + fmt(nx[0]); }
    }
    if (!open && !text) text = "Chiuso ora · riapre " + (n.day === 5 || n.day === 6 || n.day === 0 ? "lunedì" : "domani") + " alle 8:30";
    el.classList.toggle("is-open", open); el.classList.toggle("is-closed", !open);
    el.querySelector(".status__text").textContent = text;
    var today = document.querySelector('.hours tr[data-day="' + n.day + '"]'); if (today) today.classList.add("is-today");
  }
  updateStatus(); setInterval(updateStatus, 60000);

  /* ---------- Fotogrammi ---------- */
  var segStart = [], total = 0;
  FRAME_COUNTS.forEach(function (c) { segStart.push(total); total += c; });
  // Immagine chiave k: K0 = primo fotogramma, Kk = ultimo fotogramma della transizione k-1
  function keyFrame(k) { return k === 0 ? 0 : segStart[k - 1] + FRAME_COUNTS[k - 1] - 1; }

  var imgs = new Array(total), loaded = new Array(total), loadedCount = 0;
  var bar = document.getElementById("loader-bar");
  function src(i) { return DIR + String(i + 1).padStart(4, "0") + EXT; }
  function order() {
    // prima le immagini chiave, poi la prima transizione, poi il resto a passi sempre più fitti
    var seen = {}, out = [];
    function add(i) { if (i >= 0 && i < total && !seen[i]) { seen[i] = 1; out.push(i); } }
    for (var k = 0; k <= FRAME_COUNTS.length; k++) add(keyFrame(k));
    for (var i = 0; i < FRAME_COUNTS[0]; i++) add(i);
    [8, 4, 2, 1].forEach(function (step) { for (var j = 0; j < total; j += step) add(j); });
    return out;
  }
  var queue = order(), inflight = 0;
  function pump() {
    while (inflight < 6 && queue.length) {
      (function (i) {
        inflight++;
        var im = new Image();
        im.decoding = "async";
        im.onload = function () { loaded[i] = true; loadedCount++; inflight--; needsDraw = true; progressBar(); pump(); };
        im.onerror = function () { inflight--; pump(); };
        im.src = src(i);
        imgs[i] = im;
      })(queue.shift());
    }
  }
  function progressBar() {
    if (!bar) return;
    bar.style.width = (loadedCount / total * 100).toFixed(1) + "%";
    if (loadedCount === total) bar.style.opacity = "0";
  }
  pump();

  function nearest(i) {
    if (loaded[i]) return i;
    for (var d = 1; d < total; d++) {
      if (i - d >= 0 && loaded[i - d]) return i - d;
      if (i + d < total && loaded[i + d]) return i + d;
    }
    return -1;
  }

  /* ---------- Canvas ---------- */
  var canvas = document.getElementById("film");
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1, rect = { x: 0, y: 0, w: 0, h: 0 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    story.style.height = (units * 100) + "vh";
    needsDraw = true;
  }

  var story = document.getElementById("story");
  var units = STEPS.reduce(function (a, s) { return a + s.len; }, 0);
  var stepStart = []; (function () { var u = 0; STEPS.forEach(function (s) { stepStart.push(u); u += s.len; }); })();

  var layers = {};
  document.querySelectorAll("[data-show]").forEach(function (el) { layers[el.getAttribute("data-show")] = el; });
  var spots = [].slice.call(document.querySelectorAll(".spot"));
  var railBtns = [].slice.call(document.querySelectorAll(".rail button"));
  var rail = document.querySelector(".rail");

  var focusX = 0.5, focusTarget = 0.5, zoom = 1, zoomTarget = 1, needsDraw = true, lastFrame = -1;

  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  function state() {
    var max = story.offsetHeight - H;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var u = p * units, idx = STEPS.length - 1;
    for (var i = 0; i < STEPS.length; i++) { if (u < stepStart[i] + STEPS[i].len) { idx = i; break; } }
    var s = STEPS[idx], t = Math.min(1, Math.max(0, (u - stepStart[idx]) / s.len));
    var frame;
    if (s.move !== undefined) {
      var c = FRAME_COUNTS[s.move];
      var tt = reduce ? (t < 0.5 ? 0 : 1) : t;
      frame = segStart[s.move] + Math.round(tt * (c - 1));
    } else frame = keyFrame(s.hold);
    return { idx: idx, t: t, frame: frame, step: s, beyond: window.scrollY > max + 2 };
  }

  function draw(frameIdx) {
    var n = nearest(frameIdx);
    if (n < 0) return;
    var im = imgs[n], iw = im.naturalWidth, ih = im.naturalHeight;
    var s = Math.max(W / iw, (H / ih) * zoom), dw = iw * s, dh = ih * s;
    var dx = Math.min(0, Math.max(W - dw, W / 2 - focusX * dw));
    var dy = (H - dh) / 2;
    rect = { x: dx, y: dy, w: dw, h: dh };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (dh < H) { ctx.fillStyle = "#06070a"; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(im, dx, dy, dw, dh);
  }

  function setLayer(el, a) {
    el.style.opacity = a.toFixed(3);
    el.style.visibility = a > 0.01 ? "visible" : "hidden";
    el.classList.toggle("is-on", a > 0.5);
    if (el.classList.contains("layer--card")) el.style.transform = "translateY(calc(" + (el.classList.contains("layer--left") || el.classList.contains("layer--right") ? (mobile ? "0px" : "-50%") : "0px") + " + " + ((1 - a) * 24).toFixed(1) + "px))";
  }

  function update() {
    var st = state();
    // Livelli di testo
    Object.keys(layers).forEach(function (k) {
      var a = 0;
      if (st.step.show === k) {
        var inA = k === "hero" ? 1 : smooth(0.0, 0.22, st.t);
        var outA = k === "diag" ? 1 : 1 - smooth(0.8, 1.0, st.t);
        a = Math.min(inA, outA);
      }
      setLayer(layers[k], st.beyond ? 0 : a);
    });
    // Punti sullo spaccato
    var active = -1;
    spots.forEach(function (el, i) {
      var on = st.step.show === "map" && st.t > 0.12 + i * 0.13 && st.t < 0.92;
      el.classList.toggle("is-on", on);
      if (on) active = i;
    });
    focusTarget = mobile && active >= 0 ? parseFloat(spots[active].getAttribute("data-x")) : 0.5;
    // su telefono lo spaccato si vede meno zoomato (lo sfondo è scuro)
    zoomTarget = mobile && W < H && st.step.show === "map" ? 0.6 : 1;
    document.body.classList.toggle("is-end", st.beyond);
    // Capitoli
    var ch = -1;
    for (var i = st.idx; i >= 0; i--) { if (STEPS[i].chapter !== undefined) { ch = STEPS[i].chapter; break; } }
    railBtns.forEach(function (b, i) { b.classList.toggle("is-active", i === ch); });
    rail.classList.toggle("is-hidden", st.beyond);
    return st;
  }

  function placeSpots() {
    spots.forEach(function (el) {
      var x = rect.x + parseFloat(el.getAttribute("data-x")) * rect.w;
      var y = rect.y + parseFloat(el.getAttribute("data-y")) * rect.h;
      el.style.left = x + "px"; el.style.top = y + "px";
      if (x < 20 || x > W - 20) el.classList.remove("is-on");
    });
  }

  function loop() {
    var st = update();
    var f = focusX + (focusTarget - focusX) * 0.08;
    if (Math.abs(f - focusX) > 0.0005) { focusX = f; needsDraw = true; }
    var z = zoom + (zoomTarget - zoom) * 0.08;
    if (Math.abs(z - zoom) > 0.0005) { zoom = z; needsDraw = true; }
    if (st.frame !== lastFrame || needsDraw) { draw(st.frame); placeSpots(); lastFrame = st.frame; needsDraw = false; }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);

  /* ---------- Rail: salto ai capitoli ---------- */
  railBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var c = parseInt(b.getAttribute("data-chapter"), 10);
      var i = STEPS.findIndex(function (s) { return s.chapter === c; });
      var u = stepStart[i] + STEPS[i].len * 0.45;
      var y = u / units * (story.offsetHeight - H);
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- Scroll morbido ---------- */
  if (!reduce && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    window.__lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
})();
