document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const topbar = document.getElementById('topbar');


/* ---------- frame loading: a few at a time, and whatever is on screen goes first ---------- */
const frameQueue = (() => {
  const sets = []; let active = 0; const MAX = 8;
  const onScreen = sec => { const r = sec.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  const pump = () => {
    while (active < MAX) {
      const live = sets.filter(x => x.jobs.length); if (!live.length) return;
      const set = live.find(x => onScreen(x.sec)) || live[0];
      const [im, src] = set.jobs.shift()();
      active++;
      const done = () => { active--; pump(); };
      im.addEventListener('load', done, {once: true}); im.addEventListener('error', done, {once: true});
      im.src = src;
    }
  };
  return {add(sec, jobs) { sets.push({sec, jobs}); pump(); }};
})();

/* ---------- frame scrubbers (the films share one loader) ---------- */
function scrubber(sec, cv, base, ext, N, scaleFor) {
  const ctx = cv.getContext('2d'), frames = []; let started = false, shown = -1;
  const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(cv.clientWidth * d); cv.height = Math.round(cv.clientHeight * d); shown = -1; };
  addEventListener('resize', fit); fit();
  const ready = im => im && im.complete && im.naturalWidth;
  const draw = i => { const im = frames[i]; if (!ready(im)) return false; const W = cv.width, H = cv.height, s = scaleFor ? scaleFor(W, H, im.naturalWidth, im.naturalHeight) : Math.max(W / im.naturalWidth, H / im.naturalHeight); ctx.clearRect(0, 0, W, H); ctx.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); return true; };
  const conn = navigator.connection || {}, stride = innerWidth < 760 || conn.saveData ? 2 : 1;   // phones and data-saver load every second frame
  const load = () => { const order = []; for (let k = 8; k >= stride; k >>= 1) for (let i = 0; i < N; i += k) if (!order.includes(i)) order.push(i);
    frameQueue.add(sec, order.map(i => () => { const im = new Image(); frames[i] = im; if (!i) im.addEventListener('load', () => { sec.classList.add('live'); shown = -1; }); return [im, base + String(i + 1).padStart(3, '0') + ext]; })); };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; load(); } }, {rootMargin: '150% 0px'}).observe(sec);
  return f => { if (f !== shown && started) { let k = f; while (k > 0 && !ready(frames[k])) k--; if (draw(k)) shown = k === f ? f : -1; } };
}
const progress = sec => { const b = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight; return cl(-b.top / Math.max(1, span)); };

/* ---------- hero: RECO v7 frames. Float + turn → drop + 60° twist (lock at .6) → pull back to the strip ---------- */
(function hero() {
  const sec = document.getElementById('top'), cv = document.getElementById('heroCv');
  const lines = [...sec.querySelectorAll('.lines [data-in]')], ticks = [...sec.querySelectorAll('.tick span')];
  const cue = document.getElementById('heroCue'), ghost = document.getElementById('ghost'), flashEl = document.getElementById('flash');
  const N = 120, LOCK = 0.6, show = scrubber(sec, cv, '/hero7/h_', '.webp', N);
  let target = 0, prog = 0, mx = 0, my = 0, tx = 0, ty = 0, was = false, snapT = -1;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, {passive: true});
  const read = () => { target = progress(sec); }; addEventListener('scroll', read, {passive: true}); read(); prog = target;
  (function tick(now) {
    requestAnimationFrame(tick);
    prog += (target - prog) * (reduce ? 1 : 0.1); if (Math.abs(target - prog) < 0.0003) prog = target;
    const p = reduce ? 1 : prog; show(Math.round(p * (N - 1)));
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;                       // a little depth under the cursor
    const k = reduce ? 0 : 1 - p * 0.6; cv.style.transform = `translate3d(${(-mx * 14 * k).toFixed(1)}px,${(-my * 10 * k).toFixed(1)}px,0)`;
    const locked = p >= LOCK; if (locked && !was) { snapT = now; was = true; } if (!locked && was) { was = false; snapT = -1; }
    const since = snapT < 0 ? 99 : (now - snapT) / 1000; flashEl.style.opacity = locked && !reduce ? (0.9 * Math.exp(-since * 3.5)).toFixed(3) : 0;
    lines.forEach(l => l.classList.toggle('on', p >= +l.dataset.in && p < +l.dataset.out));
    const phase = p < 0.36 ? 0 : p < LOCK + 0.04 ? 1 : 2; ticks.forEach((s, i) => s.classList.toggle('on', i === phase));
    cue.classList.toggle('off', p > 0.03); ghost.classList.toggle('off', p > 0.3);
  })(performance.now());
})();

/* ---------- film: scroll scrubs fiber → strip ---------- */
(function film() {
  const sec = document.getElementById('film'), words = [...sec.querySelectorAll('[data-in]')], meter = document.getElementById('meter');
  const N = 90, show = scrubber(sec, document.getElementById('filmCanvas'), '/film7/v_', '.webp', N);
  let target = 0, prog = 0; const read = () => { target = progress(sec); }; addEventListener('scroll', read, {passive: true}); read();
  (function tick() {
    requestAnimationFrame(tick);
    prog += (target - prog) * (reduce ? 1 : 0.1); if (Math.abs(target - prog) < 0.0004) prog = target;
    const u = Math.min(1, prog / 0.92); show(Math.round(u * (N - 1)));
    words.forEach(w => w.classList.toggle('on', prog >= +w.dataset.in && prog < +w.dataset.out));
    const fov = 7.2 * Math.pow(266 / 7.2, Math.pow(u, 1.2));   // same zoom curve the render used
    meter.textContent = 'Field of view · ' + (fov < 100 ? fov.toFixed(fov < 10 ? 1 : 0) : Math.round(fov)) + ' mm';
  })();
})();

/* ---------- statement: letters fill, "comeback." stretches past your usual and snaps back ---------- */
(function lit() {
  const sec = document.getElementById('mission'), h = document.getElementById('lit');
  const w2 = h.querySelector('.w2');
  const fades = [...sec.querySelectorAll('.fade')].map(el => [el, ...el.dataset.o.split(',').map(Number)]);
  const chars = [];
  h.querySelectorAll('.w1,.w2').forEach(w => { const t = w.textContent; w.textContent = ''; for (const c of t) { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c === ' ' ? ' ' : c; w.appendChild(s); chars.push(s); } });
  const N = chars.length, FILL_END = .5, STR_A = .5, STR_B = .7; let snapped = false;
  const upd = () => {
    const p = reduce ? 1 : progress(sec);
    chars.forEach((c, i) => { const k = cl((p / FILL_END) * (N + 4) - i, 0, 4) / 4; c.style.opacity = (.14 + .86 * k).toFixed(3); c.style.filter = k < 1 ? `blur(${((1 - k) * 10).toFixed(1)}px)` : 'none'; c.style.transform = `translateY(${((1 - k) * .22).toFixed(3)}em)`; });
    const st = cl((p - STR_A) / (STR_B - STR_A)), snap = p > STR_B;
    if (snap !== snapped) { snapped = snap; sec.classList.toggle('snap', snap); }
    w2.style.setProperty('--ls', snap ? '-.015em' : (-.015 + st * (innerWidth < 700 ? .05 : .16)).toFixed(3) + 'em');
    fades.forEach(([el, a, b]) => el.style.setProperty('--o', cl((p - a) / (b - a)).toFixed(3)));
  };
  addEventListener('scroll', upd, {passive: true}); addEventListener('resize', upd); upd();
})();

/* ---------- reveal (cards fade up 8px, 60ms stagger) ---------- */
if ('IntersectionObserver' in window && !reduce) {
  const io = new IntersectionObserver(es => { let k = 0; es.forEach(e => { if (e.isIntersecting) { const el = e.target; setTimeout(() => el.classList.remove('pending'), 60 * k++); io.unobserve(el); } }); }, {rootMargin: '0px 0px -10% 0px'});
  document.querySelectorAll('.rv').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pending'); io.observe(el); } });
}

/* ---------- join: the headline starts bent round a knee, edges blurred, and straightens as you scroll in ---------- */
(function bendIn() {
  const el = document.getElementById('bendin'); if (!el) return;
  const chars = [];
  el.querySelectorAll('.ln').forEach((ln, li) => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) { const f = document.createDocumentFragment(); for (const c of n.textContent) { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c === ' ' ? '\u00a0' : c; f.appendChild(s); chars.push({s, li}); } n.replaceWith(f); }
      else walk(n);
    });
    walk(ln);
  });
  let geo = [];
  const measure = () => {
    chars.forEach(c => c.s.style.transform = c.s.style.filter = c.s.style.opacity = '');
    const lines = {}; chars.forEach(c => { const r = c.s.getBoundingClientRect(); c.cx = r.left + r.width / 2; (lines[c.li] = lines[c.li] || []).push(c); });
    geo = chars.map(c => { const L = lines[c.li], a = L[0].s.getBoundingClientRect().left, b = L[L.length - 1].s.getBoundingClientRect().right, m = (a + b) / 2, h = (b - a) / 2;
      return {s: c.s, x: (c.cx - m) / h, w: h}; });
  };
  const sec = document.getElementById('join');
  const upd = () => {
    const r = el.getBoundingClientRect(), H = innerHeight, c = r.top + r.height / 2;
    const k = reduce ? 1 : cl((H * 0.95 - c) / (H * 0.4));          // short scroll: headline centre from 95% to 55% of the screen
    const e = 1 - Math.pow(1 - k, 3), bend = 1 - e;
    geo.forEach(({s, x, w}) => {
      const ax = Math.abs(x), ang = x * 34 * bend;                  // each side curls back as if wrapped over a knee
      const lift = ax * ax * w * 0.22 * bend;
      s.style.transform = bend < 0.001 ? '' : `translateY(${lift.toFixed(1)}px) rotateY(${(-ang).toFixed(2)}deg) rotateZ(${(x * 9 * bend).toFixed(2)}deg)`;
      s.style.filter = bend < 0.001 ? '' : `blur(${(Math.pow(ax, 1.6) * 9 * bend).toFixed(2)}px)`;
      s.style.opacity = (1 - Math.pow(ax, 2) * 0.75 * bend).toFixed(3);
    });
  };
  const all = () => { measure(); upd(); };
  addEventListener('scroll', upd, {passive: true}); addEventListener('resize', all);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(all); all();
})();

/* ---------- waitlist intake (opens on "Join") ---------- */
const dlg = document.getElementById('intake'), form = document.getElementById('form'), msg = document.getElementById('msg'), patientRows = [...form.querySelectorAll('[data-patient]')];
const SOURCE = (new URLSearchParams(location.search).get('src') || 'site').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'site';
/* questions renumber themselves when the injury and sport rows are hidden for non-patients */
function renumber() { let n = 0; form.querySelectorAll('.q').forEach(q => { if (q.hidden) return; n += 1; const t = q.querySelector(':scope > .n'); if (t) t.textContent = String(n).padStart(2, '0'); }); }
let lastFocus = null;
function openJoin(e) { if (e) e.preventDefault(); lastFocus = document.activeElement; if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); document.body.style.overflow = 'hidden'; setTimeout(() => (form.hidden ? dlg.querySelector('.done .go') : form.email).focus(), 60); }
function closeJoin() { if (dlg.open) dlg.close(); }
dlg.addEventListener('close', () => { document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); });
document.querySelectorAll('[data-join]').forEach(a => a.addEventListener('click', openJoin));
dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeJoin));
if (location.hash === '#join') openJoin();
form.addEventListener('change', () => { const pat = form.role.value === 'patient'; patientRows.forEach(r => { r.hidden = !pat; }); renumber(); });
form.addEventListener('submit', async e => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.className = 'msg err'; msg.textContent = 'Enter a full email address, like name@example.com.'; form.email.focus(); return; }
  msg.className = 'msg'; msg.textContent = 'Adding you…';
  const role = form.role.value, pick = name => (form.querySelector(`input[name=${name}]:checked`) || {}).value || '';
  const data = {email, role, injury: role === 'patient' ? form.injury.value : '', sport: role === 'patient' ? form.sport.value : '', alert: pick('alert'), channel: pick('channel'), note: form.note.value.trim(), company: form.company.value, source: SOURCE};
  try {
    const res = await fetch('/api/waitlist', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) throw new Error(j.error || 'Something went wrong. Try again in a minute.');
    form.hidden = true; document.getElementById('done').hidden = false;
        dlg.querySelector('.done .go').focus();
  } catch (err) { msg.className = 'msg err'; msg.textContent = err.message === 'Failed to fetch' ? "Couldn't reach the server. Check your connection and try again." : err.message; }
});
fetch('/api/waitlist/count').then(r => r.json()).then(j => { if (j.count >= 25) document.getElementById('count').textContent = `${j.count.toLocaleString()} already on the list.`; }).catch(() => {});
