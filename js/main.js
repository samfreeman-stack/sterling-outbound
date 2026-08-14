/* ==========================================================================
   Sterling Outbound — shared behaviour
   Nav (mobile toggle + dropdown), Lenis smooth scroll, GSAP scroll reveals,
   FAQ accordion, Three.js network hero (full on home, lightweight elsewhere).
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
/* Three.js abstract network hero                                        */
/* Full treatment (ambient particles + connected node cluster) on the     */
/* homepage; a lighter node-only version (no ambient field) elsewhere.    */
/* ---------------------------------------------------------------------- */
(function initHero() {
  const mount = document.getElementById("hero-canvas-mount");
  if (!mount) return;

  function supportsWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  if (typeof THREE === "undefined" || !supportsWebGL()) {
    document.documentElement.classList.add("no-webgl");
    return;
  }

  const isFull = mount.dataset.heroVariant === "full";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.z = isFull ? 13 : 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  // ---- node cluster with static-topology connecting lines ----
  const NODE_COUNT = isFull ? 60 : 34;
  const RADIUS = isFull ? 7.5 : 6.5;
  const nodePositions = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * RADIUS * 2,
      (Math.random() - 0.5) * RADIUS * 1.3,
      (Math.random() - 0.5) * RADIUS
    );
    nodePositions.push(v);
  }

  const nodeGeo = new THREE.BufferGeometry();
  const nodeArr = new Float32Array(NODE_COUNT * 3);
  nodePositions.forEach((v, i) => {
    nodeArr[i * 3] = v.x;
    nodeArr[i * 3 + 1] = v.y;
    nodeArr[i * 3 + 2] = v.z;
  });
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodeArr, 3));
  const nodeMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: isFull ? 0.09 : 0.075,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });
  group.add(new THREE.Points(nodeGeo, nodeMat));

  // connect nearby nodes once (static topology, cheap to render every frame)
  const linePositions = [];
  const MAX_DIST = RADIUS * 0.62;
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      if (nodePositions[i].distanceTo(nodePositions[j]) < MAX_DIST) {
        linePositions.push(
          nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
          nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
        );
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.18 });
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  // ---- ambient background particle field (home hero only) ----
  let ambient;
  if (isFull) {
    const AMBIENT_COUNT = 900;
    const ambGeo = new THREE.BufferGeometry();
    const ambArr = new Float32Array(AMBIENT_COUNT * 3);
    for (let i = 0; i < AMBIENT_COUNT * 3; i++) ambArr[i] = (Math.random() - 0.5) * 26;
    ambGeo.setAttribute("position", new THREE.BufferAttribute(ambArr, 3));
    const ambMat = new THREE.PointsMaterial({
      color: 0x1e293b,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
    });
    ambient = new THREE.Points(ambGeo, ambMat);
    scene.add(ambient);
  }

  let raf;
  const clock = new THREE.Clock();
  function animate() {
    raf = requestAnimationFrame(animate);
    if (!reduceMotion) {
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.035;
      group.rotation.x = Math.sin(t * 0.15) * 0.06;
      if (ambient) ambient.rotation.y = -t * 0.008;
    }
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  // pause rendering when off-screen to save battery/CPU
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            cancelAnimationFrame(raf);
          } else if (!raf) {
            animate();
          }
        });
      },
      { threshold: 0 }
    );
    io.observe(mount);
  }
})();
