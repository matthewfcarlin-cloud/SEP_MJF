document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));


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
