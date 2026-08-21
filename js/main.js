/* ==========================================================================
   Sterling Outbound — shared behaviour
   Nav (mobile toggle + dropdown), Lenis smooth scroll, GSAP scroll reveals,
   FAQ accordion.
   ========================================================================== */

document.documentElement.classList.remove("no-js");

/* ---------------------------------------------------------------------- */
/* Mobile nav                                                             */
/* ---------------------------------------------------------------------- */
(function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav-dropdown-item > .has-dropdown").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      if (window.innerWidth > 860) return;
      e.preventDefault();
      trigger.parentElement.classList.toggle("open");
    });
  });

  // highlight current page in nav
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]").forEach((a) => {
    const href = a.getAttribute("href").split("/").pop();
    if (href === path) a.classList.add("active");
  });
})();

/* ---------------------------------------------------------------------- */
/* FAQ accordion                                                          */
/* ---------------------------------------------------------------------- */
(function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close siblings within the same list for a cleaner accordion feel
      item.parentElement.querySelectorAll(".faq-item.open").forEach((sib) => {
        if (sib !== item) {
          sib.classList.remove("open");
          sib.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      item.classList.toggle("open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* Lenis smooth scroll + GSAP ScrollTrigger sync                          */
/* ---------------------------------------------------------------------- */
let lenis;
(function initSmoothScroll() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof Lenis === "undefined" || prefersReduced) return;

  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", () => {
    if (window.ScrollTrigger) ScrollTrigger.update();
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* ---------------------------------------------------------------------- */
/* GSAP scroll reveals                                                    */
/* ---------------------------------------------------------------------- */
(function initReveals() {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-reveal]").forEach((section) => {
    const targets = section.querySelectorAll(":scope > *");
    if (prefersReduced) return;
    gsap.from(targets.length ? targets : section, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });

  document.querySelectorAll("[data-reveal-item]").forEach((el) => {
    if (prefersReduced) return;
    gsap.from(el, {
      opacity: 0,
      y: 16,
      duration: 0.45,
      ease: "power1.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* Hero discovery flow — lights up top-to-bottom shortly after load       */
/* ---------------------------------------------------------------------- */
(function initHeroFlow() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".hero-flow-list").forEach((list) => {
    const items = list.querySelectorAll("li");
    if (prefersReduced) {
      items.forEach((li) => li.classList.add("is-lit"));
      return;
    }
    items.forEach((li, i) => {
      setTimeout(() => li.classList.add("is-lit"), 300 + i * 220);
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* Process track — nodes light up in sequence once scrolled into view     */
/* ---------------------------------------------------------------------- */
(function initProcessTrack() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tracks = document.querySelectorAll(".process-track");
  if (!tracks.length) return;

  if (prefersReduced || typeof gsap === "undefined") {
    tracks.forEach((track) => track.querySelectorAll(".process-node").forEach((n) => n.classList.add("is-lit")));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  tracks.forEach((track) => {
    const nodes = track.querySelectorAll(".process-node");
    ScrollTrigger.create({
      trigger: track,
      start: "top 80%",
      once: true,
      onEnter: () => {
        nodes.forEach((n, i) => setTimeout(() => n.classList.add("is-lit"), i * 220));
      },
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* Stat numbers — count up from 0 once scrolled into view                */
/* ---------------------------------------------------------------------- */
(function initStatCountUp() {
  const nums = document.querySelectorAll(".stat-flow-num");
  if (!nums.length) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  nums.forEach((el) => {
    const match = el.textContent.trim().match(/^(\D*)([\d,]+)(\D*)$/);
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr.replace(/,/g, ""), 10);
    if (Number.isNaN(target)) return;
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 1.1,
          ease: "power1.out",
          onUpdate: () => {
            el.textContent = prefix + Math.round(counter.val).toLocaleString("en-GB") + suffix;
          },
        });
      },
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* Targeting network diagram — connecting lines draw in on scroll.        */
/* Nodes stay visible via CSS at all times (only the lines are JS-        */
/* animated), so the diagram never depends on a tween completing.        */
/* ---------------------------------------------------------------------- */
(function initNetworkDiagram() {
  const svg = document.querySelector(".network-diagram");
  if (!svg) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || typeof gsap === "undefined") return;

  const lines = svg.querySelectorAll(".net-line");
  if (!lines.length) return;

  lines.forEach((line) => {
    const len = line.getTotalLength();
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
  });

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: svg,
    start: "top 80%",
    once: true,
    onEnter: () => {
      gsap.to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" });
    },
  });
})();
