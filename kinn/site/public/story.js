/* RECO home, the films after the intro. Each pinned section scrubs its frames with scroll;
   nothing runs while a section is far off screen. Uses scrubber, progress, cl and reduce from home.js. */
const $ = id => document.getElementById(id);

function pinned(sec, fn, ease = 0.1) {
  let near = false, target = 0, p = 0, raf = 0;
  const read = () => { target = progress(sec); };
  const tick = () => {
    raf = 0; if (!near) return;
    p += (target - p) * (reduce ? 1 : ease); if (Math.abs(target - p) < 0.0003) p = target;
    fn(p); raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(es => {
    near = es[0].isIntersecting; if (near) { read(); p = target; if (!raf) raf = requestAnimationFrame(tick); }
  }, {rootMargin: '60% 0px'}).observe(sec);
  addEventListener('scroll', read, {passive: true}); addEventListener('resize', read);
}
const swapper = els => p => els.forEach(e => e.classList.toggle('on', p >= +e.dataset.in && p < +e.dataset.out));

/* on a tall phone keep the whole object in view rather than cropping to the middle of the frame */
const fitWide = zoom => (W, H, w, h) => (W / H < 1 ? (W * zoom) / w : Math.max(W / w, H / h));
const fitTall = (W, H, w, h) => (W / H < 1 ? Math.max(W * 1.05 / w, (H * 0.74) / h) : H / h);

function film(id, canvas, base, N, fit, end = 1) {
  const sec = $(id), say = swapper([...sec.querySelectorAll('.say [data-in]')]);
  const show = scrubber(sec, $(canvas), base, '.webp', N, fit);
  pinned(sec, p => { show(Math.round(Math.min(1, p / end) * (N - 1))); say(p); });
}
film('problem', 'darkCv', '/worn/dark/d_', 48, fitWide(1.7));
film('apply', 'onCv', '/worn/on/o_', 72, fitWide(1.7), 0.92);

/* ---------- how it works: one pinned film. The page holds still and scrolling only moves the camera.
   Rendered links join the shots, so each one ends where the next begins. ---------- */
(function flow() {
  const cover = (W, H, w, h) => Math.max(W / w, H / h);
  const inPhone = (W, H, w, h) => (W / H < 1 ? (H * 0.74) / h : cover(W, H, w, h));
  const smooth = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const blend = (a, b, t0, t1) => (W, H, w, h, t) => { const k = smooth((t - t0) / (t1 - t0)); return a(W, H, w, h) * (1 - k) + b(W, H, w, h) * k; };
  const wide = fitWide(1.7);

  /* vh = how much scroll the shot takes. Their sum plus 100 is the height of #how in story.css */
  let frame = 0, at = 0;
  const shots = [
    {name: 'bend', src: 'bend/b_', n: 72, vh: 150, fit: wide},
    {name: 'toCoin', src: 'link_press/a_', n: 48, vh: 70, fit: blend(wide, cover, 0, 0.3)},
    {name: 'press', src: 'press/p_', n: 30, vh: 60, fit: cover},
    {name: 'intoPhone', src: 'link_phone/c_', n: 54, vh: 90, fit: blend(cover, inPhone, 0.89, 1)},
    {name: 'phone', src: 'phone/f_', n: 54, vh: 230, fit: inPhone},
    {name: 'away', src: 'link_away/e_', n: 24, vh: 35, fit: inPhone},
    {name: 'legsUp', src: 'link_legs/g_', n: 30, vh: 40, fit: fitTall},
    {name: 'turn', src: 'turn/t_', n: 36, vh: 110, fit: fitTall},
  ].map(s => { const o = {...s, first: frame, from: at}; frame += s.n; at += s.vh; return o; });
  const FRAMES = frame, SPAN = at;
  const by = Object.fromEntries(shots.map(s => [s.name, s]));
  const shotOfFrame = i => shots.find(s => i < s.first + s.n) || shots[shots.length - 1];
  const shotAt = pos => shots.find(s => pos < s.from + s.vh) || shots[shots.length - 1];
  const mark = (name, t = 0) => by[name].from + t * by[name].vh;

  const sec = $('how'), deg = $('fDeg'), degWrap = $('fDegWrap'), line = $('flowLine'), BEND = 130;
  const show = scrubber(sec, $('flowCv'), i => { const s = shotOfFrame(i); return `/worn/${s.src}${String(i - s.first + 1).padStart(3, '0')}.webp`; }, '.webp', FRAMES,
    (W, H, w, h, i) => { const s = shotOfFrame(i); return s.fit(W, H, w, h, (i - s.first) / (s.n - 1)); });

  pinned(sec, p => {
    const pos = p * SPAN, s = shotAt(pos), t = cl((pos - s.from) / s.vh);
    show(s.first + Math.round(t * (s.n - 1)));
    /* the reading is the same eased angle the frames were rendered at */
    const angle = s === by.bend ? BEND * smooth(t) : pos < mark('press') ? BEND * (1 - smooth(t / 0.7)) : 0;
    deg.textContent = Math.round(angle) + '°';
    degWrap.style.opacity = pos < mark('toCoin', 0.45) ? 1 : 0;
    line.classList.toggle('on', pos >= mark('legsUp', 0.5));
  });

  /* the five steps: measure (the bend), press, then see, learn and share across the phone */
  const bar = $('steps'), els = [...bar.children];
  const STEPS = [[mark('bend'), mark('bend', 1)], [mark('toCoin', 0.65), mark('press', 1)], [mark('intoPhone', 0.45), mark('phone', 0.36)], [mark('phone', 0.36), mark('phone', 0.7)], [mark('phone', 0.7), mark('phone', 1)]];
  const upd = () => {
    const pos = progress(sec) * SPAN, on = sec.getBoundingClientRect().top < innerHeight * 0.4 && pos < mark('away', 0.45);
    bar.classList.toggle('show', on); if (!on) return;
    const f = STEPS.map(([a, b]) => cl((pos - a) / (b - a)));
    let cur = 0; f.forEach((v, i) => { if (v > 0) cur = i; });
    els.forEach((e, i) => { e.style.setProperty('--f', f[i].toFixed(3)); e.classList.toggle('cur', i === cur); });
  };
  addEventListener('scroll', upd, {passive: true}); addEventListener('resize', upd); upd();
})();
