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
  const SCROLL_EASE_MS = 120, CURSOR_EASE_MS = 150, COIN_CENTER_MS = 180, MAX_STEP_MS = 64;
  /* a trackpad keeps sending events after a flick. A pause or a clear surge means a new gesture */
  const WHEEL_GAP_MS = 140, WHEEL_SURGE = 2, WHEEL_SURGE_MIN = 20, WHEEL_LINE_PX = 16, RECENT_INPUT_MS = 250, MAX_TAIL_MS = 500;
  /* the transitions speed up with the reader's scrolling. Rate 1 is the pace set in AUTO, and they never go slower: a slow transition would just hold the reader back */
  const SPEED_FOR_RATE_1 = 1400, RATE_MIN = 1, RATE_MAX = 3, RATE_EASE_MS = 160, SPEED_EASE_MS = 90, SPEED_FADE_MS = 280, INPUT_ACTIVE_MS = 70;
  const WAIT_FOR_FRAMES_MS = 1500, MIN_AUTO_MS = 300, AUTO_ENTER_VH = .5;
  const BG = '#0d1212';
  const sec = document.getElementById('top'), cv = document.getElementById('flowCv'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const veil = sec.querySelector('.veil'), cue = document.getElementById('cue'), deg = document.getElementById('fDeg'), bar = document.getElementById('fBar'), degWrap = document.getElementById('fDegWrap');
  const device = document.getElementById('device'), scrToday = document.getElementById('scrToday'), scrPlan = document.getElementById('scrPlan');
  const smooth = x => { x = cl(x); return x * x * (3 - 2 * x); };

  /* the film strips */
  /* bump this whenever frames are replaced under the same names, so no browser keeps showing the old ones */
  const V = 'v=8';
  const SEQS = {hero: ['/flow/intro/h_', 120], film: ['/film7/v_', 90], wrap: ['/flow/wrap/a_', 70], settle: ['/flow/settle/s_', 30], unwrap: ['/flow/unwrap/c_', 40], flex: ['/flow/flex/k_', 96]};
  const frames = {}, all = [], seqStart = {}; let count = 0;
  for (const [k, [base, n]] of Object.entries(SEQS)) { frames[k] = []; seqStart[k] = count; count += n; for (let i = 0; i < n; i++) { const o = {src: base + String(i + 1).padStart(3, '0') + '.webp?' + V, k, i}; frames[k].push(o); all.push(o); } }

  /* the shots. vh = how much scroll each one takes */
  const shots = [['hero', 230], ['dive', 60], ['film', 190], ['wrap', 170], ['settle', 90], ['reveal', 130], ['hold', 70], ['fade', 80], ['unsettle', 40], ['unwrap', 70], ['bend', 240], ['signal', 110], ['phone', 230], ['close', 60], ['join', 70]];
  const from = {}; let SPAN = 0; for (const [n, vh] of shots) { from[n] = [SPAN, vh]; SPAN += vh; }
  sec.style.height = SPAN + 100 + 'vh';
  const mark = s => { const [n, t] = s.split(' '); return from[n][0] + parseFloat(t) * from[n][1]; };   // 'shot t'
  /* most of the film follows the scroll. These transitions between pages play by themselves once the reader scrolls into them, and scrolling is locked until they land */
  const AUTO = [['hero .02', 'hero .58', 2400], ['hero .62', 'hero 1', 1700], ['dive 0', 'film .12', 1800], ['wrap 0', 'reveal 1', 5600], ['unsettle 0', 'unwrap 1', 2200], ['signal 0', 'signal .95', 2400]].map(([a, b, ms]) => ({a: mark(a), b: mark(b), ms}));
  const FILMED = {hero: 'hero', film: 'film', wrap: 'wrap', settle: 'settle', unsettle: 'settle', unwrap: 'unwrap', bend: 'flex'};
  let play = null, locked = false, landedAt = -Infinity, landedTime = 0, lastPos = 0, lastInput = -Infinity, scrollSpeed = 0;
  const words = [...document.querySelectorAll('#words [data-a]')].map(el => ({el, a: mark(el.dataset.a), b: mark(el.dataset.b)}));

  /* loading. Every shot gets a rough pass first, every 8th frame, so whatever the reader scrolls to is already there.
     Then the frames nearest the reader fill in. Phones and data-saver skip every second frame */
  const BEHIND_COST = 3, ROUGH = 8, ROUGH_PULL = 100, RETRIES = 2, RETRY_MS = 1000, SLOTS = 6, BLEND_GAP = 2, BLENDED = new Set(['film', 'wrap', 'settle', 'unwrap', 'flex']);
  const conn = navigator.connection || {}, stride = innerWidth < 760 || conn.saveData ? 2 : 1;
  const isRough = o => o.i % ROUGH === 0 || o.i === SEQS[o.k][1] - 1;
  let pending = all.filter(o => o.i % stride === 0 || o.i === SEQS[o.k][1] - 1), active = 0, cur = 0, dirty = true;
  function load(o) {
    const im = new Image(); active++;
    const done = () => { active--; dirty = true; pump(); };
    im.onload = () => im.decode().catch(() => {}).then(() => { o.img = im; done(); });
    im.onerror = () => {
      o.tries = (o.tries || 0) + 1;
      if (o.tries <= RETRIES) setTimeout(() => { pending = [...pending, o]; pump(); }, RETRY_MS * o.tries);
      done();
    };
    im.src = o.src;
  }
  function pump() {
    while (active < SLOTS && pending.length) {
      let best = 0, bd = Infinity;
      pending.forEach((o, j) => { const gap = seqStart[o.k] + o.i - cur, d = (gap < 0 ? -gap * BEHIND_COST : gap) / (isRough(o) ? ROUGH_PULL : 1); if (d < bd) { bd = d; best = j; } });
      load(pending.splice(best, 1)[0]);
    }
  }
  const still = src => { const im = new Image(); im.onload = () => { dirty = true; }; im.src = src; return im; };
  const photo = still('/flow/hero.webp?' + V), cutout = still('/flow/tape.webp?' + V);
  const ready = im => im && im.complete && im.naturalWidth;
  /* the loaded frames either side of a moment. Frames dissolve into each other so the motion is continuous.
     Under the scroll the coin stays on one sharp frame: it moves too far per frame, and a held blend would show the logo doubled */
  function around(k, x) {
    const f = frames[k], last = f.length - 1, at = cl(x, 0, last); let a = Math.floor(at), b = Math.ceil(at);
    while (a > 0 && !f[a].img) a--;
    while (b < last && !f[b].img) b++;
    const lo = f[a].img, hi = f[b].img;
    if (!lo || !hi || a === b) return {lo: lo || hi, hi: null, mix: 0};
    const mix = (at - a) / (b - a);
    const blends = play ? b - a <= ROUGH : BLENDED.has(k) && b - a <= BLEND_GAP;
    return blends ? {lo, hi, mix} : {lo: mix < .5 ? lo : hi, hi: null, mix: 0};
  }

  /* the coin follows the cursor: the first frame of the intro, rendered turned to many angles. Only for a real pointer */
  const COLS = 15, ROWS = 7, canHover = matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce;
  const COIN_SLOTS = 4, COIN_REST_T = .02, COIN_CENTERED = .03, IDLE_X = .07, IDLE_Y = .06, IDLE_X_MS = 1700, IDLE_Y_MS = 2300;
  const turned = new Array(COLS * ROWS); let tx = 0, ty = 0, mx = 0, my = 0, coarseLeft = 0, fineLeft = 0;
  const isCoarse = (i, j) => i % 2 === 1 && j % 2 === 1;   // every 6 degrees, through the centre: enough to respond while the rest load
  function loadCoin() {
    if (!canHover) return;
    coinStarted = true;
    fetch(`/flow/coin/poses.json?${V}`).then(r => (r.ok ? r.json() : null)).then(j => { if (!j) return; coinPoses = j.poses; coinShape = j.coin; dirty = true; }).catch(() => {});
    const grid = []; for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) grid.push({i, j});
    const queue = [...grid.filter(g => isCoarse(g.i, g.j)), ...grid.filter(g => !isCoarse(g.i, g.j))];
    coarseLeft = queue.filter(g => isCoarse(g.i, g.j)).length; fineLeft = queue.length;
    const next = () => {
      const g = queue.shift(); if (!g) return;
      const im = new Image();
      const done = () => { if (isCoarse(g.i, g.j)) coarseLeft--; fineLeft--; dirty = true; next(); };
      im.onload = () => im.decode().catch(() => {}).then(() => { turned[g.j * COLS + g.i] = im; done(); });
      im.onerror = () => { fineLeft = Infinity; done(); };   // a missing angle: stay on the coarse set
      im.src = `/flow/coin/c_${g.j}_${g.i}.webp?${V}`;
    };
    for (let s = 0; s < COIN_SLOTS; s++) next();
  }
  let coinStarted = false;
  const coinReady = () => coinStarted && coarseLeft === 0;
  if (canHover) addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, {passive: true});

  /* the stage on this screen */
  let W = 0, H = 0, S = 1, OY = 0, DPR = 1, shiftX = 0, shiftY = 0;
  const fit = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = cv.width = off.width = Math.round(cv.clientWidth * DPR); H = cv.height = off.height = Math.round(cv.clientHeight * DPR); S = Math.max(W / STAGE_W, H / STAGE_H); OY = (H - STAGE_H * S) / 2; dirty = true; };
  const originX = cx => Math.min(0, Math.max(W - STAGE_W * S, W / 2 - cx * S));
  function place(c, im, ox, y, h, zoom = 1, px = STAGE_W / 2, py = STAGE_H / 2) {
    const x0 = ox + (px - px * zoom) * S + shiftX, y0 = OY + (py + (y - py) * zoom) * S + shiftY;   // zoom about a point on the stage
    c.drawImage(im, x0, y0, STAGE_W * zoom * S, h * zoom * S);
  }
  function show(k, x, ox, y, h, a, zoom, px, py) {
    const {lo, hi, mix} = around(k, x); if (!lo) return;
    ctx.globalAlpha = a; place(ctx, lo, ox, y, h, zoom, px, py);
    if (hi && mix > 0) { ctx.globalAlpha = a * mix; place(ctx, hi, ox, y, h, zoom, px, py); }
    ctx.globalAlpha = 1;
  }
  const film = (k, x, ox, a = 1, zoom = 1, px, py) => show(k, x, ox, FILM_TOP, FILM_H, a, zoom, px, py);
  const full = (k, x, ox, a = 1, zoom = 1, px, py) => show(k, x, ox, 0, STAGE_H, a, zoom, px, py);
  /* the 16:9 film frames are shorter than the stage: fade their top and bottom into the page so they never show an edge */
  function hem(a = 1) {
    if (a <= 0) return;
    const yT = OY + FILM_TOP * S, yB = OY + (FILM_TOP + FILM_H) * S, h = 150 * S;
    ctx.globalAlpha = a;
    let g = ctx.createLinearGradient(0, yB - h, 0, yB); g.addColorStop(0, 'rgba(13,18,18,0)'); g.addColorStop(1, BG); ctx.fillStyle = g; ctx.fillRect(0, yB - h, W, h);
    ctx.fillStyle = BG; ctx.fillRect(0, yB - 1, W, H - yB + 1);
    g = ctx.createLinearGradient(0, yT, 0, yT + h); g.addColorStop(0, BG); g.addColorStop(1, 'rgba(13,18,18,0)'); ctx.fillStyle = g; ctx.fillRect(0, yT, W, h);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, yT + 1);
    ctx.globalAlpha = 1;
  }
  /* the turned coin, blended between the four nearest angles. The tape underneath blends where it is.
     poses.json says where the coin sits in each frame, so over the coin each frame is nudged onto the exact pose between them first: the logo stays sharp instead of doubling.
     That layer fades out softly around the coin, because a hard edge would cut through the tape */
  const COIN_MASK_FULL = 1.02, COIN_MASK_END = 1.3, COIN_MASK_MIDDLE = .5, COIN_MASK_COVER = 40;   // in coin radii, and how far down from its face the mask is centred
  let coinPoses = null, coinShape = null;
  const matMul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  function matInv([a, b, c, d, e, f]) { const k = 1 / (a * d - b * c); return [d * k, -b * k, -c * k, a * k, (c * f - d * e) * k, (b * e - a * f) * k]; }
  function coinAxis(m, n, offset, step) {
    const max = Math.floor((n - 1 - offset * 2) / step), x = cl((cl(m + .5) * (n - 1) - offset) / step, 0, max), i = Math.min(Math.floor(x), max - 1);
    return {a: offset + i * step, b: offset + (i + 1) * step, f: x - i};
  }
  function coinTurn(ox) {
    if (!coinReady()) return false;
    const fine = fineLeft === 0, X = coinAxis(mx, COLS, fine ? 0 : 1, fine ? 1 : 2), Y = coinAxis(my, ROWS, fine ? 0 : 1, fine ? 1 : 2), u = X.f, v = Y.f, last = u * v;
    const cells = [[X.a, Y.a, 1, (1 - u) * (1 - v)], [X.b, Y.a, u, u * (1 - v)], [X.a, Y.b, last >= 1 ? 0 : v * (1 - u) / (1 - last), (1 - u) * v], [X.b, Y.b, last, u * v]];
    const screen = [S, 0, 0, S, ox + shiftX, OY + FILM_TOP * S + shiftY];
    const draw = (i, j, alpha, M) => { const im = turned[j * COLS + i]; if (!im || alpha <= 0) return; ctx.globalAlpha = alpha; ctx.setTransform(...M); ctx.drawImage(im, 0, 0, STAGE_W, FILM_H); };
    if (!coinPoses) { for (const [i, j, alpha] of cells) draw(i, j, alpha, screen); }
    else {
      /* all on this canvas, which the browser accelerates: the lined-up coin first, its edge faded out, then the tape slid in behind it */
      const between = [0, 1, 2, 3, 4, 5].map(n => cells.reduce((sum, [i, j, , weight]) => sum + coinPoses[j * COLS + i][n] * weight, 0)), onScreen = matMul(screen, between);
      const {top, base, a, b} = coinShape, mid = t => top[t] + (base[t] - top[t]) * COIN_MASK_MIDDLE;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      for (const [i, j, alpha] of cells) draw(i, j, alpha, matMul(onScreen, matInv(coinPoses[j * COLS + i])));
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-in';
      ctx.setTransform(...matMul(onScreen, [a[0], a[1], b[0], b[1], mid(0), mid(1)]));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, COIN_MASK_END);
      g.addColorStop(COIN_MASK_FULL / COIN_MASK_END, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(-COIN_MASK_COVER, -COIN_MASK_COVER, COIN_MASK_COVER * 2, COIN_MASK_COVER * 2);
      ctx.globalCompositeOperation = 'destination-over';
      let left = 1;
      for (const [i, j, , weight] of cells) { if (weight <= 0) continue; draw(i, j, Math.min(1, weight / left), screen); left -= weight; if (left <= 1e-4) break; }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; return true;
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
  function drawBeside(r) { const {lo} = around('flex', 95); if (lo) ctx.drawImage(lo, r.x0, r.y0, r.w, r.h); }
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
        /* at rest the coin follows the cursor, with a little depth. Once it leaves, the film takes over from the same pose */
        if (canHover) { const k = 1 - t * .6; shiftX = -mx * 14 * k * DPR; shiftY = -my * 10 * k * DPR; }
        const leaving = play && play.t > 0;
        if (t > COIN_REST_T || leaving || !coinTurn(ox)) film('hero', t * 119, ox);
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
      case 'film': film('film', t * 89, ox, 1, 1 + .3 * (1 - smooth(t / .3))); hem(); cur = seqStart.film + t * 89; break;
      case 'wrap': full('wrap', t * 69, ox); cur = seqStart.wrap + t * 69; break;
      case 'settle': full('settle', t * 29, ox); cur = seqStart.settle + t * 29; break;
      case 'reveal': lit(smooth(t), ox); glow(Math.sin(Math.min(1, t * 1.4) * Math.PI), ox); break;
      case 'hold': if (ready(photo)) place(ctx, photo, ox, 0, STAGE_H); break;
      case 'fade': lit(1 - smooth(t), ox); break;
      case 'unsettle': full('settle', (1 - t) * 29, ox); cur = seqStart.unwrap; break;
      case 'unwrap': { const z = n ? 1 + (BEND_FLAT_Z - 1) * smooth(t) : 1; full('unwrap', t * 39, ox, 1, z, BEND_FLAT_PX, BEND_PY); cur = seqStart.unwrap + t * 39; break; }
      case 'bend': { const v = bendView(t); film('flex', t * 95, ox, 1, n ? v.z : 1, v.px, BEND_PY); cur = seqStart.flex + t * 95; break; }
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
    if (reading) { const d = name === 'bend' ? BEND * smooth(t) : name === 'unwrap' ? 0 : BEND; deg.textContent = Math.round(d) + '°'; bar.style.width = (d / GAUGE_MAX * 100) + '%'; }
    veil.style.opacity = n && pos >= mark('reveal .5') && pos < mark('fade .3') ? 1 : 0;
    cue.style.opacity = pos > 25 ? 0 : 1;
  }

  let target = 0, p = 0, shown = -1;
  const measure = () => cl(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - innerHeight));
  function read() {
    if (play || locked) return;
    if (Math.abs(scrollY - landedAt) <= 1) return;   // the browser rounds the landing: stay exactly on it
    landedAt = -Infinity; target = measure();
    if (!reduce) enterAuto(target * SPAN);
    lastPos = target * SPAN;
  }
  addEventListener('scroll', read, {passive: true}); addEventListener('resize', () => { fit(); read(); });
  fit(); target = p = measure(); lastPos = p * SPAN; pump(); loadCoin();

  /* the transitions that play by themselves */
  const restP = () => COIN_REST_T * from.hero[1] / SPAN;
  function framesLoaded(a, b) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return shots.every(([name]) => {
      const k = FILMED[name]; if (!k) return true;
      const [start, vh] = from[name], t0 = (lo - start) / vh, t1 = (hi - start) / vh; if (t1 <= 0 || t0 >= 1) return true;
      const f = frames[k], last = f.length - 1;
      for (let i = Math.floor(cl(t0) * last); i <= Math.ceil(cl(t1) * last); i++) { if ((i % stride === 0 || i === last) && !f[i].img) return false; }
      return true;
    });
  }
  /* overflow, not preventDefault: browsers stop letting a page cancel a gesture once it has started scrolling */
  const lockScroll = on => { locked = on; document.documentElement.style.overflow = on ? 'hidden' : ''; };
  const wantedRate = () => cl(scrollSpeed / SPEED_FOR_RATE_1, RATE_MIN, RATE_MAX);
  function enterAuto(pos) {
    const dir = pos >= lastPos ? 1 : -1, recent = performance.now() - lastInput < RECENT_INPUT_MS;
    const inside = z => pos > z.a + AUTO_ENTER_VH && pos < z.b - AUTO_ENTER_VH;
    const jumped = z => recent && (dir > 0 ? lastPos <= z.a + AUTO_ENTER_VH && pos >= z.b - AUTO_ENTER_VH : lastPos >= z.b - AUTO_ENTER_VH && pos <= z.a + AUTO_ENTER_VH);
    const zone = (dir > 0 ? AUTO : [...AUTO].reverse()).find(z => inside(z) || jumped(z));
    if (!zone) return;
    const start = p * SPAN, end = dir > 0 ? zone.b : zone.a;
    play = {from: start, to: end, ms: Math.max(MIN_AUTO_MS, zone.ms * Math.abs(end - start) / (zone.b - zone.a)), t: 0, waited: 0, rate: wantedRate()};
    lockScroll(true); pump();
  }
  function advance(dt) {
    if (play.t === 0 && coinReady() && p <= restP() && Math.abs(mx) + Math.abs(my) > COIN_CENTERED) return;   // the coin turns back to centre first, so it hands over to the film without a jump
    if (play.t === 0 && play.waited < WAIT_FOR_FRAMES_MS && !framesLoaded(play.from, play.to)) { play.waited += dt; return; }
    play.rate += (wantedRate() - play.rate) * (1 - Math.exp(-dt / RATE_EASE_MS));   // eased, so a change of pace never shows as a jump
    play.t = Math.min(play.ms, play.t + dt * play.rate);
    p = (play.from + (play.to - play.from) * smooth(play.t / play.ms)) / SPAN;
    if (play.t < play.ms) return;
    lastPos = play.to; target = p; play = null; dirty = true;
    scrollTo({top: sec.offsetTop + p * (sec.offsetHeight - innerHeight), behavior: 'instant'});
    landedAt = scrollY; landedTime = performance.now();
  }
  /* after landing, stay locked until the gesture that started it has finished, so its tail can't run on */
  let lastSize = 0, lastTouchY = 0;
  function noteInput(distance, time) {
    const gap = Math.max(8, time - lastInput);
    scrollSpeed += (distance / gap * 1000 - scrollSpeed) * Math.min(1, gap / SPEED_EASE_MS);
    lastInput = time;
  }
  addEventListener('wheel', e => {
    const size = Math.abs(e.deltaY), surge = size > WHEEL_SURGE_MIN && size > lastSize * WHEEL_SURGE;
    noteInput(size * (e.deltaMode === 1 ? WHEEL_LINE_PX : 1), e.timeStamp); lastSize = size;
    if (locked && !play && surge) lockScroll(false);
  }, {passive: true});
  addEventListener('touchstart', e => { lastTouchY = e.touches[0].clientY; }, {passive: true});
  addEventListener('touchmove', e => { const y = e.touches[0].clientY; noteInput(Math.abs(y - lastTouchY), e.timeStamp); lastTouchY = y; }, {passive: true});

  /* easing by time, not by frame, so a 120 Hz screen feels the same as a 60 Hz one */
  let then = performance.now();
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(MAX_STEP_MS, now - then), ease = ms => 1 - Math.exp(-dt / ms); then = now;
    if (now - lastInput > INPUT_ACTIVE_MS) scrollSpeed *= Math.exp(-dt / SPEED_FADE_MS);
    if (locked && !play && (now - lastInput > WHEEL_GAP_MS || now - landedTime > MAX_TAIL_MS / wantedRate())) lockScroll(false);   // a fast scroller runs straight on
    if (play) advance(dt);
    else { p += (target - p) * (reduce ? 1 : ease(SCROLL_EASE_MS)); if (Math.abs(target - p) < 0.00002) p = target; }
    if (coinReady() && p <= restP()) {
      const gx = play ? 0 : tx + Math.sin(now / IDLE_X_MS) * IDLE_X, gy = play ? 0 : ty + Math.sin(now / IDLE_Y_MS) * IDLE_Y, k = ease(play ? COIN_CENTER_MS : CURSOR_EASE_MS);
      mx += (gx - mx) * k; my += (gy - my) * k; dirty = true;
    }
    if (p === shown && !dirty) return;
    shown = p; dirty = false; draw(p * SPAN); pump();
  }
  requestAnimationFrame(tick);
})();
