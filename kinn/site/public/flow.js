/* RECO home: one pinned film, drawn to one canvas. Scroll position picks the moment.
   Everything is placed on a 1536x1024 stage, the size of the hero photograph, so every shot shares one framing. */
(function flow() {
  const STAGE_W = 1536, STAGE_H = 1024, FILM_H = 864, FILM_TOP = 80;     // 16:9 film frames sit inside the 3:2 stage
  const RING = [1200, 345];                                              // the coin's ring in the photograph
  const TAPE_X = 1110;                                                   // what a narrow screen frames once the tape is on the knee
  const BG = '#0d1111';
  const sec = document.getElementById('top'), cv = document.getElementById('flowCv'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const veil = sec.querySelector('.veil'), cue = document.getElementById('cue');
  const smooth = x => { x = cl(x); return x * x * (3 - 2 * x); };

  /* the film strips */
  const SEQS = {hero: ['/hero7/h_', 120], film: ['/film7/v_', 90], wrap: ['/flow/wrap/a_', 60]};
  const frames = {}; const all = [];
  for (const [k, [base, n]] of Object.entries(SEQS)) { frames[k] = []; for (let i = 0; i < n; i++) { const o = {src: base + String(i + 1).padStart(3, '0') + '.webp', k, i}; frames[k].push(o); all.push(o); } }
  const seqStart = {hero: 0, film: 120, wrap: 210};

  /* the shots. vh = how much scroll each one takes */
  const shots = [['hero', 230], ['dive', 60], ['film', 190], ['wrap', 130], ['settle', 26], ['reveal', 130], ['hold', 70], ['fade', 80]];
  const from = {}; let SPAN = 0; for (const [n, vh] of shots) { from[n] = [SPAN, vh]; SPAN += vh; }
  sec.style.height = SPAN + 100 + 'vh';
  const mark = s => { const [n, t] = s.split(' '); return from[n][0] + parseFloat(t) * from[n][1]; };
  const words = [...document.querySelectorAll('#words [data-a]')].map(el => ({el, a: mark(el.dataset.a), b: mark(el.dataset.b)}));

  /* loading: nearest to where the reader is goes first. Phones and data-saver take every second frame */
  const conn = navigator.connection || {}, stride = innerWidth < 760 || conn.saveData ? 2 : 1;
  let pending = all.filter(o => o.i % stride === 0 || o.i === SEQS[o.k][1] - 1), active = 0, cur = 0;
  const pump = () => {
    while (active < 8 && pending.length) {
      let best = 0, bd = 1e9; pending.forEach((o, j) => { const d = Math.abs(seqStart[o.k] + o.i - cur); if (d < bd) { bd = d; best = j; } });
      const o = pending.splice(best, 1)[0], im = new Image(); active++;
      const done = () => { active--; pump(); dirty = true; };
      im.onload = () => { o.img = im; done(); }; im.onerror = done; im.src = o.src;
    }
  };
  const still = src => { const im = new Image(); im.onload = () => { dirty = true; }; im.src = src; return im; };
  const photo = still('/flow/hero.webp'), cutout = still('/flow/tape.webp');
  const ready = im => im && im.complete && im.naturalWidth;
  const nearest = (k, i) => { const f = frames[k]; for (let d = 0; d < f.length; d++) { if (f[i - d] && f[i - d].img) return f[i - d].img; if (f[i + d] && f[i + d].img) return f[i + d].img; } return null; };

  /* the stage on this screen */
  let W = 0, H = 0, S = 1, OY = 0;
  const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = off.width = Math.round(cv.clientWidth * d); H = cv.height = off.height = Math.round(cv.clientHeight * d); S = Math.max(W / STAGE_W, H / STAGE_H); OY = (H - STAGE_H * S) / 2; dirty = true; };
  const originX = cx => Math.min(0, Math.max(W - STAGE_W * S, W / 2 - cx * S));
  function place(c, im, ox, y, h, zoom = 1, px = STAGE_W / 2, py = STAGE_H / 2) {
    /* zoom about a point on the stage */
    const x0 = ox + (px - (px - 0) * zoom) * S, y0 = OY + (py + (y - py) * zoom) * S;
    c.drawImage(im, x0, y0, STAGE_W * zoom * S, h * zoom * S);
  }
  const film = (k, i, ox, a = 1, zoom = 1, px, py) => { const im = nearest(k, i); if (!im) return; ctx.globalAlpha = a; place(ctx, im, ox, FILM_TOP, FILM_H, zoom, px, py); ctx.globalAlpha = 1; };
  /* the 16:9 film frames are shorter than the stage: fade their top and bottom into the page so they never show an edge */
  function hem(a = 1) {
    if (a <= 0) return;
    const yT = OY + FILM_TOP * S, yB = OY + (FILM_TOP + FILM_H) * S, h = 150 * S;
    ctx.globalAlpha = a; ctx.fillStyle = BG;
    let g = ctx.createLinearGradient(0, yB - h, 0, yB); g.addColorStop(0, 'rgba(13,17,17,0)'); g.addColorStop(1, BG); ctx.fillStyle = g; ctx.fillRect(0, yB - h, W, h);
    ctx.fillStyle = BG; ctx.fillRect(0, yB - 1, W, H - yB + 1);
    g = ctx.createLinearGradient(0, yT, 0, yT + h); g.addColorStop(0, BG); g.addColorStop(1, 'rgba(13,17,17,0)'); ctx.fillStyle = g; ctx.fillRect(0, yT, W, h);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, yT + 1);
    ctx.globalAlpha = 1;
  }
  const full = (k, i, ox, a = 1) => { const im = nearest(k, i); if (!im) return; ctx.globalAlpha = a; place(ctx, im, ox, 0, STAGE_H); ctx.globalAlpha = 1; };

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
  function glow(a, ox) {
    if (a <= 0) return;
    const x = ox + RING[0] * S, y = OY + RING[1] * S, r = 280 * S, g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(120,240,210,${(.2 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(120,240,210,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over';
  }

  function draw(pos) {
    let name = shots[shots.length - 1][0]; for (const [n, vh] of shots) { if (pos < from[n][0] + vh) { name = n; break; } }
    const t = cl((pos - from[name][0]) / from[name][1]);
    /* a narrow screen follows the tape as it moves to the knee */
    const after = pos >= from.settle[0], cx = after ? TAPE_X : name === 'wrap' ? STAGE_W / 2 + (TAPE_X - STAGE_W / 2) * smooth(t) : STAGE_W / 2, ox = originX(cx);
    ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    switch (name) {
      case 'hero': film('hero', Math.round(t * 119), ox); hem(); cur = seqStart.hero + t * 119; break;
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
      case 'wrap':
        if (t < .06) { film('film', 89, ox, 1 - t / .06); hem(1 - t / .06); }
        full('wrap', Math.round(t * 59), ox, Math.min(1, t / .06)); cur = seqStart.wrap + t * 59; break;
      case 'settle':
        full('wrap', 59, ox, 1 - smooth(t)); if (ready(cutout)) { ctx.globalAlpha = smooth(t); place(ctx, cutout, ox, 0, STAGE_H); ctx.globalAlpha = 1; } break;
      case 'reveal': lit(smooth(t), ox); glow(Math.sin(Math.min(1, t * 1.4) * Math.PI), ox); break;
      case 'hold': if (ready(photo)) place(ctx, photo, ox, 0, STAGE_H); break;
      case 'fade': lit(1 - smooth(t), ox); break;
    }
    words.forEach(w => w.el.classList.toggle('on', pos >= w.a && pos < w.b));
    veil.style.opacity = innerWidth <= 760 && pos >= mark('reveal .5') && pos < mark('fade .3') ? 1 : 0;
    cue.style.opacity = pos > 25 ? 0 : 1;
  }

  let dirty = true, target = 0, p = 0, shown = -1;
  const read = () => { const b = sec.getBoundingClientRect(); target = cl(-b.top / Math.max(1, sec.offsetHeight - innerHeight)); };
  addEventListener('scroll', read, {passive: true}); addEventListener('resize', () => { fit(); read(); });
  fit(); read(); p = target; pump();
  (function tick() {
    requestAnimationFrame(tick);
    p += (target - p) * (reduce ? 1 : 0.12); if (Math.abs(target - p) < 0.00002) p = target;
    if (p === shown && !dirty) return;
    shown = p; dirty = false; draw(p * SPAN); pump();
  })();
})();
