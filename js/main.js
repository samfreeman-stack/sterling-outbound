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
