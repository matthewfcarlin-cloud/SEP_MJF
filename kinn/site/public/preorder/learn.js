/* Learn more: the real bend film under the scroll, and graphics that play as they come into view. All sample data */
(function learn() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = x => { const t = cl(x); return t * t * (3 - 2 * t); };

  const seen = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } }), {threshold: .3});
  document.querySelectorAll('.l-full').forEach(el => (reduce ? el.classList.add('in') : seen.observe(el)));

  /* the bend. Same film and same easing as the home page: one nearest frame, a step toward the scroll on every refresh */
  const FRAMES = 96, BEND = 130, SCROLL_STEP = .1, STAGE_W = 1536, FILM_H = 864, V = 'v=10', LOAD_AHEAD = '150% 0px';
  const NARROW_W = 760, TAPE_W = 839, TAPE_X = 1022, TAPE_Y = 441, FILL = .92;   // the tape at the peak of the bend, in the film frame
  const section = document.getElementById('angle'), cv = document.getElementById('bendCv'), ctx = cv.getContext('2d'), deg = document.getElementById('bendDeg');
  const images = new Array(FRAMES); let W = 0, H = 0, S = 1, X = 0, Y = 0, shown = -1, p = 0, loading = false;
  const fit = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(cv.clientWidth * dpr); H = cv.height = Math.round(cv.clientHeight * dpr);
    const narrow = innerWidth <= NARROW_W; S = narrow ? W * FILL / TAPE_W : Math.max(W / STAGE_W, H / FILM_H);
    X = W / 2 - (narrow ? TAPE_X : STAGE_W / 2) * S; Y = H / 2 - (narrow ? TAPE_Y : FILM_H / 2) * S; shown = -1;
  };
  const nearest = at => { for (let d = 0; d < FRAMES; d++) { if (images[at - d]) return images[at - d]; if (images[at + d]) return images[at + d]; } return null; };
  function loadFilm() {
    if (loading) return; loading = true;
    const stride = innerWidth <= NARROW_W ? 2 : 1, order = [];
    for (let i = 0; i < FRAMES; i += 8) order.push(i);
    for (let i = 0; i < FRAMES; i += stride) if (i % 8) order.push(i);
    order.push(FRAMES - 1);
    const next = () => { const i = order.shift(); if (i === undefined) return; const im = new Image(); im.onload = () => { images[i] = im; shown = -1; next(); }; im.onerror = next; im.src = `/flow/flex/k_${String(i + 1).padStart(3, '0')}.webp?${V}`; };
    for (let n = 0; n < 6; n++) next();
  }
  new IntersectionObserver(([e]) => { if (e.isIntersecting) loadFilm(); }, {rootMargin: LOAD_AHEAD}).observe(section);
  const target = () => { const b = section.getBoundingClientRect(); return cl(-b.top / Math.max(1, b.height - innerHeight)); };
  function draw(t) {
    const im = nearest(Math.round(t * (FRAMES - 1)));
    deg.textContent = `${Math.round(BEND * smooth(t))}°`;
    if (!im) return;
    ctx.fillStyle = '#0d1212'; ctx.fillRect(0, 0, W, H); ctx.drawImage(im, X, Y, STAGE_W * S, FILM_H * S);
  }
  addEventListener('resize', fit); fit();
  (function tick() {
    requestAnimationFrame(tick);
    const b = section.getBoundingClientRect(); if (b.bottom < -innerHeight || b.top > innerHeight * 2) return;
    const want = target(); p += (want - p) * (reduce ? 1 : SCROLL_STEP); if (Math.abs(want - p) < .0005) p = want;
    if (p === shown) return; shown = p; draw(p);
  })();

  /* load: four weeks of days, and today well above the usual range */
  const LOAD = [34, 40, 46, 28, 42, 50, 37, 31, 44, 52, 41, 30, 47, 38, 43, 35, 49, 29, 45, 39, 33, 48, 40, 32, 46, 51, 36, 88], art = document.getElementById('loadArt');
  LOAD.forEach((h, i) => { const b = document.createElement('b'); b.style.setProperty('--h', `${h}%`); b.style.setProperty('--i', i); if (i === LOAD.length - 1) b.className = 'over'; art.append(b); });

  /* warning dial: fills clockwise, and turns once it passes the usual range */
  const TICKS = 108, LIT = 86, USUAL = 64, C = 200, R0 = 158, R1 = 190, dial = document.getElementById('warnDial'), NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < TICKS; i++) {
    const a = -Math.PI / 2 + i / TICKS * Math.PI * 2, t = document.createElementNS(NS, 'line');
    const outer = i >= USUAL && i < LIT ? R1 + 6 : R1;
    t.setAttribute('x1', C + Math.cos(a) * R0); t.setAttribute('y1', C + Math.sin(a) * R0); t.setAttribute('x2', C + Math.cos(a) * outer); t.setAttribute('y2', C + Math.sin(a) * outer);
    t.style.setProperty('--i', i);
    if (i < USUAL) t.classList.add('lit'); else if (i < LIT) t.classList.add('hot');
    dial.append(t);
  }
})();
