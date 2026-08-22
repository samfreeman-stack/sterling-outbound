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
/* Hero network — businesses appear, one lights up as the relevant match  */
/* ---------------------------------------------------------------------- */
(function initHeroNetwork() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".hero-network").forEach((net) => {
    const nodes = net.querySelectorAll("[data-hn-node]");
    if (!nodes.length) return;
    if (prefersReduced) {
      nodes.forEach((n) => n.classList.add("is-shown"));
      nodes[Math.floor(nodes.length / 2)].classList.add("is-match");
      return;
    }
    nodes.forEach((n, i) => {
      setTimeout(() => n.classList.add("is-shown"), 150 + i * 110);
    });
    const matchIndex = Math.floor(nodes.length / 2);
    setTimeout(() => nodes[matchIndex].classList.add("is-match"), 150 + nodes.length * 110 + 300);
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
/* Qualification journey — Prospect -> Engaged -> Qualified -> Appointment */
/* lights up in sequence once scrolled into view, communicating movement. */
/* ---------------------------------------------------------------------- */
(function initQualificationJourney() {
  const flow = document.querySelector(".funnel-flow");
  if (!flow) return;

  const stages = flow.querySelectorAll(".stage");
  const arrows = flow.querySelectorAll(".arrow");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STAGGER = 380;

  const reveal = () => {
    stages.forEach((s, i) => setTimeout(() => s.classList.add("is-reached"), i * STAGGER));
    arrows.forEach((a, i) => setTimeout(() => a.classList.add("is-passed"), i * STAGGER + STAGGER / 2));
  };

  if (prefersReduced) {
    stages.forEach((s) => s.classList.add("is-reached"));
    arrows.forEach((a) => a.classList.add("is-passed"));
    return;
  }
  if (typeof gsap === "undefined") { reveal(); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: flow,
    start: "top 85%",
    once: true,
    onEnter: reveal,
  });
})();

/* ---------------------------------------------------------------------- */
/* Campaign showcase — tab switching + spine draw-in                      */
/* ---------------------------------------------------------------------- */
(function initCampaignShowcase() {
  const showcase = document.querySelector(".campaign-showcase");
  if (!showcase) return;

  const tabs = showcase.querySelectorAll(".campaign-tab");
  const panels = showcase.querySelectorAll(".campaign-panel");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const STAGGER = 260; // ms between each stage lighting up

  function playJourney(panel) {
    const rows = panel.querySelectorAll(".campaign-node-row");
    const spine = panel.querySelector(".campaign-spine");
    const pulse = panel.querySelector(".campaign-pulse");

    rows.forEach((r) => r.classList.remove("is-lit"));

    if (prefersReduced || !hasGsap) {
      rows.forEach((r) => r.classList.add("is-lit"));
      if (spine) spine.style.transform = "scaleY(1)";
      if (pulse) pulse.style.opacity = "0";
      return;
    }

    const totalMs = (rows.length - 1) * STAGGER + 550;
    rows.forEach((r, i) => setTimeout(() => r.classList.add("is-lit"), i * STAGGER));

    if (spine) {
      gsap.set(spine, { scaleY: 0 });
      gsap.to(spine, { scaleY: 1, duration: totalMs / 1000, ease: "none" });
    }
    if (pulse) {
      const travel = Math.max(spine ? spine.offsetHeight : 0, 0);
      gsap.killTweensOf(pulse);
      gsap.set(pulse, { y: 0, opacity: 1 });
      gsap.to(pulse, {
        y: travel,
        duration: totalMs / 1000,
        ease: "none",
        onComplete: () => gsap.to(pulse, { opacity: 0, duration: 0.4 }),
      });
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-campaign-tab");
      if (tab.classList.contains("is-active")) return;

      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      let shownPanel = null;
      panels.forEach((panel) => {
        const match = panel.getAttribute("data-campaign-panel") === target;
        panel.classList.toggle("is-active", match);
        panel.hidden = !match;
        if (match) shownPanel = panel;
      });
      if (shownPanel) playJourney(shownPanel);
    });
  });

  const activePanel = showcase.querySelector(".campaign-panel.is-active");
  if (!activePanel) return;

  if (prefersReduced || !hasGsap) {
    playJourney(activePanel);
    return;
  }
  ScrollTrigger.create({
    trigger: showcase,
    start: "top 70%",
    once: true,
    onEnter: () => playJourney(activePanel),
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
