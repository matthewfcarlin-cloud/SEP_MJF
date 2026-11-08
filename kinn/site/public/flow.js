/* RECO home: one pinned film, drawn to one canvas. Scroll position picks the moment.
   Everything is placed on a 1536x1024 stage, the size of the hero photograph, so every shot shares one framing.
   The films and both joins come from one Blender scene (../blender/v7/build_reco_v7.py), so the device never changes. */
(function flow() {
  const STAGE_W = 1536, STAGE_H = 1024, FILM_H = 864, FILM_TOP = 80;     // 16:9 film frames sit inside the 3:2 stage
  const RING = [1200, 345];                                              // the coin's ring in the photograph
  const TAPE_X = 1110;                                                   // what a narrow screen frames once the tape is on the knee
  const NARROW = () => innerWidth <= 760;
  /* on a narrow screen the arched tape is wider than the screen, so the framing widens as the tape bends and closes in again on the knee */
  const BEND_PX = 1022, BEND_PY = 521, BEND_TAPE_W = 839, BEND_FILL = .92, BEND_OPENS_BY = .6;   // the tape at the peak of the bend, on the stage
  const TAPE_ON_PHOTO = [945, 1300, 265, 915];                           // the tape in the photograph
  const BEND = 130, SEATED = 50, SEATS_BY = .92, GAUGE_MAX = 135;        // degrees. The tape comes off the peak of the bend down to the knee in the photograph
  const PEAK_BLEND = .05;       // the wrap's frames match the peak of the bend down to the grain of the tape. Over these first moments, with the tape at rest, that grain is blended rather than swapped
  const BEND_HEM_FADE = .35;   // the coin's film fades its top and bottom into the page, until the bending tape has come clear of them
  /* the film follows the scroll exactly as the earlier site did: the same step toward the scroll position on every screen refresh */
  const SCROLL_STEP = .1, SCROLL_SNAP = .0001, CURSOR_EASE_MS = 170, MAX_STEP_MS = 64;
  const BG = '#0d1212';
  const sec = document.getElementById('top'), cv = document.getElementById('flowCv'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const veil = sec.querySelector('.veil'), deg = document.getElementById('fDeg'), bar = document.getElementById('fBar'), degWrap = document.getElementById('fDegWrap');
  const device = document.getElementById('device'), scrPlan = document.getElementById('scrPlan'), scrShare = document.getElementById('scrShare');
  const smooth = x => { x = cl(x); return x * x * (3 - 2 * x); };

  /* the film strips */
  /* bump this whenever frames are replaced under the same names, so no browser keeps showing the old ones */
  const V = 'v=10';
  const SEQS = {hero: ['/flow/intro/h_', 120], flex: ['/flow/flex/k_', 96], wrap: ['/flow/wrap/a_', 70], settle: ['/flow/settle/s_', 30]};
  const frames = {}, all = [], seqStart = {}; let count = 0;
  for (const [k, [base, n]] of Object.entries(SEQS)) { frames[k] = []; seqStart[k] = count; count += n; for (let i = 0; i < n; i++) { const o = {src: base + String(i + 1).padStart(3, '0') + '.webp?' + V, k, i}; frames[k].push(o); all.push(o); } }

  /* the shots. vh = how much scroll each one takes */
  /* paced so the picture changes about as much per scroll as on the earlier site, which read well: about 2 to 4 (mean brightness change per vh) */
  const shots = [['hero', 260], ['bend', 320], ['wrap', 90], ['settle', 40], ['reveal', 90], ['hold', 60], ['signal', 100], ['phone', 140], ['close', 50], ['join', 40]];
  /* the coin's film barely moves for its first 42 frames, so it spends less scroll there and more on the drop. [scroll through the shot, frame] */
  const HERO_PACE = [[.07, 0], [.28, 42], [.62, 70], [.66, 76], [1, 119]];
  const paced = t => { if (t <= HERO_PACE[0][0]) return 0; const i = HERO_PACE.findIndex(s => s[0] >= t), [t0, f0] = HERO_PACE[i - 1], [t1, f1] = HERO_PACE[i]; return f0 + (f1 - f0) * (t - t0) / (t1 - t0); };
  /* averaged over a window, so the film's speed changes gradually instead of at those points */
  const HERO_STEPS = 400, HERO_SMOOTH = 24;
  const heroTable = Array.from({length: HERO_STEPS + 1}, (_, i) => { let sum = 0; for (let d = -HERO_SMOOTH; d <= HERO_SMOOTH; d++) sum += paced(cl((i + d) / HERO_STEPS)); return sum / (HERO_SMOOTH * 2 + 1); });
  const heroFrame = t => heroTable[Math.round(cl(t) * HERO_STEPS)] * 119 / heroTable[HERO_STEPS];
  const from = {}; let SPAN = 0; for (const [n, vh] of shots) { from[n] = [SPAN, vh]; SPAN += vh; }
  sec.style.height = SPAN + 100 + 'vh';
  const mark = s => { const [n, t] = s.split(' '); return from[n][0] + parseFloat(t) * from[n][1]; };   // 'shot t'
  /* soft stops: if a scroll ends near one of these, the page settles on it, and a quick flick stops there instead of skipping past.
     Nothing is timed or locked; the next scroll carries on. Each is a point on the film, in the same 'shot t' terms as the captions.
     The last is where the dial is fully lit, so the waitlist is never skipped on the way to the footer */
  const DIAL_LIT_AT = 'join .8';
  const PAUSES = ['signal .72', 'phone .22', 'phone .6', 'phone .9', DIAL_LIT_AT];
  const words = [...document.querySelectorAll('#words [data-a]')].map(el => ({el, a: mark(el.dataset.a), b: mark(el.dataset.b)}));
  /* a film position in vh is also how far into the section the page has scrolled, so each stop sits at that depth */
  PAUSES.forEach(at => { const stop = document.createElement('i'); stop.className = 'pause'; stop.setAttribute('aria-hidden', 'true'); stop.style.top = mark(at) + 'vh'; sec.append(stop); });
  /* the CSS stops above cover touch. A wheel or trackpad sends a stream of events, so: when one motion crosses a stop going down,
     rest on it and let the rest of that motion go. A new motion carries on: a gap in the stream, a swipe that speeds up again,
     or HOLD_MAX_MS at the most, so it never feels stuck */
  const GESTURE_GAP_MS = 160, SPEED_UP = 1.4, SPEED_UP_MIN = 6, HOLD_MAX_MS = 1100, PAUSE_REACH = 2;
  const stopsPx = () => [...sec.querySelectorAll('.pause')].map(el => el.getBoundingClientRect().top + scrollY);
  let heldAt = 0, held = false, lastWheel = 0, lastDelta = 0;
  addEventListener('wheel', e => {
    const now = performance.now(), dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    const newMotion = now - lastWheel > GESTURE_GAP_MS || Math.abs(dy) > Math.abs(lastDelta) * SPEED_UP + SPEED_UP_MIN;
    lastWheel = now; lastDelta = dy;
    if (held) {
      if (!newMotion && now - heldAt < HOLD_MAX_MS) { e.preventDefault(); return; }
      held = false;
    }
    if (reduce || dy <= 0 || e.ctrlKey) return;
    const stop = stopsPx().find(s => s > scrollY + PAUSE_REACH && s <= scrollY + dy);
    if (stop === undefined) return;
    e.preventDefault(); scrollTo({top: stop}); held = true; heldAt = now;
  }, {passive: false});

  /* loading. Every shot gets a rough pass first, every 8th frame, so whatever the reader scrolls to is already there.
     Then the frames nearest the reader fill in. Phones and data-saver skip every second frame */
  const BEHIND_COST = 3, ROUGH = 8, ROUGH_PULL = 100, RETRIES = 2, RETRY_MS = 1000, SLOTS = 6;
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
  /* the nearest loaded frame, one image at a time. Blending two frames shows both tapes at once */
  function nearest(k, x) {
    const f = frames[k], at = Math.round(cl(x, 0, f.length - 1));
    for (let d = 0; d < f.length; d++) { if (f[at - d] && f[at - d].img) return f[at - d].img; if (f[at + d] && f[at + d].img) return f[at + d].img; }
    return null;
  }

  /* the coin follows the cursor: the first frame of the intro, rendered turned to many angles. Only for a real pointer */
  const COLS = 15, ROWS = 7, canHover = matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce;
  const COIN_SLOTS = 4, COIN_REST_T = .07, CURSOR_REACH = .75, IDLE_X = .25, IDLE_Y = .14, IDLE_X_MS = 2200, IDLE_Y_MS = 1600, BOB_PX = 7, BOB_MS = 1250;
  const turned = new Array(COLS * ROWS); let tx = 0, ty = 0, mx = 0, my = 0, coarseLeft = 0, fineLeft = 0;
  const isCoarse = (i, j) => i % 2 === 1 && j % 2 === 1;   // every 6 degrees, through the centre: enough to respond while the rest load
  function loadCoin() {
    if (reduce) return;
    coinStarted = true;
    fetch(`/flow/coin/poses.json?${V}`).then(r => (r.ok ? r.json() : null)).then(j => { if (!j) return; coinPoses = j.poses; coinShape = j.coin; dirty = true; }).catch(() => {});
    const grid = []; for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) grid.push({i, j});
    /* a touch screen has no cursor, so the coarse set is enough for the coin to drift on its own */
    const queue = [...grid.filter(g => isCoarse(g.i, g.j)), ...(canHover ? grid.filter(g => !isCoarse(g.i, g.j)) : [])];
    coarseLeft = queue.filter(g => isCoarse(g.i, g.j)).length; fineLeft = canHover ? queue.length : Infinity;
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
    const im = nearest(k, x); if (!im) return;
    ctx.globalAlpha = a; place(ctx, im, ox, y, h, zoom, px, py); ctx.globalAlpha = 1;
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
  function coinTurn(ox, settle) {   // settle: 1 at rest, 0 where it hands over to the film, which starts from the centre pose
    if (!coinReady()) return false;
    const fine = fineLeft === 0, X = coinAxis(mx * settle, COLS, fine ? 0 : 1, fine ? 1 : 2), Y = coinAxis(my * settle, ROWS, fine ? 0 : 1, fine ? 1 : 2), u = X.f, v = Y.f, last = u * v;
    const cells = [[X.a, Y.a, 1, (1 - u) * (1 - v)], [X.b, Y.a, u, u * (1 - v)], [X.a, Y.b, last >= 1 ? 0 : v * (1 - u) / (1 - last), (1 - u) * v], [X.b, Y.b, last, u * v]];
    const screen = [S, 0, 0, S, ox + shiftX, OY + FILM_TOP * S + shiftY];
    const draw = (i, j, alpha, M) => { const im = turned[j * COLS + i]; if (!im || alpha <= 0) return; ctx.globalAlpha = alpha; ctx.setTransform(...M); ctx.drawImage(im, 0, 0, STAGE_W, FILM_H); };
    if (!coinPoses) { for (const [i, j, alpha] of cells) draw(i, j, alpha, screen); }
    else {
      /* all on this canvas, which the browser accelerates: the lined-up coin first, its edge faded out, then the tape slid in behind it */
      const between = [0, 1, 2, 3, 4, 5].map(n => cells.reduce((sum, [i, j, , weight]) => sum + coinPoses[j * COLS + i][n] * weight, 0)), onScreen = matMul(screen, matMul([1, 0, 0, 1, 0, Math.sin(performance.now() / BOB_MS) * BOB_PX * settle], between));
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
  /* as the phone arrives the photograph moves aside, so the tape is never hidden: into all the room left of the phone, or above it on a narrow screen */
  const BESIDE_MAX_ZOOM = 1.25, BESIDE_PAD = 28, BESIDE_TAPE_H = .8, BESIDE_TAPE_Y = .47, ABOVE_PHONE_GAP = 70, ABOVE_PHONE_BOTTOM = 20, ABOVE_PHONE_COIN_X = .74, PHOTO_FADE = 220;   // the coin sits right of the caption on a narrow screen
  function photoAside(k, ox) {
    const r = device.getBoundingClientRect(), c = cv.getBoundingClientRect();
    const [bx0, bx1, by0, by1] = TAPE_ON_PHOTO, coverH = z => H - STAGE_H * z * S;
    let z, x, y;
    if (NARROW()) {
      const coinY = (c.height - r.height - ABOVE_PHONE_BOTTOM - ABOVE_PHONE_GAP) * DPR;
      z = Math.max(1, (H - coinY) / ((STAGE_H - RING[1]) * S));   // far enough in that the photograph still reaches the bottom
      x = cl(W * ABOVE_PHONE_COIN_X - RING[0] * z * S, W - STAGE_W * z * S, 0); y = coinY - RING[1] * z * S;
    } else {
      const room = (r.left - c.left) * DPR;
      z = cl(Math.min((room - BESIDE_PAD * DPR * 2) / ((bx1 - bx0) * S), H * BESIDE_TAPE_H / ((by1 - by0) * S)), 1, BESIDE_MAX_ZOOM);
      x = room / 2 - (bx0 + bx1) / 2 * z * S; y = cl(H * BESIDE_TAPE_Y - (by0 + by1) / 2 * z * S, coverH(z), 0);
    }
    const at = {z: 1 + (z - 1) * k, x: ox + (x - ox) * k, y: OY + (y - OY) * k};
    return {...at, w: STAGE_W * at.z * S, h: STAGE_H * at.z * S, coin: [at.x + RING[0] * at.z * S, at.y + RING[1] * at.z * S]};
  }
  function drawAside(f, a = 1) {
    if (!ready(photo) || a <= 0) return;
    ctx.globalAlpha = a; ctx.drawImage(photo, f.x, f.y, f.w, f.h); ctx.globalAlpha = 1;
    /* its right edge fades into the page, once that edge is on screen */
    const edge = f.x + f.w, soft = PHOTO_FADE * f.z * S;
    if (edge - soft >= W) return;
    const g = ctx.createLinearGradient(edge - soft, 0, edge, 0); g.addColorStop(0, 'rgba(13,18,18,0)'); g.addColorStop(1, BG);
    ctx.fillStyle = g; ctx.fillRect(edge - soft, 0, soft, H); ctx.fillStyle = BG; ctx.fillRect(edge - 1, 0, W - edge + 1, H);
  }
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
  const bendZ = () => Math.min(1, W * BEND_FILL / (BEND_TAPE_W * S));
  const bendView = t => { const k = smooth(t / BEND_OPENS_BY); return {z: 1 + (bendZ() - 1) * k, px: STAGE_W / 2 + (BEND_PX - STAGE_W / 2) * k}; };
  const wrapView = t => { const k = smooth(t); return {z: bendZ() + (1 - bendZ()) * k, px: BEND_PX + (TAPE_X - BEND_PX) * k}; };
  /* the screens are stacked: Today underneath, the plan over it, then sending the week to a PT */
  function phone(rise, a, plan, share) {
    const on = a > .001;
    device.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
    device.style.opacity = a.toFixed(3); device.style.setProperty('--rise', (rise * innerHeight).toFixed(1) + 'px'); scrPlan.style.opacity = plan.toFixed(3); scrShare.style.opacity = share.toFixed(3);
  }

  /* the end of the film: the app's tick dial around the words. It lights clockwise to 9 o'clock with the scroll, as the logo's arc does.
     The ticks rise toward the cursor, and the button sweeps the arc almost closed */
  const DIAL_TICKS = 108, NARROW_DIAL_Y = .42, DIAL_W = .47, DIAL_H = .43, DIAL_TICK = 16, DIAL_RISE = 30, DIAL_REACH = .3, DIAL_LIT = .75, DIAL_NEARLY_CLOSED = .985, DIAL_WAVE_MS = 1100, DIAL_EASE_MS = 150, DIAL_SWEEP_MS = 320;
  const dialOpens = () => mark('close .4'), dialOpen = () => mark(DIAL_LIT_AT);
  let dialX = 0, dialY = 0, dialCursor = 0, dialHover = 0, ctaHovered = false;
  function dial(k, now) {
    if (k <= 0) return;
    const cx = W / 2, cy = H * (NARROW() ? NARROW_DIAL_Y : .5), r = Math.min(W * DIAL_W, H * DIAL_H), arc = k * (DIAL_LIT + (DIAL_NEARLY_CLOSED - DIAL_LIT) * dialHover);
    const toward = Math.atan2((dialY + .5) * H - cy, (dialX + .5) * W - cx), wave = reduce ? 0 : now / DIAL_WAVE_MS;
    ctx.lineCap = 'round'; ctx.lineWidth = 2 * DPR;
    for (let i = 0; i < DIAL_TICKS; i++) {
      const f = i / DIAL_TICKS, a = -Math.PI / 2 + f * Math.PI * 2, shown = smooth((k * 1.3 - f) / .3);
      if (shown <= 0) continue;
      const off = Math.atan2(Math.sin(a - toward), Math.cos(a - toward)), rise = dialCursor * Math.exp(-((off / DIAL_REACH) ** 2));
      const lit = cl((arc - f) * DIAL_TICKS), breath = .86 + .14 * Math.sin(f * 14 - wave);
      const inner = r - DIAL_TICK * DPR * .5, outer = inner + (DIAL_TICK + DIAL_RISE * rise) * DPR;
      const alpha = lit ? lit * breath : .17 + .55 * rise;
      ctx.strokeStyle = lit ? `rgba(61,219,184,${(alpha * shown).toFixed(3)})` : `rgba(242,241,236,${(alpha * shown).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner); ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer); ctx.stroke();
    }
  }
  /* the button leans a little toward the cursor. The fill starts from where the cursor came in */
  const CTA_PULL = .16, cta = document.getElementById('joinCta');
  const ctaAt = e => { const b = cta.getBoundingClientRect(); return {x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height}; };
  if (canHover) {
    cta.addEventListener('pointerenter', e => { const c = ctaAt(e); cta.style.setProperty('--in-x', c.x + 'px'); cta.style.setProperty('--in-y', c.y + 'px'); ctaHovered = true; dirty = true; });
    cta.addEventListener('pointermove', e => { const c = ctaAt(e); cta.style.setProperty('--pull-x', ((c.x - c.w / 2) * CTA_PULL).toFixed(1) + 'px'); cta.style.setProperty('--pull-y', ((c.y - c.h / 2) * CTA_PULL).toFixed(1) + 'px'); });
    cta.addEventListener('pointerleave', () => { cta.style.setProperty('--pull-x', '0px'); cta.style.setProperty('--pull-y', '0px'); ctaHovered = false; });
  }
  cta.addEventListener('focus', () => { ctaHovered = true; dirty = true; });
  cta.addEventListener('blur', () => { ctaHovered = false; });

  function draw(pos) {
    let name = shots[shots.length - 1][0]; for (const [n, vh] of shots) { if (pos < from[n][0] + vh) { name = n; break; } }
    const t = cl((pos - from[name][0]) / from[name][1]), n = NARROW();
    /* a narrow screen follows the tape as it moves */
    let cx = STAGE_W / 2;
    if (name === 'bend') cx = bendView(t).px;
    else if (name === 'wrap') cx = wrapView(t).px;
    else if (pos >= from.settle[0]) cx = TAPE_X;
    const ox = originX(cx);
    shiftX = shiftY = 0;
    ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    let phoneRise = 1, phoneA = 0, plan = 0, share = 0;
    switch (name) {
      case 'hero': {
        /* at rest the coin follows the cursor, with a little depth. Once it leaves, the film takes over from the same pose */
        if (canHover) { const k = 1 - t * .6; shiftX = -mx * 14 * k * DPR; shiftY = -my * 10 * k * DPR; }
        if (t > COIN_REST_T || !coinTurn(ox, smooth(1 - t / COIN_REST_T))) film('hero', heroFrame(t), ox);
        shiftX = shiftY = 0; hem(); cur = seqStart.hero + heroFrame(t); break;
      }
      case 'bend': {
        const v = bendView(t); film('flex', t * 95, ox, 1, n ? v.z : 1, v.px, BEND_PY); hem(1 - smooth(t / BEND_HEM_FADE)); cur = seqStart.flex + t * 95; break;
      }
      case 'wrap': {
        const v = wrapView(t), z = n ? v.z : 1;
        full('wrap', t * 69, ox, 1, z, v.px, BEND_PY);
        if (t < PEAK_BLEND) film('flex', 95, ox, 1 - smooth(t / PEAK_BLEND), z, v.px, BEND_PY);
        cur = seqStart.wrap + t * 69; break;
      }
      case 'settle': full('settle', t * 29, ox); cur = seqStart.settle + t * 29; break;
      case 'reveal': lit(smooth(t), ox); glow(Math.sin(Math.min(1, t * 1.4) * Math.PI), ox); break;
      case 'hold': if (ready(photo)) place(ctx, photo, ox, 0, STAGE_H); break;
      case 'signal': {
        phoneRise = .9 * (1 - smooth((t - .1) / .75)); phoneA = smooth((t - .08) / .3);
        const f = photoAside(smooth(t / .8), ox); drawAside(f); link(smooth((t - .3) / .55), 1, ox, f.coin);
        break;
      }
      case 'phone': {
        phoneRise = 0; phoneA = 1; plan = smooth((t - .41) / .04); share = smooth((t - .74) / .04);
        const f = photoAside(1, ox);
        if (n) { drawAside(f, 1 - smooth(t / .1)); link(1, 1 - smooth(t / .08), ox, f.coin); }
        else { drawAside(f); link(1, 1 - smooth((t - .25) / .2), ox, f.coin); }
        break;
      }
      case 'close': if (!n) drawAside(photoAside(1, ox), 1 - smooth(t)); phoneRise = -.02 * t; phoneA = 1 - smooth(t); plan = 1; share = 1; break;
      case 'join': break;
    }
    dial(smooth((pos - dialOpens()) / (dialOpen() - dialOpens())), performance.now());
    phone(phoneRise, phoneA, plan, share);
    words.forEach(w => w.el.classList.toggle('on', pos >= w.a && pos < w.b));
    const reading = pos >= mark('bend .03') && pos < mark('wrap .7');
    degWrap.classList.toggle('on', reading);
    if (reading) { const d = name === 'bend' ? BEND * smooth(t) : BEND + (SEATED - BEND) * smooth(t / SEATS_BY); deg.textContent = Math.round(d) + '°'; bar.style.width = (d / GAUGE_MAX * 100) + '%'; }
    veil.style.opacity = pos >= mark(n ? 'reveal .5' : 'signal .05') && pos < mark('close .5') ? 1 : 0;
  }

  let target = 0, p = 0, shown = -1;
  const measure = () => cl(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - innerHeight));
  const read = () => { target = measure(); };
  addEventListener('scroll', read, {passive: true}); addEventListener('resize', () => { fit(); read(); });
  fit(); target = p = measure(); pump(); loadCoin();
  const restP = () => COIN_REST_T * from.hero[1] / SPAN;

  /* easing by time, not by frame, so a 120 Hz screen feels the same as a 60 Hz one */
  let then = performance.now();
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(MAX_STEP_MS, now - then), ease = ms => 1 - Math.exp(-dt / ms); then = now;
    p += (target - p) * (reduce ? 1 : SCROLL_STEP); if (Math.abs(target - p) < SCROLL_SNAP) p = target;
    if (coinReady() && p <= restP()) {
      const k = ease(CURSOR_EASE_MS);
      mx += (tx * CURSOR_REACH + Math.sin(now / IDLE_X_MS) * IDLE_X - mx) * k; my += (ty * CURSOR_REACH + Math.sin(now / IDLE_Y_MS) * IDLE_Y - my) * k; dirty = true;
    }
    if (p * SPAN >= dialOpens()) {
      const k = ease(DIAL_EASE_MS);
      dialX += (tx - dialX) * k; dialY += (ty - dialY) * k; dialCursor += ((canHover ? 1 : 0) - dialCursor) * k;
      dialHover += ((ctaHovered ? 1 : 0) - dialHover) * ease(DIAL_SWEEP_MS);
      if (!reduce) dirty = true;
    }
    if (p === shown && !dirty) return;
    shown = p; dirty = false; draw(p * SPAN); pump();
  }
  requestAnimationFrame(tick);
})();
