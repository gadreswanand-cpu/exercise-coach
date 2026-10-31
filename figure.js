/* Animated exercise figure.
 * Draws a simple person in SVG from a "pose" (a set of joint angles) and
 * smoothly moves between poses (keyframes). Every exercise in exercises.js is
 * just a list of poses, so new exercises need no drawing skills.
 *
 * Angle convention (degrees), for every body segment:
 *   0 = points straight down, 90 = points right (the way the person faces),
 *   180 = points straight up, -90 = points left.
 * Side view keys:
 *   x, y        pelvis position (viewBox is 200 x 200, mat/floor at y = 180)
 *   torso       pelvis -> shoulders (180 = upright)
 *   bend        spine curve, + rounds the back (cat), - arches it (cow)
 *   neck        shoulders -> head (180 = upright)
 *   ua, fa      near upper arm / forearm        ua2, fa2  far arm
 *   th, sh, ft  near thigh / shin / foot        th2, sh2, ft2  far leg
 * Front view keys (view: "front"):
 *   tilt (head side tilt, + = to the person's left / screen right),
 *   turn (-1..1 head rotation), shrug (0..1), armL, armR, elbowL, elbowR,
 *   legL, legR, kneeL, kneeR, y
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const L = { torso: 50, neck: 9, head: 10.5, ua: 25, fa: 23, th: 34, sh: 36, ft: 9 };
  const GROUND = 175; // where joints rest when "ground" is on (floor line is at 180)

  const SIDE_DEFAULT = {
    x: 100, y: 105, torso: 180, bend: 0, neck: 180, nod: 0,
    ua: 0, fa: 0, ua2: 0, fa2: 0,
    th: 0, sh: 0, ft: 90, th2: 0, sh2: 0, ft2: 90,
  };
  const FRONT_DEFAULT = {
    x: 100, y: 108, tilt: 0, turn: 0, shrug: 0,
    armL: 8, armR: 8, elbowL: 0, elbowR: 0, legL: 4, legR: 4, kneeL: 0, kneeR: 0,
  };

  const rad = d => (d * Math.PI) / 180;
  const vec = (a, len) => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len];
  const add = (p, a, len) => { const v = vec(a, len); return [p[0] + v[0], p[1] + v[1]]; };
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const pts = a => a.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

  /* two-bone solver: place the wrist/ankle at a target point, bending the
     middle joint to one side (sign +1 = knee-like, -1 = elbow-like) */
  function ik(s, t, l1, l2, sign) {
    const dx = t[0] - s[0], dy = t[1] - s[1];
    const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
    const base = (Math.atan2(dx, dy) * 180) / Math.PI;
    const a = (Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) * 180) / Math.PI;
    const j = add(s, base + sign * a, l1);
    const end = add(s, base, d);
    return [j, end];
  }

  /* ---------- side view ---------- */
  function sideJoints(p) {
    const hip = [p.x, p.y];
    const sho = add(hip, p.torso, L.torso);
    // spine curve control point: perpendicular offset from the torso middle
    const mid = [(hip[0] + sho[0]) / 2, (hip[1] + sho[1]) / 2];
    const ctrl = add(mid, p.torso - 90, -p.bend);
    const headC = add(sho, p.neck, L.neck + L.head);
    const neckEnd = add(sho, p.neck, L.neck);
    const limb = (start, a1, l1, a2, l2, tx, ty, sign) => {
      if (tx != null && !isNaN(tx)) return ik(start, [tx, ty], l1, l2, sign);
      const j = add(start, a1, l1); return [j, add(j, a2, l2)];
    };
    const [elb, wri] = limb(sho, p.ua, L.ua, p.fa, L.fa, p.wx, p.wy, p.esign || -1);
    const [elb2, wri2] = limb(sho, p.ua2, L.ua, p.fa2, L.fa, p.wx2, p.wy2, p.esign || -1);
    const [kne, ank] = limb(hip, p.th, L.th, p.sh, L.sh, p.fx, p.fy, p.ksign || 1);
    const toe = add(ank, p.ft, L.ft);
    const [kne2, ank2] = limb(hip, p.th2, L.th, p.sh2, L.sh, p.fx2, p.fy2, p.ksign || 1);
    const toe2 = add(ank2, p.ft2, L.ft);
    return { hip, sho, ctrl, headC, neckEnd, elb, wri, elb2, wri2, kne, ank, toe, kne2, ank2, toe2 };
  }

  function groundPose(p) {
    const j = sideJoints(p);
    const ys = [j.hip, j.sho, j.wri, j.wri2, j.elb, j.elb2, j.kne, j.kne2, j.ank, j.ank2, j.toe, j.toe2].map(q => q[1]);
    return Object.assign({}, p, { y: p.y + (GROUND - Math.max(...ys)) });
  }

  function buildSide(svg) {
    const far = el("g", { class: "fig-far" }, svg);
    const near = el("g", { class: "fig-near" }, svg);
    return {
      arm2: el("polyline", {}, far), leg2: el("polyline", {}, far),
      leg: el("polyline", {}, near), spine: el("path", { class: "fig-spine" }, near),
      neck: el("line", {}, near), head: el("circle", { r: L.head, class: "fig-head" }, near),
      eye: el("circle", { r: 1.6, class: "fig-eye" }, near), nose: el("line", { class: "fig-nose" }, near),
      arm: el("polyline", {}, near),
    };
  }

  function drawSide(parts, p) {
    const j = sideJoints(p);
    parts.arm2.setAttribute("points", pts([j.sho, j.elb2, j.wri2]));
    parts.leg2.setAttribute("points", pts([j.hip, j.kne2, j.ank2, j.toe2]));
    parts.leg.setAttribute("points", pts([j.hip, j.kne, j.ank, j.toe]));
    parts.arm.setAttribute("points", pts([j.sho, j.elb, j.wri]));
    parts.spine.setAttribute("d", `M${j.hip[0].toFixed(1)},${j.hip[1].toFixed(1)} Q${j.ctrl[0].toFixed(1)},${j.ctrl[1].toFixed(1)} ${j.sho[0].toFixed(1)},${j.sho[1].toFixed(1)}`);
    parts.neck.setAttribute("x1", j.sho[0]); parts.neck.setAttribute("y1", j.sho[1]);
    parts.neck.setAttribute("x2", j.neckEnd[0]); parts.neck.setAttribute("y2", j.neckEnd[1]);
    parts.head.setAttribute("cx", j.headC[0]); parts.head.setAttribute("cy", j.headC[1]);
    const fa = p.neck + p.nod; // face direction
    const eye = add(add(j.headC, fa - 90, 5), fa, 2.5);
    parts.eye.setAttribute("cx", eye[0]); parts.eye.setAttribute("cy", eye[1]);
    const n1 = add(add(j.headC, fa - 90, 9.5), fa, -1), n2 = add(add(j.headC, fa - 90, 13), fa, -2.5);
    parts.nose.setAttribute("x1", n1[0]); parts.nose.setAttribute("y1", n1[1]);
    parts.nose.setAttribute("x2", n2[0]); parts.nose.setAttribute("y2", n2[1]);
  }

  /* ---------- front view ---------- */
  function buildFront(svg) {
    const g = el("g", { class: "fig-near" }, svg);
    return {
      legL: el("polyline", {}, g), legR: el("polyline", {}, g),
      body: el("polyline", { class: "fig-spine" }, g),
      armL: el("polyline", {}, g), armR: el("polyline", {}, g),
      neck: el("line", {}, g), head: el("circle", { r: L.head + 1, class: "fig-head" }, g),
      eyeL: el("circle", { r: 1.6, class: "fig-eye" }, g), eyeR: el("circle", { r: 1.6, class: "fig-eye" }, g),
      nose: el("line", { class: "fig-nose" }, g),
    };
  }

  function drawFront(parts, p) {
    const hip = [p.x, p.y];
    const neckBase = [p.x, p.y - L.torso];
    const sy = neckBase[1] + 4 - p.shrug * 7;
    const shL = [p.x + 17, sy], shR = [p.x - 17, sy]; // person's left = screen right
    const hipL = [p.x + 9, p.y], hipR = [p.x - 9, p.y];
    parts.body.setAttribute("points", pts([hipR, hipL, hip, neckBase, shL, neckBase, shR]));
    const limb = (s, a, l1, b, l2) => { const j = add(s, a, l1); return [s, j, add(j, b, l2)]; };
    parts.armL.setAttribute("points", pts(limb(shL, p.armL, L.ua, p.armL + p.elbowL, L.fa)));
    parts.armR.setAttribute("points", pts(limb(shR, -p.armR, L.ua, -p.armR - p.elbowR, L.fa)));
    parts.legL.setAttribute("points", pts(limb(hipL, p.legL, L.th, p.legL - p.kneeL, L.sh)));
    parts.legR.setAttribute("points", pts(limb(hipR, -p.legR, L.th, -p.legR + p.kneeR, L.sh)));
    const headA = 180 + p.tilt; // tilt rotates the head about the neck base
    const nEnd = add(neckBase, headA, L.neck);
    const hc = add(neckBase, headA, L.neck + L.head + 1);
    parts.neck.setAttribute("x1", neckBase[0]); parts.neck.setAttribute("y1", neckBase[1]);
    parts.neck.setAttribute("x2", nEnd[0]); parts.neck.setAttribute("y2", nEnd[1]);
    parts.head.setAttribute("cx", hc[0]); parts.head.setAttribute("cy", hc[1]);
    // face features slide sideways with "turn" and rotate with "tilt"
    const across = headA - 90, up = headA;
    const shift = p.turn * 6;
    const f = (dx, dy) => add(add(hc, across, dx + shift), up, dy);
    const eL = f(4, 2), eR = f(-4, 2), n1 = f(0, 1), n2 = f(p.turn * 3, -3);
    parts.eyeL.setAttribute("cx", eL[0]); parts.eyeL.setAttribute("cy", eL[1]);
    parts.eyeR.setAttribute("cx", eR[0]); parts.eyeR.setAttribute("cy", eR[1]);
    parts.eyeL.style.opacity = p.turn > 0.75 ? 0 : 1; parts.eyeR.style.opacity = p.turn < -0.75 ? 0 : 1;
    parts.nose.setAttribute("x1", n1[0]); parts.nose.setAttribute("y1", n1[1]);
    parts.nose.setAttribute("x2", n2[0]); parts.nose.setAttribute("y2", n2[1]);
  }

  /* ---------- props ---------- */
  function drawProps(svg, props) {
    const g = el("g", { class: "fig-props" }, svg);
    el("line", { x1: -100, y1: 180.5, x2: 300, y2: 180.5, class: "floor" }, g);
    (props || []).forEach(pr => {
      if (pr === "mat") el("rect", { x: -40, y: 178, width: 280, height: 5, rx: 2.5, class: "mat" }, g);
      if (pr === "chair") { // seat top at y = 141, front edge at x = 100
        el("path", { d: "M56,141 H104 M60,141 V180 M100,141 V180 M60,141 V88", class: "chair" }, g);
      }
      if (pr === "chair-back") { // a chair to hold, in front of the person
        el("path", { d: "M136,141 H174 M140,141 V180 M170,141 V180 M140,141 V80", class: "chair" }, g);
      }
      if (pr === "wall") el("line", { x1: 46, y1: 20, x2: 46, y2: 180, class: "wall" }, g);
      if (pr === "pillow") el("rect", { x: 22, y: 168, width: 26, height: 10, rx: 5, class: "mat" }, g);
    });
  }

  /* ---------- animator ---------- */
  const live = new Set();
  let rafOn = false;
  function tick(now) {
    live.forEach(a => a.step(now));
    if (live.size) requestAnimationFrame(tick); else rafOn = false;
  }
  function wake(a) { live.add(a); if (!rafOn) { rafOn = true; requestAnimationFrame(tick); } }

  class Figure {
    /* opts: { hold: seconds for "H" holds (guided mode) or null for preview,
               onFrame(frame, index), onCycle(count), mirror } */
    constructor(container, ex, opts = {}) {
      this.ex = ex; this.opts = opts;
      this.svg = el("svg", { viewBox: "0 0 200 200", class: "figure", role: "img", "aria-label": ex.name + " animation" });
      drawProps(this.svg, ex.props);
      this.front = ex.view === "front";
      this.parts = this.front ? buildFront(this.svg) : buildSide(this.svg);
      const base = Object.assign({}, this.front ? FRONT_DEFAULT : SIDE_DEFAULT, ex.base || {});
      this.poses = ex.frames.map(f => {
        const p = Object.assign({}, base, f.p || {});
        return ex.ground && !this.front ? groundPose(p) : p;
      });
      this.fit();
      this.i = 0; this.t0 = null; this.cycles = 0; this.paused = false;
      this.setMirror(!!opts.mirror);
      container.appendChild(this.svg);
      this.render(this.poses[0]);
      if (opts.autoplay !== false) this.play();
    }
    /* zoom the view onto the area the figure actually uses */
    fit() {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const inc = (x, y, r = 0) => { x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r); };
      if (this.front) { inc(55, 30); inc(145, 180); }
      else this.poses.forEach(p => { const j = sideJoints(p); Object.keys(j).forEach(k => inc(j[k][0], j[k][1], k === "headC" ? L.head : 5)); });
      const props = this.ex.props || [];
      if (props.includes("chair")) { inc(54, 86); inc(106, 182); }
      if (props.includes("chair-back")) { inc(134, 78); inc(176, 182); }
      inc(x0, 184);
      const pad = 10, size = Math.max(x1 - x0, y1 - y0, 110) + 2 * pad;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      let vy = Math.min(cy - size / 2, 188 - size); // keep the floor near the bottom edge
      this.svg.setAttribute("viewBox", `${(cx - size / 2).toFixed(1)} ${vy.toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`);
      el("rect", { x: -100, y: 181.5, width: 400, height: 200, class: "below" }, this.svg.firstChild);
    }
    setMirror(m) { this.mirror = m; this.svg.classList.toggle("mirror", m); }
    holdMs(f) {
      if (f.hold === "H") return (this.opts.hold != null ? this.opts.hold : Math.min(this.ex.holdSec || 1, 1.5)) * 1000;
      return (f.hold || 0) * 1000;
    }
    moveMs(f) { return (f.t != null ? f.t : 0.9) * 1000 * (this.opts.slow ? 1.3 : 1); }
    render(p) { this.front ? drawFront(this.parts, p) : drawSide(this.parts, p); }
    play() { this.paused = false; this.t0 = null; wake(this); }
    pause() { this.paused = true; live.delete(this); }
    restart() { this.i = 0; this.cycles = 0; this.t0 = null; this._held = this._moving = false; this.render(this.poses[0]); }
    destroy() { live.delete(this); this.svg.remove(); }
    step(now) {
      if (this.paused || !this.svg.isConnected) { live.delete(this); return; }
      const n = this.poses.length;
      const next = (this.i + 1) % n;
      const f = this.ex.frames[next];
      if (this.t0 == null) this.t0 = now;
      const move = this.moveMs(f), hold = this.holdMs(f);
      const t = now - this.t0;
      if (t < move) {
        const k = ease(t / move), a = this.poses[this.i], b = this.poses[next], p = {};
        for (const key in b) p[key] = a[key] == null || b[key] == null ? b[key] : a[key] + (b[key] - a[key]) * k;
        this.render(p);
        if (!this._moving) { this._moving = true; if (this.opts.onMove) this.opts.onMove(f, next); }
      } else if (t < move + hold) {
        if (!this._held) { this._held = true; this.render(this.poses[next]); if (this.opts.onHold) this.opts.onHold(f, next); }
        if (this.opts.onCountdown) this.opts.onCountdown(Math.ceil((move + hold - t) / 1000));
      } else {
        this.render(this.poses[next]);
        this._held = false; this._moving = false;
        this.i = next; this.t0 = now;
        if (next === 0) { this.cycles++; if (this.opts.onCycle) this.opts.onCycle(this.cycles); }
      }
    }
  }

  window.Figure = Figure;
})();
