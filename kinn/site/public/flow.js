/* RECO home: one pinned film, drawn to one canvas. Scroll position picks the moment.
   Everything is placed on a 1536x1024 stage, the size of the hero photograph, so every shot shares one framing.
   The films and both joins come from one Blender scene (../blender/v7/build_reco_v7.py), so the device never changes. */
(function flow() {
  const STAGE_W = 1536, STAGE_H = 1024, FILM_H = 864, FILM_TOP = 80;     // 16:9 film frames sit inside the 3:2 stage
  const RING = [1200, 345];                                              // the coin's ring in the photograph
  const TAPE_X = 1110;                                                   // what a narrow screen frames once the tape is on the knee
  const COIN_END = [991, 197];                                           // the coin at the end of the bend film
  const NARROW = () => innerWidth <= 760;
  /* on a narrow screen the flat tape is wider than the screen, so the framing starts wide and closes in as the tape bends */
  const BEND_FLAT_Z = .46, BEND_FLAT_PX = 654, BEND_Z = .72, BEND_PX = 853, BEND_PY = 420;
  const TAPE_BOX = [609, 1093, 176, 727];                             // the tape at the end of the bend film, on the stage
  const BEND = 130, GAUGE_MAX = 135;
  const BG = '#0d1111';
  const sec = document.getElementById('top'), cv = document.getElementById('flowCv'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const veil = sec.querySelector('.veil'), cue = document.getElementById('cue'), deg = document.getElementById('fDeg'), bar = document.getElementById('fBar'), degWrap = document.getElementById('fDegWrap');
  const device = document.getElementById('device'), scrToday = document.getElementById('scrToday'), scrPlan = document.getElementById('scrPlan');
  const smooth = x => { x = cl(x); return x * x * (3 - 2 * x); };

  /* the film strips */
  /* bump this whenever frames are replaced under the same names, so no browser keeps showing the old ones */
  const V = 'v=6';
  const SEQS = {hero: ['/flow/intro/h_', 120], film: ['/film7/v_', 90], wrap: ['/flow/wrap/a_', 70], unwrap: ['/flow/unwrap/c_', 40], flex: ['/flow/flex/k_', 96]};
  const frames = {}, all = [], seqStart = {}; let count = 0;
  for (const [k, [base, n]] of Object.entries(SEQS)) { frames[k] = []; seqStart[k] = count; count += n; for (let i = 0; i < n; i++) { const o = {src: base + String(i + 1).padStart(3, '0') + '.webp?' + V, k, i}; frames[k].push(o); all.push(o); } }

  /* the shots. vh = how much scroll each one takes */
  const shots = [['hero', 230], ['dive', 60], ['film', 190], ['wrap', 170], ['settle', 26], ['reveal', 130], ['hold', 70], ['fade', 80], ['unsettle', 22], ['unwrap', 70], ['bend', 240], ['signal', 110], ['phone', 230], ['close', 60], ['join', 70]];
  const from = {}; let SPAN = 0; for (const [n, vh] of shots) { from[n] = [SPAN, vh]; SPAN += vh; }
  sec.style.height = SPAN + 100 + 'vh';
  const mark = s => { const [n, t] = s.split(' '); return from[n][0] + parseFloat(t) * from[n][1]; };   // 'shot t'
  const words = [...document.querySelectorAll('#words [data-a]')].map(el => ({el, a: mark(el.dataset.a), b: mark(el.dataset.b)}));

  /* loading: nearest to where the reader is goes first. Phones and data-saver take every second frame */
  const conn = navigator.connection || {}, stride = innerWidth < 760 || conn.saveData ? 2 : 1;
  let pending = all.filter(o => o.i % stride === 0 || o.i === SEQS[o.k][1] - 1), active = 0, cur = 0, dirty = true;
  const pump = () => {
    while (active < 8 && pending.length) {
      let best = 0, bd = 1e9; pending.forEach((o, j) => { const d = Math.abs(seqStart[o.k] + o.i - cur); if (d < bd) { bd = d; best = j; } });
      const o = pending.splice(best, 1)[0], im = new Image(); active++;
      const done = () => { active--; pump(); dirty = true; };
      im.onload = () => { o.img = im; done(); }; im.onerror = done; im.src = o.src;
    }
  };
  const still = src => { const im = new Image(); im.onload = () => { dirty = true; }; im.src = src; return im; };
  const photo = still('/flow/hero.webp?' + V), cutout = still('/flow/tape.webp?' + V);
  const ready = im => im && im.complete && im.naturalWidth;
  const nearest = (k, i) => { const f = frames[k]; for (let d = 0; d < f.length; d++) { if (f[i - d] && f[i - d].img) return f[i - d].img; if (f[i + d] && f[i + d].img) return f[i + d].img; } return null; };

  /* the coin follows the cursor: the first frame of the intro, rendered turned to many angles. Only for a real pointer */
  const COLS = 9, ROWS = 5, canHover = matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce;
  const turned = []; let tx = 0, ty = 0, mx = 0, my = 0;
  if (canHover) {
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) turned.push(still(`/flow/coin/c_${j}_${i}.webp?${V}`));
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, {passive: true});
  }

  /* the stage on this screen */
  let W = 0, H = 0, S = 1, OY = 0, DPR = 1, shiftX = 0, shiftY = 0;
  const fit = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = cv.width = off.width = Math.round(cv.clientWidth * DPR); H = cv.height = off.height = Math.round(cv.clientHeight * DPR); S = Math.max(W / STAGE_W, H / STAGE_H); OY = (H - STAGE_H * S) / 2; dirty = true; };
  const originX = cx => Math.min(0, Math.max(W - STAGE_W * S, W / 2 - cx * S));
  function place(c, im, ox, y, h, zoom = 1, px = STAGE_W / 2, py = STAGE_H / 2) {
    const x0 = ox + (px - px * zoom) * S + shiftX, y0 = OY + (py + (y - py) * zoom) * S + shiftY;   // zoom about a point on the stage
    c.drawImage(im, x0, y0, STAGE_W * zoom * S, h * zoom * S);
  }
  const film = (k, i, ox, a = 1, zoom = 1, px, py) => { const im = nearest(k, i); if (!im) return; ctx.globalAlpha = a; place(ctx, im, ox, FILM_TOP, FILM_H, zoom, px, py); ctx.globalAlpha = 1; };
  const full = (k, i, ox, a = 1, zoom = 1, px, py) => { const im = nearest(k, i); if (!im) return; ctx.globalAlpha = a; place(ctx, im, ox, 0, STAGE_H, zoom, px, py); ctx.globalAlpha = 1; };
  /* the 16:9 film frames are shorter than the stage: fade their top and bottom into the page so they never show an edge */
  function hem(a = 1) {
    if (a <= 0) return;
    const yT = OY + FILM_TOP * S, yB = OY + (FILM_TOP + FILM_H) * S, h = 150 * S;
    ctx.globalAlpha = a;
    let g = ctx.createLinearGradient(0, yB - h, 0, yB); g.addColorStop(0, 'rgba(13,17,17,0)'); g.addColorStop(1, BG); ctx.fillStyle = g; ctx.fillRect(0, yB - h, W, h);
    ctx.fillStyle = BG; ctx.fillRect(0, yB - 1, W, H - yB + 1);
    g = ctx.createLinearGradient(0, yT, 0, yT + h); g.addColorStop(0, BG); g.addColorStop(1, 'rgba(13,17,17,0)'); ctx.fillStyle = g; ctx.fillRect(0, yT, W, h);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, yT + 1);
    ctx.globalAlpha = 1;
  }
  /* the turned coin, blended between the nearest angles */
  function coinTurn(ox, a) {
    const fx = cl(mx + .5) * (COLS - 1), fy = cl(my + .5) * (ROWS - 1), i0 = Math.floor(fx), j0 = Math.floor(fy), i1 = Math.min(COLS - 1, i0 + 1), j1 = Math.min(ROWS - 1, j0 + 1);
    const at = (i, j) => turned[j * COLS + i], base = at(i0, j0); if (!ready(base)) return false;
    const put = (im, al) => { if (!ready(im) || al <= 0) return; ctx.globalAlpha = a * al; place(ctx, im, ox, FILM_TOP, FILM_H); };
    const crisp = x => smooth((x - .3) / .4);   // mostly one sharp frame, blending only near the change
    put(base, 1); put(at(i1, j0), crisp(fx - i0)); put(at(i0, j1), crisp(fy - j0)); ctx.globalAlpha = 1; return true;
  }

  /* light spreads out of the coin's ring and finds the leg */
  function lit(t, ox) {
    if (!ready(photo)) return;
    const x = ox + RING[0] * S, y = OY + RING[1] * S, reach = (60 + t * 2100) * S, soft = (140 + 560 * t) * S;
    octx.globalCompositeOperation = 'source-over'; octx.clearRect(0, 0, W, H); place(octx, photo, ox, 0, STAGE_H);
    octx.globalCompositeOperation = 'destination-in';
    const g = octx.createRadialGradient(x, y, Math.max(0, reach - soft), x, y, reach);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.25, 'rgba(0,0,0,.84)'); g.addColorStop(.5, 'rgba(0,0,0,.5)'); g.addColorStop(.75, 'rgba(0,0,0,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    octx.fillStyle = g; octx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .35 + .65 * smooth(t * 1.6); ctx.drawImage(off, 0, 0); ctx.globalAlpha = 1;
    if (ready(cutout)) place(ctx, cutout, ox, 0, STAGE_H);
  }
  function glow(a, ox, at = RING, size = 280) {
    if (a <= 0) return;
    const x = ox + at[0] * S, y = OY + at[1] * S, r = size * S, g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(120,240,210,${(.2 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(120,240,210,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over';
  }

  /* the reading off the knee, sent to the phone: one fine line and a point of light */
  /* beside the phone the tape grows into all the room left of it, whatever the window's shape, and is never hidden by it */
  function tapeBeside(k, ox) {
    const [bx0, bx1, by0, by1] = TAPE_BOX, bw = bx1 - bx0, bh = by1 - by0, bcx = (bx0 + bx1) / 2, bcy = (by0 + by1) / 2;
    const room = (device.getBoundingClientRect().left - cv.getBoundingClientRect().left) * DPR, pad = 28 * DPR;
    const fitZ = Math.min(1.5, (room - pad * 2) / (bw * S), (H * .76) / (bh * S));
    const z = 1 + (fitZ - 1) * k, cx = ox + bcx * S + (room / 2 - (ox + bcx * S)) * k, cy = OY + bcy * S + (H * .45 - (OY + bcy * S)) * k;
    const x0 = cx - bcx * z * S, y0 = cy - (bcy - FILM_TOP) * z * S;
    return {x0, y0, w: STAGE_W * z * S, h: FILM_H * z * S, coin: [x0 + COIN_END[0] * z * S, y0 + (COIN_END[1] - FILM_TOP) * z * S]};
  }
  function drawBeside(r) { const im = nearest('flex', 95); if (im) ctx.drawImage(im, r.x0, r.y0, r.w, r.h); }
  const coinNarrow = [BEND_PX + (COIN_END[0] - BEND_PX) * BEND_Z, BEND_PY + (COIN_END[1] - BEND_PY) * BEND_Z];
  function curve(s, x0, y0, x1, y1) {
    const m = 1 - s, cx1 = x0 + (x1 - x0) * .45, cy1 = y0 + 40 * S, cx2 = x0 + (x1 - x0) * .55, cy2 = y1;
    return [m*m*m*x0 + 3*m*m*s*cx1 + 3*m*s*s*cx2 + s*s*s*x1, m*m*m*y0 + 3*m*m*s*cy1 + 3*m*s*s*cy2 + s*s*s*y1];
  }
  function link(head, a, ox, start) {
    if (a <= 0 || head <= 0) return;
    const r = device.getBoundingClientRect(), c = cv.getBoundingClientRect(), n = NARROW();
    const x0 = start[0], y0 = start[1], x1 = (r.left - c.left + (n ? r.width * .5 : 0)) * DPR, y1 = (r.top - c.top + (n ? 0 : r.height * .3)) * DPR;
    ctx.save(); ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const [x, y] = curve(head * i / 60, x0, y0, x1, y1); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = `rgba(169,215,198,${(.6 * a).toFixed(3)})`; ctx.lineWidth = Math.max(1, 1.1 * S); ctx.stroke();
    const [hx, hy] = curve(head, x0, y0, x1, y1), rr = 11 * S, g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rr);
    g.addColorStop(0, `rgba(205,245,232,${a.toFixed(3)})`); g.addColorStop(.25, `rgba(169,215,198,${(.55 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(169,215,198,0)');
    ctx.fillStyle = g; ctx.fillRect(hx - rr, hy - rr, rr * 2, rr * 2);
    ctx.restore();
  }
  const bendView = t => { const k = smooth((t - .25) / .45); return {z: BEND_FLAT_Z + (BEND_Z - BEND_FLAT_Z) * k, px: BEND_FLAT_PX + (BEND_PX - BEND_FLAT_PX) * k}; };
  function phone(rise, a, plan) {
    const on = a > .001;
    device.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
    device.style.opacity = a.toFixed(3); device.style.setProperty('--rise', (rise * innerHeight).toFixed(1) + 'px'); scrToday.style.opacity = cl(1 - plan * 2).toFixed(3); scrPlan.style.opacity = cl(plan * 2 - 1).toFixed(3);
  }

  function draw(pos) {
    let name = shots[shots.length - 1][0]; for (const [n, vh] of shots) { if (pos < from[n][0] + vh) { name = n; break; } }
    const t = cl((pos - from[name][0]) / from[name][1]), n = NARROW();
    /* a narrow screen follows the tape as it moves */
    let cx = STAGE_W / 2;
    if (name === 'wrap') cx += (TAPE_X - STAGE_W / 2) * smooth(t);
    else if (pos >= from.settle[0]) cx = TAPE_X;
    if (name === 'unwrap') cx = TAPE_X + (BEND_FLAT_PX - TAPE_X) * smooth(t);
    if (pos >= from.bend[0]) cx = name === 'bend' ? bendView(t).px : BEND_PX;
    const ox = originX(cx);
    shiftX = shiftY = 0;
    ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    let phoneRise = 1, phoneA = 0, plan = 0;
    switch (name) {
      case 'hero': {
        /* a little depth under the cursor, and the coin itself turning at the very start */
        if (canHover) { const k = 1 - t * .6; shiftX = -mx * 14 * k * DPR; shiftY = -my * 10 * k * DPR; }
        if (canHover && t < .05 && coinTurn(ox, 1)) { if (t > 0) film('hero', Math.round(t * 119), ox, smooth(t / .05)); }
        else film('hero', Math.round(t * 119), ox);
        shiftX = shiftY = 0; hem(); cur = seqStart.hero + t * 119; break;
      }
      case 'dive': {
        /* into the tape: the strip grows past the frame while the fibers come up inside it */
        const z = Math.exp(Math.log(8) * smooth(t));
        film('hero', 119, ox, 1 - smooth((t - .4) / .45), z, 610, 560);
        hem(1 - smooth(t / .3));
        film('film', 0, ox, smooth((t - .4) / .45), 1.3 * (1 + .9 * (1 - smooth(t))));
        hem(smooth((t - .4) / .45));
        cur = seqStart.film; break;
      }
      case 'film': film('film', Math.round(t * 89), ox, 1, 1 + .3 * (1 - smooth(t / .3))); hem(); cur = seqStart.film + t * 89; break;
      case 'wrap': full('wrap', Math.round(t * 69), ox); cur = seqStart.wrap + t * 69; break;
      case 'settle':
        full('wrap', 69, ox, 1 - smooth(t)); if (ready(cutout)) { ctx.globalAlpha = smooth(t); place(ctx, cutout, ox, 0, STAGE_H); ctx.globalAlpha = 1; } break;
      case 'reveal': lit(smooth(t), ox); glow(Math.sin(Math.min(1, t * 1.4) * Math.PI), ox); break;
      case 'hold': if (ready(photo)) place(ctx, photo, ox, 0, STAGE_H); break;
      case 'fade': lit(1 - smooth(t), ox); break;
      case 'unsettle': if (ready(cutout)) { ctx.globalAlpha = 1 - smooth(t); place(ctx, cutout, ox, 0, STAGE_H); ctx.globalAlpha = 1; } full('unwrap', 0, ox, smooth(t)); cur = seqStart.unwrap; break;
      case 'unwrap': { const z = n ? 1 + (BEND_FLAT_Z - 1) * smooth(t) : 1; full('unwrap', Math.round(t * 39), ox, 1, z, BEND_FLAT_PX, BEND_PY); cur = seqStart.unwrap + t * 39; break; }
      case 'bend': { const v = bendView(t); film('flex', Math.round(t * 95), ox, 1, n ? v.z : 1, v.px, BEND_PY); cur = seqStart.flex + t * 95; break; }
      case 'signal': {
        phoneRise = .9 * (1 - smooth((t - .1) / .75)); phoneA = smooth((t - .08) / .3);
        if (n) { film('flex', 95, ox, 1, BEND_Z, BEND_PX, BEND_PY); link(smooth((t - .3) / .55), 1, ox, [ox + coinNarrow[0] * S, OY + coinNarrow[1] * S]); }
        else { const r = tapeBeside(smooth(t / .8), ox); drawBeside(r); link(smooth((t - .3) / .55), 1, ox, r.coin); }
        cur = seqStart.flex + 95; break;
      }
      case 'phone': {
        phoneRise = 0; phoneA = 1; plan = smooth((t - .41) / .04);
        if (n) { film('flex', 95, ox, 1 - smooth(t / .1), BEND_Z, BEND_PX, BEND_PY); link(1, 1 - smooth(t / .08), ox, [ox + coinNarrow[0] * S, OY + coinNarrow[1] * S]); }
        else { const r = tapeBeside(1, ox); drawBeside(r); link(1, 1 - smooth((t - .25) / .2), ox, r.coin); }
        break;
      }
      case 'close': if (!n) { ctx.globalAlpha = 1 - smooth(t); drawBeside(tapeBeside(1, ox)); ctx.globalAlpha = 1; } phoneRise = -.02 * t; phoneA = 1 - smooth(t); plan = 1; break;
      case 'join': break;
    }
    phone(phoneRise, phoneA, plan);
    words.forEach(w => w.el.classList.toggle('on', pos >= w.a && pos < w.b));
    const reading = pos >= mark('unwrap .85') && pos < mark('signal .2');
    degWrap.classList.toggle('on', reading);
    if (reading) { const d = name === 'bend' ? BEND * smooth(Math.round(t * 95) / 95) : name === 'unwrap' ? 0 : BEND; deg.textContent = Math.round(d) + '°'; bar.style.width = (d / GAUGE_MAX * 100) + '%'; }
    veil.style.opacity = n && pos >= mark('reveal .5') && pos < mark('fade .3') ? 1 : 0;
    cue.style.opacity = pos > 25 ? 0 : 1;
  }

  let target = 0, p = 0, shown = -1;
  const read = () => { const b = sec.getBoundingClientRect(); target = cl(-b.top / Math.max(1, sec.offsetHeight - innerHeight)); };
  addEventListener('scroll', read, {passive: true}); addEventListener('resize', () => { fit(); read(); });
  fit(); read(); p = target; pump();
  (function tick() {
    requestAnimationFrame(tick);
    p += (target - p) * (reduce ? 1 : 0.12); if (Math.abs(target - p) < 0.00002) p = target;
    if (canHover) { const dx = tx - mx, dy = ty - my; if (Math.abs(dx) + Math.abs(dy) > .0005 && p * SPAN < from.dive[0]) { mx += dx * .07; my += dy * .07; dirty = true; } }
    if (p === shown && !dirty) return;
    shown = p; dirty = false; draw(p * SPAN); pump();
  })();
})();
