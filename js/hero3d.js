/* =========================================================
   Elixa Renewables — 3D hero
   An interactive "clean energy" sphere: a glowing wireframe
   globe wrapped in orbiting particles that drift toward it,
   representing air being drawn in and turned into warmth.

   Progressive enhancement: if Three.js can't load (offline,
   blocked CDN), the CSS gradient hero simply shows instead.
   ========================================================= */

const canvas = document.getElementById('hero-canvas');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !prefersReduced) {
  import('three')
    .then((THREE) => initHero(THREE))
    .catch(() => { /* CSS fallback background remains visible */ });
}

function initHero(THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0, 8.4);

  const group = new THREE.Group();
  scene.add(group);

  // ----- Brand colours: green → teal → blue -----
  const C_GREEN = new THREE.Color('#8ed04a');
  const C_TEAL = new THREE.Color('#35b1ab');
  const C_BLUE = new THREE.Color('#2b9fd4');

  // ----- Central glowing sphere (wireframe icosahedron) -----
  const coreGeo = new THREE.IcosahedronGeometry(2.05, 2);
  const coreMat = new THREE.MeshBasicMaterial({ color: C_TEAL, wireframe: true, transparent: true, opacity: 0.34 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner solid glow orb
  const glowGeo = new THREE.IcosahedronGeometry(1.55, 3);
  const glowMat = new THREE.MeshBasicMaterial({ color: C_BLUE, transparent: true, opacity: 0.10 });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  // ----- Orbiting particle field -----
  const COUNT = Math.min(1400, Math.floor((window.innerWidth * window.innerHeight) / 1400) + 500);
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const radii = new Float32Array(COUNT);
  const angles = new Float32Array(COUNT);
  const tilts = new Float32Array(COUNT);

  const tmp = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const r = 2.6 + Math.random() * 4.2;
    const a = Math.random() * Math.PI * 2;
    const tilt = (Math.random() - 0.5) * Math.PI;
    radii[i] = r;
    angles[i] = a;
    tilts[i] = tilt;
    speeds[i] = 0.06 + Math.random() * 0.22;

    setParticle(i, r, a, tilt);

    const t = Math.random();
    tmp.copy(t < 0.45 ? C_BLUE : (t < 0.8 ? C_TEAL : C_GREEN));
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }

  function setParticle(i, r, a, tilt) {
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = Math.sin(a * 1.3 + tilt) * r * 0.42;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.055, vertexColors: true, transparent: true, opacity: 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);

  // ----- Pointer parallax -----
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ----- Resize -----
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ----- Animation loop -----
  let raf;
  let running = true;
  const clock = new THREE.Clock();

  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Rotate the core gently
    group.rotation.y += dt * 0.12;
    core.rotation.x = Math.sin(t * 0.3) * 0.15;
    glowMat.opacity = 0.09 + Math.sin(t * 1.6) * 0.03;

    // Advance particles along their orbits + slow inward drift
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      angles[i] += speeds[i] * dt;
      radii[i] -= dt * 0.14 * speeds[i] * 3;
      if (radii[i] < 2.35) radii[i] = 2.6 + Math.random() * 4.2; // recycle inward → outward
      setParticle(i, radii[i], angles[i], tilts[i]);
    }
    pGeo.attributes.position.needsUpdate = true;

    // Parallax easing
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;
    group.rotation.z = current.x * 0.12;
    camera.position.x = current.x * 0.9;
    camera.position.y = -current.y * 0.6;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  // Pause when off-screen to save battery
  const heroEl = document.querySelector('.hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !running) { running = true; clock.start(); tick(); }
        else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.01 }).observe(heroEl);
  }
}
