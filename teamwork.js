/* Easter egg: add a player named "teamwork".
   Sequence (seconds from the click):
   0.0  the face zooms in, spinning
   0.9  it trembles…
   1.3  BOOM: flash, screen shake, the face shatters into tiles, rain of faces begins
   1.35 "TEAMWORK" slams in, air horns
   1.9  "MAKES THE DREAM WORK" letters fall in one by one, rainbow + wobble
   1.8–8 fireworks rockets burst all over, each flinging more faces
   9.2  fades out (tap or Escape closes it any time) */
(() => {
  const ICON = 'missicon.jpg';
  const COLORS = ['#ffc531', '#ff4d6d', '#4dd2ff', '#7cff6b', '#ffffff', '#c77dff', '#ff8c42'];
  const G = 900;
  let busy = false, AC = null;

  const img = new Image();
  img.src = ICON; // preload so the face is ready when the egg fires

  const css = `
.tw-ov{position:fixed;inset:0;z-index:99999;overflow:hidden;cursor:pointer;background:radial-gradient(circle at 50% 50%,rgb(60 0 80/.6),rgb(0 0 0/.85));animation:tw-in .3s both;transition:opacity .8s}
.tw-ov.tw-out{opacity:0}
.tw-ov canvas{position:absolute;inset:0;z-index:2}
.tw-rays{position:absolute;left:50%;top:50%;width:250vmax;height:250vmax;margin:-125vmax 0 0 -125vmax;background:repeating-conic-gradient(rgb(255 197 49/.17) 0 9deg,transparent 9deg 18deg);opacity:0;z-index:1;animation:tw-fade .6s 1.3s both,tw-spin 14s linear infinite}
.tw-flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:4;pointer-events:none}
.tw-flash.go{animation:tw-flash .7s ease-out}
.tw-title{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;pointer-events:none;font-family:Rubik,system-ui,sans-serif;font-weight:900;filter:drop-shadow(0 6px 0 rgb(0 0 0/.6)) drop-shadow(0 0 28px rgb(0 0 0/.55))}
.tw-top{font-size:clamp(28px,7vw,76px);letter-spacing:.12em;color:#ffc531;line-height:1;animation:tw-slam .55s cubic-bezier(.2,1.4,.4,1) 1.35s both}
.tw-main{font-size:clamp(42px,11vw,132px);line-height:1.02;margin-top:.12em;max-width:11ch}
.tw-w{display:inline-block;white-space:nowrap}
.tw-l{display:inline-block;background:linear-gradient(90deg,#ff4d6d,#ffc531,#7cff6b,#4dd2ff,#c77dff,#ff4d6d);background-size:600% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;
  animation:tw-drop .75s cubic-bezier(.2,1.6,.4,1) calc(1.9s + var(--i) * 55ms) both,tw-hue 2.4s linear calc(var(--i) * -.12s) infinite,tw-bob 1.1s ease-in-out calc(3s + var(--i) * 70ms) infinite alternate}
.tw-hint{position:absolute;bottom:calc(18px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;color:#fff;font:500 14px Rubik,system-ui,sans-serif;z-index:3;opacity:0;animation:tw-fade .5s 4s both}
.tw-shaking>*:not(.tw-ov){animation:tw-shake .65s}
@keyframes tw-in{from{opacity:0}}
@keyframes tw-fade{to{opacity:.8}}
@keyframes tw-spin{to{transform:rotate(1turn)}}
@keyframes tw-flash{0%{opacity:.95}100%{opacity:0}}
@keyframes tw-slam{0%{transform:scale(5);opacity:0;letter-spacing:.6em}60%{opacity:1}100%{transform:scale(1);letter-spacing:.12em}}
@keyframes tw-drop{0%{transform:translateY(-120vh) rotate(-540deg) scale(.4);opacity:0}70%{opacity:1}100%{transform:none}}
@keyframes tw-hue{to{background-position:100% 0}}
@keyframes tw-bob{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-.08em) rotate(4deg)}}
@keyframes tw-shake{0%,100%{transform:none}10%{transform:translate(-16px,9px) rotate(-1.2deg)}30%{transform:translate(14px,-11px) rotate(1deg)}50%{transform:translate(-10px,7px)}70%{transform:translate(8px,-5px)}90%{transform:translate(-4px,2px)}}
`;

  /* ---------- sound (Web Audio, synthesized: no files) ---------- */
  function audio() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function noise(ac, dur) {
    const b = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function boom() {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime;
    const n = ac.createBufferSource(); n.buffer = noise(ac, 1.6);
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(45, t + 1.4);
    const g = ac.createGain(); g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + 1.5);
    n.connect(f).connect(g).connect(ac.destination); n.start(t);
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(28, t + .8);
    const og = ac.createGain(); og.gain.setValueAtTime(.9, t); og.gain.exponentialRampToValueAtTime(.001, t + .9);
    o.connect(og).connect(ac.destination); o.start(t); o.stop(t + 1);
  }
  function pop() {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime;
    const n = ac.createBufferSource(); n.buffer = noise(ac, .35);
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600 + Math.random() * 1600; f.Q.value = .8;
    const g = ac.createGain(); g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.001, t + .32);
    n.connect(f).connect(g).connect(ac.destination); n.start(t);
  }
  function horn(when, dur = .45) { // air-horn: stacked detuned saws
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime + when;
    [1, 1.26, 1.5, 2.01].forEach(m => {
      const o = ac.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(335 * m, t); o.frequency.linearRampToValueAtTime(318 * m, t + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.055, t + .025);
      g.gain.setValueAtTime(.055, t + dur - .06); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05);
    });
  }

  /* ---------- the show ---------- */
  window.teamworkEgg = function () {
    if (busy) return;
    busy = true;
    if (!document.getElementById('tw-css')) {
      const s = document.createElement('style'); s.id = 'tw-css'; s.textContent = css; document.head.appendChild(s);
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let k = 0;
    const main = 'MAKES THE DREAM WORK'.split(' ')
      .map(w => `<span class="tw-w">${[...w].map(c => `<span class="tw-l" style="--i:${k++}">${c}</span>`).join('')}</span>`).join(' ');
    const ov = document.createElement('div');
    ov.className = 'tw-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Teamwork makes the dream work');
    ov.innerHTML = `<div class="tw-rays"></div><canvas></canvas><div class="tw-flash"></div>
      <div class="tw-title" aria-hidden="true"><div class="tw-top">TEAMWORK</div><div class="tw-main">${main}</div></div>
      <div class="tw-hint">tap anywhere to close</div>`;
    document.body.appendChild(ov);

    const t0 = performance.now();
    let closing = false, raf = 0;
    const onKey = e => { if (e.key === 'Escape') close(); };
    function close() {
      if (closing) return;
      closing = true;
      ov.classList.add('tw-out');
      setTimeout(() => {
        cancelAnimationFrame(raf);
        ov.remove();
        removeEventListener('resize', size);
        removeEventListener('keydown', onKey);
        busy = false;
      }, 800);
    }
    ov.addEventListener('click', () => { if (performance.now() - t0 > 600) close(); });
    addEventListener('keydown', onKey);

    if (reduce) { // calm version: no motion, no sound
      setTimeout(close, 4000);
      return;
    }

    horn(1.4); horn(1.9); horn(2.4, 1.1);
    setTimeout(close, 9200);

    const cv = ov.querySelector('canvas'), ctx = cv.getContext('2d');
    let W, H, dpr;
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
    }
    size();
    addEventListener('resize', size);

    // round face with a gold rim, drawn once and reused for every falling face
    let sprite = null;
    function makeSprite() {
      const S = 160, s = document.createElement('canvas'); s.width = s.height = S;
      const c = s.getContext('2d');
      c.save(); c.beginPath(); c.arc(S / 2, S / 2, S / 2 - 6, 0, 7); c.clip();
      c.drawImage(img, 0, 0, S, S); c.restore();
      c.lineWidth = 8; c.strokeStyle = '#ffc531'; c.beginPath(); c.arc(S / 2, S / 2, S / 2 - 5, 0, 7); c.stroke();
      sprite = s;
    }
    if (img.complete && img.naturalWidth) makeSprite(); else img.addEventListener('load', makeSprite, { once: true });

    const R = (a, b) => a + Math.random() * (b - a);
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const easeOutBack = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2; };
    const faces = [], sparks = [], rings = [], tiles = [], rockets = [];
    let shake = 0, last = t0, shattered = false, nextRocket = 1.8, rainAcc = 0;

    const face = (x, y, vx, vy, s) => faces.push({ x, y, vx, vy, s, rot: R(0, 6.28), vr: R(-4, 4), bounced: false });
    function flash() { const f = ov.querySelector('.tw-flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
    function pageShake() { document.body.classList.add('tw-shaking'); setTimeout(() => document.body.classList.remove('tw-shaking'), 700); }
    function burst(x, y, p) {
      if (sparks.length < 2600) {
        const n = Math.round(60 * p);
        for (let i = 0; i < n; i++) {
          const a = R(0, 6.283), v = R(80, 520) * p, life = R(.7, 1.4);
          sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, c: COLORS[i % COLORS.length], s: R(2.5, 5.5) });
        }
      }
      rings.push({ x, y, r: 4, v: 560 * p, life: .55, max: .55, c: pick(COLORS) });
      if (faces.length < 260) for (let i = 0; i < Math.round(3 * p); i++) {
        const a = R(0, 6.283), v = R(200, 520);
        face(x, y, Math.cos(a) * v, Math.sin(a) * v - 220, R(26, 48));
      }
      pop();
    }
    function shatter() {
      const S = Math.min(W, H) * .55, N = 8, w = S / N, cx = W / 2, cy = H / 2;
      if (img.naturalWidth) {
        const sw = img.naturalWidth / N, sh = img.naturalHeight / N;
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const x = cx - S / 2 + (i + .5) * w, y = cy - S / 2 + (j + .5) * w, dx = x - cx, dy = y - cy;
          if (Math.hypot(dx, dy) > S / 2 + w * .3) continue; // only the round part
          tiles.push({ x, y, vx: dx * R(4, 9) + R(-80, 80), vy: dy * R(4, 9) - R(200, 650), rot: 0, vr: R(-9, 9), w, sx: i * sw, sy: j * sh, sw, sh });
        }
      }
      burst(cx, cy, 3.2);
      shake = 34; boom(); flash(); pageShake();
      for (let i = 0; i < 30; i++) face(R(0, W), R(-H * .6, -40), R(-60, 60), R(100, 300), R(24, 60));
    }

    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (shake > .5) { ctx.translate(R(-shake, shake), R(-shake, shake)); shake *= Math.pow(.015, dt); }

      // 1. the big face: zoom-spin in, tremble, then shatter
      if (!shattered) {
        if (t >= 1.3) { shattered = true; shatter(); }
        else if (sprite) {
          const S = Math.min(W, H) * .55;
          let sc, rot = 0, jx = 0, jy = 0;
          if (t < .9) { const p = t / .9; sc = easeOutBack(p); rot = (1 - p) * Math.PI * 6; }
          else { sc = 1 + .07 * Math.sin(t * 70); const j = (t - .9) * 22; jx = R(-j, j); jy = R(-j, j); }
          ctx.save(); ctx.translate(W / 2 + jx, H / 2 + jy); ctx.rotate(rot); ctx.scale(sc, sc);
          ctx.drawImage(sprite, -S / 2, -S / 2, S, S); ctx.restore();
        }
      }

      // 2. spawn: rain of faces and fireworks rockets
      if (shattered && t < 8) {
        rainAcc += dt * (W < 600 ? 14 : 24);
        while (rainAcc >= 1) { rainAcc--; face(R(-20, W + 20), -60, R(-40, 40), R(120, 320), R(22, 58)); }
        if (t >= nextRocket) {
          nextRocket = t + R(.25, .6);
          const ty = R(H * .1, H * .45);
          rockets.push({ x: R(W * .1, W * .9), y: H + 10, vx: R(-60, 60), vy: -Math.sqrt(2 * G * (H + 10 - ty)), c: pick(COLORS) });
        }
      }

      // 3. rockets (with sparkly trails)
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.vy += G * dt; r.x += r.vx * dt; r.y += r.vy * dt;
        sparks.push({ x: r.x, y: r.y, vx: R(-30, 30), vy: R(20, 80), life: .35, max: .35, c: r.c, s: 2 });
        if (r.vy >= -30) { burst(r.x, r.y, R(.8, 1.7)); rockets.splice(i, 1); }
      }

      // 4. shattered tiles of the big face
      for (let i = tiles.length - 1; i >= 0; i--) {
        const p = tiles[i];
        p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y > H + p.w * 2) { tiles.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, -p.w / 2, -p.w / 2, p.w, p.w); ctx.restore();
      }

      // 5. falling faces (they bounce once off the bottom)
      if (sprite) for (let i = faces.length - 1; i >= 0; i--) {
        const f = faces[i];
        f.vy += 300 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
        if (!f.bounced && f.vy > 0 && f.y > H - f.s / 2) { f.vy *= -.5; f.vx += R(-90, 90); f.vr *= -1.5; f.bounced = true; }
        if (f.y > H + f.s) { faces.splice(i, 1); continue; }
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
        ctx.drawImage(sprite, -f.s / 2, -f.s / 2, f.s, f.s); ctx.restore();
      }

      // 6. glowing sparks and shockwave rings
      ctx.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        s.vx *= Math.pow(.25, dt); s.vy = s.vy * Math.pow(.25, dt) + G * .45 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        ctx.globalAlpha = s.life / s.max; ctx.fillStyle = s.c;
        ctx.fillRect(s.x - s.s / 2, s.y - s.s / 2, s.s, s.s);
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life -= dt;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        r.r += r.v * dt; r.v *= Math.pow(.02, dt);
        ctx.globalAlpha = r.life / r.max; ctx.strokeStyle = r.c; ctx.lineWidth = 7 * r.life / r.max;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(frame); // keeps running through the fade-out; cancelled on removal
    }
    raf = requestAnimationFrame(frame);
  };
})();
