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
film('press', 'pressCv', '/worn/press/p_', 30, undefined, 0.8);
film('phone', 'phoneCv', '/worn/phone/f_', 54, (W, H, w, h) => (W / H < 1 ? (H * 0.74) / h : Math.max(W / w, H / h)));
film('wear', 'wearCv', '/worn/turn/t_', 36, fitTall);

/* the bend: the reading is the same eased angle the frame was rendered at */
(function bend() {
  const sec = $('how'), deg = $('fDeg'), N = 72, BEND = 130, show = scrubber(sec, $('flexCv'), '/worn/bend/b_', '.webp', N, fitWide(1.7));
  pinned(sec, p => {
    const f = Math.round(Math.min(1, p / 0.92) * (N - 1)); show(f);
    const u = f / (N - 1); deg.textContent = Math.round(BEND * u * u * (3 - 2 * u)) + '°';
  });
})();

/* the five steps: measure (the bend), press, then see, learn and share across the phone film */
(function steps() {
  const bar = $('steps'), wrap = $('howWrap'), els = [...bar.children], how = $('how'), press = $('press'), phone = $('phone');
  const upd = () => {
    const r = wrap.getBoundingClientRect(), on = r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.75;
    bar.classList.toggle('show', on); if (!on) return;
    const ph = progress(phone);
    const f = [progress(how), progress(press), cl(ph / 0.36), cl((ph - 0.36) / 0.34), cl((ph - 0.7) / 0.3)];
    let cur = 0; f.forEach((v, i) => { if (v > 0) cur = i; });
    els.forEach((e, i) => { e.style.setProperty('--f', f[i].toFixed(3)); e.classList.toggle('cur', i === cur); });
  };
  addEventListener('scroll', upd, {passive: true}); addEventListener('resize', upd); upd();
})();
