/* Persicar Service – interazioni pagina */
(function () {
  "use strict";

  /* ---------- CONFIGURAZIONE ----------
   * WHATSAPP: numero in formato internazionale senza "+" e spazi (es. "393331234567").
   * Lascialo vuoto finché non è confermato: i pulsanti WhatsApp restano nascosti.
   */
  var WHATSAPP = "";

  /* Immagini illustrative generate con Higgsfield.
   * Per usare foto locali, metti i file in assets/img/ e sostituisci l'URL con "assets/img/nome.webp". */
  var CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3LQJY9oKHwdWiFyDsrmXp5hBChK/";
  var IMAGES = {
    hero:     CDN + "hf_20261103_205111_e3f50db9-1d79-4008-80ca-a12ebde0a238.png",
    olio:     CDN + "hf_20261103_205111_f520a6a2-bf39-4a7a-938e-d651d0bf08c2_min.webp",
    diagnosi: CDN + "hf_20261103_205113_ba133e10-9366-454f-bdeb-1c305b62ec85_min.webp",
    freni:    CDN + "hf_20261103_205135_d7d17209-d825-41e3-be6e-e33dd7fe848b_min.webp",
    gomme:    CDN + "hf_20261103_205112_051283db-2f0e-4146-bbba-53ce5b888b2d_min.webp",
    batteria: CDN + "hf_20261103_205135_8274c142-7623-4e23-b4d6-2b66c01d118a_min.webp",
    clima:    CDN + "hf_20261103_205114_16b3e164-9709-41e4-aa12-3a06aa9872d2_min.webp",
    attrezzi: CDN + "hf_20261103_205112_2abb98b3-11e0-47e8-9078-de14ef4ca556_min.webp",
    motore:   CDN + "hf_20261103_205113_decdbeec-1237-4bc4-b42e-7aa67d9c5013_min.webp",
    esterno:  CDN + "hf_20261103_205113_96aaef18-ef66-4394-80e7-8f9fc743d0a3_min.webp"
  };

  document.querySelectorAll("img[data-img]").forEach(function (img) {
    var src = IMAGES[img.getAttribute("data-img")];
    if (src) img.src = src;
  });

  /* ---------- WhatsApp ---------- */
  document.querySelectorAll(".js-wa").forEach(function (a) {
    if (!WHATSAPP) { if (a.getAttribute("data-fallback") !== "tel") a.hidden = true; return; }
    var text = a.getAttribute("data-wa-text") || "";
    a.href = "https://wa.me/" + WHATSAPP + (text ? "?text=" + encodeURIComponent(text) : "");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Aperto ora ---------- */
  var SLOTS = [[8 * 60 + 30, 12 * 60 + 30], [14 * 60 + 30, 18 * 60 + 30]]; // lun–ven
  function romeNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function fmt(m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); }
  function updateStatus() {
    var el = document.getElementById("status");
    if (!el) return;
    var n = romeNow();
    var weekday = n.day >= 1 && n.day <= 5;
    var text, open = false;
    if (weekday) {
      for (var i = 0; i < SLOTS.length; i++) {
        if (n.min >= SLOTS[i][0] && n.min < SLOTS[i][1]) { open = true; text = "Aperto ora · chiude alle " + fmt(SLOTS[i][1]); break; }
      }
      if (!open) {
        var next = SLOTS.filter(function (s) { return s[0] > n.min; })[0];
        if (next) text = "Chiuso ora · riapre alle " + fmt(next[0]);
      }
    }
    if (!open && !text) {
      var toMonday = n.day === 5 || n.day === 6 || n.day === 0;
      text = "Chiuso ora · riapre " + (toMonday ? "lunedì" : "domani") + " alle 8:30";
    }
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    el.querySelector(".status__text").textContent = text;
    var today = document.querySelector('.hours tr[data-day="' + n.day + '"]');
    if (today) today.classList.add("is-today");
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Motion ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap) return;

  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: id === "#top" ? 0 : -60 });
      });
    });
    window.__lenis = lenis;
  }

  // Intro hero
  var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(".hero__media img", { scale: 1.12, duration: 2.2, ease: "power2.out" }, 0)
    .from(".hero__title .line > *, .hero__title .line", { yPercent: 105, duration: 1.2, stagger: 0.1 }, 0.15)
    .from(".status, .hero__lead, .hero__cta, .hero__facts", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.5);

  // Parallax hero
  gsap.to(".hero__media img", {
    yPercent: 12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  // Reveal
  gsap.utils.toArray(".reveal").forEach(function (el, i) {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 1, ease: "expo.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });
  gsap.utils.toArray(".section__head").forEach(function (el) {
    gsap.from(el.children, {
      y: 30, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
  });

  // Parallax galleria
  gsap.utils.toArray(".g img").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // Contatore
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.6, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
      onUpdate: function () { el.textContent = o.v.toFixed(dec).replace(".", ","); }
    });
  });
})();
