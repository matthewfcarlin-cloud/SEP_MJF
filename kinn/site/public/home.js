document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));


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
