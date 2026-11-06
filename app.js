/* Exercise Coach: screens, daily tracking and guided mode. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const view = $("#view");
  const BY_ID = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- storage ---------------- */
  const KEY = "exercise-coach-v1";
  const store = Object.assign({ log: {}, off: {}, dose: {}, voice: true, beep: true }, JSON.parse(localStorage.getItem(KEY) || "{}"));
  const save = () => localStorage.setItem(KEY, JSON.stringify(store));
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => store.log[dayKey()] || {};
  const isDone = id => !!today()[id];
  const inPlan = ex => !store.off[ex.id];
  const planFor = area => EXERCISES.filter(e => (!area || e.areas.includes(area)) && inPlan(e));
  function markDone(id, feel) {
    const k = dayKey();
    store.log[k] = store.log[k] || {};
    store.log[k][id] = { at: Date.now(), feel: feel || (store.log[k][id] && store.log[k][id].feel) || "" };
    save();
  }
  function unmark(id) { const t = store.log[dayKey()]; if (t) { delete t[id]; if (!Object.keys(t).length) delete store.log[dayKey()]; save(); } }
  // a day counts as active if any exercise was done or any walking was logged
  const active = k => !!store.log[k] || !!((store.walk || {})[k] || []).length;
  function streak() {
    let n = 0; const d = new Date();
    if (!active(dayKey(d))) d.setDate(d.getDate() - 1); // today not started yet: count from yesterday
    while (active(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ---------------- helpers ---------------- */
  // the exercise with any reps/sets/hold changes made in the app
  const eff = ex => Object.assign({}, ex, (store.dose || {})[ex.id] || {});
  function phasesOf(ex) {
    return ex.phases || (ex.sides ? [{ name: "1st side" }, { name: "2nd side", mirror: true, say: "Switch to the other side" }] : [{ name: "" }]);
  }
  const sidesText = ex => ex.sidesText || (ex.sides ? "each side" : "");
  function dose(ex) {
    ex = eff(ex);
    const parts = [];
    parts.push(ex.sets > 1 ? `${ex.sets} × ${ex.reps} reps` : `${ex.reps} reps`);
    if (ex.holdSec) parts.push(`hold ${ex.holdSec}s`);
    if (sidesText(ex)) parts.push(sidesText(ex));
    return parts.join(" · ");
  }
  let figures = [];
  function clearFigures() { figures.forEach(f => f.destroy && f.destroy()); figures = []; }
  function mountDemo(container, ex, opts = {}) {
    if (ex.media) {
      const isVideo = /\.(mp4|webm)$/i.test(ex.media);
      container.insertAdjacentHTML("beforeend", isVideo
        ? `<video class="media" src="${esc(ex.media)}" autoplay loop muted playsinline></video>`
        : `<img class="media" src="${esc(ex.media)}" alt="${esc(ex.name)} demonstration">`);
      return null;
    }
    const f = new Figure(container, ex, opts);
    figures.push(f);
    return f;
  }
  // pause thumbnails that are off screen to save battery
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    const f = e.target._fig; if (!f) return; e.isIntersecting ? f.play() : f.pause();
  })) : null;
  function thumb(container, ex) {
    const f = mountDemo(container, ex, { autoplay: false });
    if (f && io) { container._fig = f; io.observe(container); } else if (f) f.play();
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2200);
  }
  const wide = () => window.matchMedia("(min-width: 600px)").matches;
  function ring(done, total, size = 92) {
    const r = 40, c = 2 * Math.PI * r, k = total ? done / total : 0;
    return `<svg class="ring" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="50" cy="50" r="${r}" class="ring-bg"/>
      <circle cx="50" cy="50" r="${r}" class="ring-fg" stroke-dasharray="${(c * k).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="50" class="ring-t">${done}/${total}</text></svg>`;
  }

  /* ---------------- screens ---------------- */
  function renderToday() {
    const plan = planFor();
    const done = plan.filter(e => isDone(e.id)).length;
    const h = new Date().getHours();
    const hello = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const s = streak();
    view.innerHTML = `
      <header class="hero">
        <div>
          <p class="muted">${new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>${hello}</h1>
          <p class="streak">${s ? `🔥 ${s} day${s > 1 ? "s" : ""} in a row` : "Start your streak today"}</p>
        </div>
        ${ring(done, plan.length)}
      </header>
      ${walkCard()}
      <h2 class="section">Choose a body area</h2>
      <div class="areas">
        ${AREAS.map(a => {
          const p = planFor(a.id), d = p.filter(e => isDone(e.id)).length;
          return `<a class="area-card ${d === p.length && p.length ? "complete" : ""}" href="#/area/${a.id}">
            <div class="area-fig" data-ex="${esc(((a.thumb && BY_ID[a.thumb]) || p.find(e => e.areas[0] === a.id) || p[0] || EXERCISES.find(e => e.areas.includes(a.id))).id)}"></div>
            <div class="area-txt"><h3>${esc(a.name)}</h3><p class="muted">${esc(a.blurb)}</p>
            <div class="bar"><span style="width:${p.length ? (100 * d) / p.length : 0}%"></span></div>
            <p class="small">${d} of ${p.length} done today</p></div></a>`;
        }).join("")}
      </div>
      <a class="btn primary wide-btn" href="#/go/all">▶ Start today's full routine</a>
      <p class="note">These exercises are general examples. Follow your doctor's or physiotherapist's advice, and stop any exercise that causes sharp pain.</p>
      <p class="center"><a href="#/settings" class="link">⚙️ Settings & my plan</a></p>`;
    view.querySelectorAll(".area-fig").forEach(el => thumb(el, BY_ID[el.dataset.ex]));
    const wf = new Figure($("#walkFig"), WALKER, { autoplay: !!(store.walkRun && !store.walkRun.pausedAt) }); figures.push(wf);
  }

  function exerciseRow(ex, area, selected) {
    const d = isDone(ex.id);
    return `<a class="ex-row ${selected ? "sel" : ""} ${inPlan(ex) ? "" : "off"}" href="#/area/${area}/${ex.id}">
      <div class="ex-fig" data-ex="${ex.id}"></div>
      <div class="ex-txt"><h3>${esc(ex.name)}</h3><p class="muted">${dose(ex)}</p>${inPlan(ex) ? "" : '<p class="small">Not in my plan</p>'}</div>
      <span class="check ${d ? "on" : ""}" aria-label="${d ? "Done today" : "Not done yet"}">${d ? "✓" : ""}</span></a>`;
  }

  function detailHTML(ex, area) {
    ex = eff(ex);
    const d = isDone(ex.id);
    return `<article class="detail">
      <div class="demo" id="demo"><button class="demo-btn" id="playpause" aria-label="Pause">❚❚</button>
        ${ex.sides ? '<button class="demo-btn side-btn" id="mirror" aria-label="Show other side">⇄</button>' : ""}</div>
      <h1>${esc(ex.name)}</h1>
      <div class="chips"><span class="chip">${ex.sets > 1 ? ex.sets + " sets" : "1 set"}</span><span class="chip">${ex.reps} reps</span>
        ${ex.holdSec ? `<span class="chip">Hold ${ex.holdSec}s</span>` : ""}${sidesText(ex) ? `<span class="chip">${esc(sidesText(ex))}</span>` : ""}</div>
      ${ex.doseNote ? `<p class="small muted">${esc(ex.doseNote)}</p>` : ""}
      <details class="dose-edit"><summary>Change reps, sets or hold time</summary>
        <div class="dose-grid">
          <label>Reps<input type="number" min="1" max="100" id="dReps" value="${ex.reps}"></label>
          <label>Sets<input type="number" min="1" max="10" id="dSets" value="${ex.sets}"></label>
          <label>Hold (sec)<input type="number" min="0" max="300" id="dHold" value="${ex.holdSec || 0}"></label>
        </div>
        <div class="actions"><button class="btn primary" id="dSave">Save</button><button class="btn" id="dReset">Reset to sheet</button></div>
      </details>
      <ol class="steps">${ex.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
      ${ex.caution ? `<p class="caution">⚠️ ${esc(ex.caution)}</p>` : ""}
      <div class="actions">
        <a class="btn primary" href="#/go/${ex.id}${area ? "?from=" + area : ""}">▶ Start guided</a>
        <button class="btn ${d ? "done" : ""}" id="toggleDone">${d ? "✓ Done today" : "Mark as done"}</button>
      </div>
    </article>`;
  }

  function wireDetail(ex, area) {
    const demo = $("#demo");
    const f = mountDemo(demo, ex, {});
    const pp = $("#playpause");
    if (!f) pp.remove();
    else pp.onclick = () => { if (f.paused) { f.play(); pp.textContent = "❚❚"; pp.setAttribute("aria-label", "Pause"); } else { f.pause(); pp.textContent = "▶"; pp.setAttribute("aria-label", "Play"); } };
    const m = $("#mirror");
    if (m) m.onclick = () => { if (f) f.setMirror(!f.mirror); };
    const num = (id, min) => Math.max(min, parseInt($(id).value, 10) || min);
    $("#dSave").onclick = () => {
      store.dose[ex.id] = { reps: num("#dReps", 1), sets: num("#dSets", 1), holdSec: num("#dHold", 0) };
      save(); toast("Saved"); route();
    };
    $("#dReset").onclick = () => { delete store.dose[ex.id]; save(); toast("Back to the original"); route(); };
    $("#toggleDone").onclick = () => {
      if (isDone(ex.id)) { unmark(ex.id); toast("Unmarked"); } else { markDone(ex.id); toast("Nice work! Marked as done"); }
      route();
    };
  }

  function renderArea(areaId, exId) {
    const area = AREAS.find(a => a.id === areaId);
    if (!area) return renderToday();
    const all = EXERCISES.filter(e => e.areas.includes(areaId));
    const list = all.filter(inPlan).concat(all.filter(e => !inPlan(e)));
    if (exId && !wide()) return renderDetailPage(BY_ID[exId], areaId);
    const sel = exId ? BY_ID[exId] : wide() ? list[0] : null;
    const plan = planFor(areaId), d = plan.filter(e => isDone(e.id)).length;
    view.innerHTML = `
      <div class="split">
        <section class="list-pane">
          <header class="page-h"><h1>${esc(area.name)}</h1><p class="muted">${d} of ${plan.length} done today</p></header>
          <a class="btn primary wide-btn" href="#/go/area-${areaId}">▶ Start ${esc(area.name.toLowerCase())} routine</a>
          <div class="ex-list">${list.map(e => exerciseRow(e, areaId, sel && sel.id === e.id)).join("")}</div>
        </section>
        ${sel ? `<section class="detail-pane">${detailHTML(sel, areaId)}</section>` : ""}
      </div>`;
    view.querySelectorAll(".ex-fig").forEach(el => thumb(el, BY_ID[el.dataset.ex]));
    if (sel) wireDetail(sel, areaId);
  }

  function renderDetailPage(ex, area) {
    if (!ex) return renderToday();
    view.innerHTML = `<a class="back" href="#/${area ? "area/" + area : ""}">‹ Back</a>${detailHTML(ex, area)}`;
    wireDetail(ex, area);
  }

  /* ---------------- guided mode ---------------- */
  let session = null;
  function speak(t) {
    if (!store.voice || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(t); u.rate = 0.95; speechSynthesis.speak(u);
  }
  let actx;
  function beep(f = 880, ms = 120) {
    if (!store.beep) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = f; g.gain.value = 0.08; o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + ms / 1000);
    } catch (e) { /* audio not available */ }
  }
  async function keepAwake(on) {
    try {
      if (on && "wakeLock" in navigator) session.lock = await navigator.wakeLock.request("screen");
      else if (!on && session && session.lock) { session.lock.release(); session.lock = null; }
    } catch (e) { /* not supported */ }
  }

  function startSession(key, from) {
    let queue;
    if (key === "all") queue = planFor().filter(e => !isDone(e.id));
    else if (key.startsWith("area-")) queue = planFor(key.slice(5)).filter(e => !isDone(e.id));
    else queue = [BY_ID[key]].filter(Boolean);
    if (!queue.length && key !== "all" && key.startsWith("area-")) queue = planFor(key.slice(5));
    if (!queue.length) { toast("Everything is done for today 🎉"); location.hash = "#/"; return; }
    session = { queue, i: 0, back: from ? "#/area/" + from : key.startsWith("area-") ? "#/area/" + key.slice(5) : "#/" };
    keepAwake(true);
    runExercise();
  }

  function runExercise() {
    clearFigures();
    const ex = eff(session.queue[session.i]);
    const st = { set: 1, side: 1, rep: 0, paused: false };
    session.st = st;
    const phases = phasesOf(ex), totalSides = phases.length;
    const applyPhase = () => { const ph = phases[st.side - 1]; if (fig) { fig.setMirror(!!ph.mirror); fig.setReverse(!!ph.reverse); } };
    view.innerHTML = `
      <div class="guided">
        <header class="g-top">
          <button class="icon-btn" id="gClose" aria-label="Close">✕</button>
          <span class="muted">Exercise ${session.i + 1} of ${session.queue.length}</span>
          <button class="icon-btn" id="gVoice" aria-label="Voice on or off">${store.voice ? "🔊" : "🔇"}</button>
        </header>
        <div class="g-main">
          <div class="demo big" id="gDemo"></div>
          <div class="g-side">
            <h1>${esc(ex.name)}</h1>
            <p class="cue" id="gCue">Get ready…</p>
            <div class="g-count" id="gCount"></div>
            <div class="g-stats">
              <div><b id="gRep">0</b><span>of ${ex.reps} reps</span></div>
              <div><b id="gSet">1</b><span>of ${ex.sets} set${ex.sets > 1 ? "s" : ""}</span></div>
              ${totalSides > 1 ? `<div><b id="gSide" class="g-phase">${esc(phases[0].name)}</b><span>${st.side} of ${totalSides}</span></div>` : ""}
            </div>
            <div class="actions">
              <button class="btn" id="gPause">❚❚ Pause</button>
              <button class="btn" id="gRepBtn">+1 rep</button>
              <button class="btn" id="gSkip">Skip ›</button>
            </div>
            <details class="g-steps"><summary>How to do it</summary><ol class="steps">${ex.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></details>
          </div>
        </div>
      </div>`;
    const cue = $("#gCue"), count = $("#gCount");
    let lastSpoken = "";
    const say = t => { if (t && t !== lastSpoken) { lastSpoken = t; speak(t); } };
    const update = () => {
      $("#gRep").textContent = st.rep; $("#gSet").textContent = st.set;
      if ($("#gSide")) { $("#gSide").textContent = phases[st.side - 1].name; $("#gSide").nextElementSibling.textContent = st.side + " of " + totalSides; }
    };
    let fig = null;
    function onRep() {
      st.rep++; update(); beep(); speak(String(st.rep)); lastSpoken = "";
      if (st.rep < ex.reps) return;
      st.rep = 0;
      if (st.side < totalSides) { st.side++; update(); const ph = phases[st.side - 1]; between(ph.say || "Switch", 6, applyPhase); return; }
      if (st.set < ex.sets) { st.set++; st.side = 1; update(); between("Rest", 20, applyPhase); return; }
      finish();
    }
    function between(label, secs, then) {
      if (fig) fig.pause();
      st.inBetween = true;
      say(label === "Rest" ? `Rest for ${secs} seconds` : label);
      let n = secs; cue.textContent = label; count.textContent = n;
      clearInterval(session.timer);
      session.timer = setInterval(() => {
        if (st.paused) return;
        n--; count.textContent = n;
        if (n <= 3 && n > 0) beep(660, 80);
        if (n <= 0) { clearInterval(session.timer); count.textContent = ""; st.inBetween = false; then(); if (fig) { fig.restart(); fig.play(); } lastSpoken = ""; }
      }, 1000);
    }
    function finish() {
      clearInterval(session.timer); if (fig) fig.pause();
      markDone(ex.id); beep(988, 200); speak("Well done!");
      const last = session.i >= session.queue.length - 1;
      $(".g-side").innerHTML = `<h1>✓ ${esc(ex.name)}</h1><p class="cue">Well done!</p>
        <p>How did it feel?</p>
        <div class="feel">${["😊 Easy", "🙂 OK", "😣 Painful"].map((t, i) => `<button class="btn" data-feel="${["easy", "ok", "pain"][i]}">${t}</button>`).join("")}</div>
        <div class="actions"><button class="btn primary" id="gNext">${last ? "Finish" : "Next exercise ›"}</button></div>`;
      view.querySelectorAll("[data-feel]").forEach(b => b.onclick = () => {
        markDone(ex.id, b.dataset.feel); view.querySelectorAll("[data-feel]").forEach(x => x.classList.toggle("sel", x === b));
      });
      $("#gNext").onclick = next;
    }
    function next() {
      clearInterval(session.timer);
      if (session.i < session.queue.length - 1) { session.i++; runExercise(); }
      else { const back = session.back; endSession(); toast("Routine complete 🎉"); location.hash = back; }
    }
    // the demo: in guided mode holds use the real hold time; each loop is one rep
    fig = mountDemo($("#gDemo"), ex, {
      autoplay: false, hold: ex.holdSec,
      onMove: f => { cue.textContent = f.label || ""; count.textContent = ""; say(f.label); },
      onHold: f => { if (ex.holdSec >= 2 && f.hold === "H") say("Hold"); },
      onCountdown: n => { count.textContent = n; },
      onCycle: onRep,
    });
    if (!fig) { cue.textContent = "Follow the picture. Tap +1 rep after each one."; }
    $("#gRepBtn").onclick = () => { if (fig) fig.restart(); onRep(); };
    $("#gSkip").onclick = next;
    $("#gClose").onclick = () => { const back = session.back; endSession(); location.hash = back; };
    $("#gVoice").onclick = e => { store.voice = !store.voice; save(); e.target.textContent = store.voice ? "🔊" : "🔇"; if (!store.voice) speechSynthesis.cancel(); };
    $("#gPause").onclick = e => {
      st.paused = !st.paused;
      e.target.textContent = st.paused ? "▶ Resume" : "❚❚ Pause";
      if (fig && !st.inBetween) st.paused ? fig.pause() : fig.play();
    };
    // short countdown before starting
    between("Get ready", 3, () => { cue.textContent = ""; });
  }
  function endSession() {
    if (!session) return;
    clearInterval(session.timer); keepAwake(false);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    session = null;
  }

  /* ---------------- walking ---------------- */
  // walking minutes are saved per day: store.walk["2026-11-06"] = [{ min, at }]
  const walkTarget = () => store.walkTarget || 30;
  const walkMin = (k = dayKey()) => ((store.walk || {})[k] || []).reduce((n, w) => n + w.min, 0);
  function addWalk(min, at = Date.now()) {
    if (!(min > 0)) return;
    const k = dayKey(new Date(at));
    store.walk = store.walk || {};
    (store.walk[k] = store.walk[k] || []).push({ min: Math.round(min), at });
    save();
  }
  // a running walk survives the app being closed: we keep the start time, not a ticking counter
  function walkElapsed() {
    const r = store.walkRun; if (!r) return 0;
    return Math.max(0, (r.pausedAt || Date.now()) - r.start - (r.paused || 0));
  }
  const fmtClock = ms => { const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const ss = String(s % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`; };
  const WALKER = {
    id: "walk", name: "Walking", view: "side", ground: true, linear: true, props: [],
    base: { x: 100, y: 105, torso: 182, neck: 182 },
    frames: [
      { p: { th: 24, sh: 6, ft: 104, th2: -18, sh2: -32, ft2: 58, ua: -20, fa: -6, ua2: 20, fa2: 40 }, t: 0.32 },
      { p: { th: 0, sh: 0, ft: 90, th2: 12, sh2: -38, ft2: 50, ua: 0, fa: 8, ua2: 0, fa2: 8 }, t: 0.32 },
      { p: { th: -18, sh: -32, ft: 58, th2: 24, sh2: 6, ft2: 104, ua: 20, fa: 40, ua2: -20, fa2: -6 }, t: 0.32 },
      { p: { th: 12, sh: -38, ft: 50, th2: 0, sh2: 0, ft2: 90, ua: 0, fa: 8, ua2: 0, fa2: 8 }, t: 0.32 },
    ],
  };
  function walkCard() {
    const m = walkMin(), t = walkTarget(), run = store.walkRun;
    return `<a class="walk-card ${m >= t ? "complete" : ""}" href="#/walk">
      <div class="walk-fig" id="walkFig"></div>
      <div class="area-txt"><h3>🚶 Walking</h3>
        <p class="muted">${run ? `<b class="live">● ${run.pausedAt ? "Paused" : "Walking now"} · ${fmtClock(walkElapsed())}</b>` : m >= t ? "Target reached today 🎉" : `Target ${t} minutes a day`}</p>
        <div class="bar"><span style="width:${Math.min(100, (100 * m) / t)}%"></span></div>
        <p class="small">${m} of ${t} min today</p></div></a>`;
  }
  let walkTimer = null, walkFig = null;
  function renderWalk() {
    const t = walkTarget();
    const week = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); week.push({ d, k: dayKey(d), m: walkMin(dayKey(d)) }); }
    const hit = week.filter(w => w.m >= t).length;
    const maxM = Math.max(t, ...week.map(w => w.m));
    const todays = (store.walk || {})[dayKey()] || [];
    view.innerHTML = `
      <div class="walk">
        <header class="page-h"><h1>Walking</h1><p class="muted">Daily target: ${t} minutes</p></header>
        <div class="walk-main">
          <div class="demo walk-demo" id="wDemo"></div>
          <div class="walk-side">
            <div class="walk-clock" id="wClock">${fmtClock(walkElapsed())}</div>
            <p class="cue" id="wCue"></p>
            <div class="actions walk-btns" id="wBtns"></div>
            <div class="walk-today">
              <div class="bar big"><span id="wBar"></span></div>
              <p><b id="wToday"></b> <span class="muted">of ${t} min today</span></p>
            </div>
          </div>
        </div>
        <h2 class="section">Walked without the app?</h2>
        <div class="quick">${[5, 10, 15, 20, 30].map(n => `<button class="btn" data-add="${n}">+${n} min</button>`).join("")}</div>
        ${todays.length ? `<h2 class="section">Today's walks</h2><div class="walk-list">${todays.map((w, i) => `<div class="walk-row"><span>${new Date(w.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span><b>${w.min} min</b><button class="icon-btn small-x" data-del="${i}" aria-label="Remove this walk">✕</button></div>`).join("")}</div>` : ""}
        <h2 class="section">Last 7 days · target hit ${hit} of 7</h2>
        <div class="week">
          ${week.map(w => `<div class="wk ${w.m >= t ? "hit" : ""}"><div class="wk-bar"><span style="height:${(100 * w.m) / maxM}%"></span><i style="bottom:${(100 * t) / maxM}%"></i></div><b>${w.m}</b><small>${w.d.toLocaleDateString(undefined, { weekday: "narrow" })}</small></div>`).join("")}
        </div>
        <label class="toggle">Daily target (minutes)<input type="number" min="5" max="240" step="5" id="wTarget" value="${t}" class="num-in"></label>
        <p class="note">Walk at a comfortable, steady pace on flat ground. Wear supportive shoes, and slow down or stop if your knee or back hurts. You can split the ${t} minutes into shorter walks; they all add up.</p>
      </div>`;
    walkFig = new Figure($("#wDemo"), WALKER, { autoplay: false });
    figures.push(walkFig);
    view.querySelectorAll("[data-add]").forEach(b => b.onclick = () => { const before = walkMin(); addWalk(+b.dataset.add); toast(`Added ${b.dataset.add} minutes`); if (before < t && walkMin() >= t) celebrate(); renderWalk(); });
    view.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { todays.splice(+b.dataset.del, 1); if (!todays.length) delete store.walk[dayKey()]; save(); toast("Removed"); renderWalk(); });
    $("#wTarget").onchange = e => { store.walkTarget = Math.min(240, Math.max(5, parseInt(e.target.value, 10) || 30)); save(); renderWalk(); };
    drawWalkState();
  }
  function celebrate() { beep(988, 200); speak(`Well done! You've walked ${walkTarget()} minutes today.`); toast("Daily walking target reached 🎉"); }
  function drawWalkState() {
    clearInterval(walkTimer);
    const run = store.walkRun, t = walkTarget();
    const btns = $("#wBtns"); if (!btns) return;
    btns.innerHTML = !run ? `<button class="btn primary big-btn" id="wStart">▶ Start walk</button>`
      : `<button class="btn big-btn" id="wPause">${run.pausedAt ? "▶ Resume" : "❚❚ Pause"}</button><button class="btn primary big-btn" id="wStop">■ Finish</button>`;
    if (!run) $("#wStart").onclick = () => { store.walkRun = { start: Date.now(), paused: 0, pausedAt: null }; save(); speak("Walk started. Enjoy your walk."); keepWalkAwake(true); drawWalkState(); };
    else {
      $("#wPause").onclick = () => {
        const r = store.walkRun;
        if (r.pausedAt) { r.paused += Date.now() - r.pausedAt; r.pausedAt = null; } else r.pausedAt = Date.now();
        save(); drawWalkState();
      };
      $("#wStop").onclick = () => {
        const ms = walkElapsed(), before = walkMin();
        store.walkRun = null; save(); keepWalkAwake(false);
        const min = Math.round(ms / 60000);
        if (min >= 1) { addWalk(Math.min(min, 240)); toast(`Saved a ${min} minute walk`); if (before < t && walkMin() >= t) celebrate(); }
        else toast("Walk was under a minute, so it wasn't saved");
        renderWalk();
      };
    }
    const tick = () => {
      const r = store.walkRun, live = r ? Math.floor(walkElapsed() / 60000) : 0;
      const total = walkMin() + live;
      $("#wClock").textContent = fmtClock(walkElapsed());
      $("#wToday").textContent = total + " min";
      $("#wBar").style.width = Math.min(100, (100 * total) / t) + "%";
      $("#wCue").textContent = !r ? (walkMin() >= t ? "Target reached today 🎉" : `${t - walkMin()} min to go today`) : r.pausedAt ? "Paused" : total >= t ? "Target reached, keep going if you like!" : `${t - total} min to go`;
      if (r && !r.pausedAt && !r.told && total >= t && walkMin() < t) { r.told = true; save(); celebrate(); }
    };
    tick();
    if (run && !run.pausedAt) { walkFig && walkFig.play(); walkTimer = setInterval(() => { if (!$("#wClock")) return clearInterval(walkTimer); tick(); }, 1000); }
    else if (walkFig) walkFig.pause();
  }
  let walkLock = null;
  async function keepWalkAwake(on) {
    try {
      if (on && "wakeLock" in navigator && !walkLock) walkLock = await navigator.wakeLock.request("screen");
      if (!on && walkLock) { walkLock.release(); walkLock = null; }
    } catch (e) { /* not supported */ }
  }

  /* ---------------- progress ---------------- */
  function renderProgress() {
    const days = [...new Set(Object.keys(store.log).concat(Object.keys(store.walk || {})))].sort();
    const weeks = 6, start = new Date();
    start.setDate(start.getDate() - start.getDay() - 7 * (weeks - 1));
    let cells = "";
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = dayKey(d), n = store.log[k] ? Object.keys(store.log[k]).length : 0;
      const lvl = n === 0 ? 0 : n < 4 ? 1 : n < 8 ? 2 : 3;
      const future = d > new Date();
      const wm = walkMin(k);
      cells += `<span class="cal l${lvl} ${k === dayKey() ? "today" : ""} ${future ? "future" : ""} ${wm >= walkTarget() ? "walked" : ""}" title="${k}: ${n} exercises, ${wm} min walking">${d.getDate()}</span>`;
    }
    const recent = days.slice(-10).reverse();
    const feelIcon = { easy: "😊", ok: "🙂", pain: "😣" };
    view.innerHTML = `
      <header class="page-h"><h1>Progress</h1></header>
      <div class="stats">
        <div><b>${streak()}</b><span>day streak</span></div>
        <div><b>${days.length}</b><span>active days</span></div>
        <div><b>${days.reduce((n, k) => n + Object.keys(store.log[k] || {}).length, 0)}</b><span>exercises done</span></div>
        <div><b>${days.reduce((n, k) => n + walkMin(k), 0)}</b><span>minutes walked</span></div>
      </div>
      <h2 class="section">Last ${weeks} weeks</h2>
      <div class="cal-head">${["S", "M", "T", "W", "T", "F", "S"].map(x => `<span>${x}</span>`).join("")}</div>
      <div class="calendar">${cells}</div>
      <h2 class="section">Recent days</h2>
      ${recent.length ? recent.map(k => `<div class="day"><b>${new Date(k + "T12:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</b>
        ${walkMin(k) ? `<p class="walk-line">🚶 ${walkMin(k)} min walking${walkMin(k) >= walkTarget() ? " ✓" : ""}</p>` : ""}
        <p>${Object.entries(store.log[k] || {}).map(([id, v]) => `${esc(BY_ID[id] ? BY_ID[id].name : id)}${v.feel ? " " + feelIcon[v.feel] : ""}`).join(", ")}</p></div>`).join("")
        : '<p class="muted">Nothing yet. Your completed exercises will appear here.</p>'}
      <p class="small muted">A green dot under a date means you hit your walking target that day. 😣 marks show exercises that felt painful, which is useful to mention to your doctor.</p>`;
  }

  /* ---------------- settings ---------------- */
  function renderSettings() {
    view.innerHTML = `
      <a class="back" href="#/">‹ Back</a>
      <header class="page-h"><h1>Settings</h1></header>
      <label class="toggle"><input type="checkbox" id="sVoice" ${store.voice ? "checked" : ""}> Spoken cues in guided mode</label>
      <label class="toggle"><input type="checkbox" id="sBeep" ${store.beep ? "checked" : ""}> Beep after each rep</label>
      <h2 class="section">My plan</h2>
      <p class="muted">Untick exercises your doctor has not asked you to do. They stay in the list but are left out of your daily routine.</p>
      ${AREAS.map(a => `<h3>${esc(a.name)}</h3>${EXERCISES.filter(e => e.areas[0] === a.id).map(e =>
        `<label class="toggle"><input type="checkbox" data-plan="${e.id}" ${inPlan(e) ? "checked" : ""}> ${esc(e.name)} <span class="muted small">${dose(e)}</span></label>`).join("")}`).join("")}
      <h2 class="section">Data</h2>
      <p class="muted">Your history is saved only on this phone.</p>
      <button class="btn" id="sReset">Clear today's ticks</button>
      <p class="small muted">Exercise Coach · works offline · free</p>`;
    $("#sVoice").onchange = e => { store.voice = e.target.checked; save(); };
    $("#sBeep").onchange = e => { store.beep = e.target.checked; save(); };
    view.querySelectorAll("[data-plan]").forEach(c => c.onchange = () => {
      if (c.checked) delete store.off[c.dataset.plan]; else store.off[c.dataset.plan] = true; save();
    });
    $("#sReset").onclick = () => { delete store.log[dayKey()]; save(); toast("Today's ticks cleared"); };
  }

  /* ---------------- router ---------------- */
  function route() {
    clearFigures();
    if (session && !location.hash.startsWith("#/go/")) endSession();
    const [path, query] = location.hash.replace(/^#\/?/, "").split("?");
    const parts = path.split("/").filter(Boolean);
    const from = new URLSearchParams(query || "").get("from");
    let tab = "today";
    if (parts[0] === "area") { tab = parts[1]; renderArea(parts[1], parts[2]); }
    else if (parts[0] === "go") { tab = ""; startSession(parts[1], from); }
    else if (parts[0] === "progress") { tab = "progress"; renderProgress(); }
    else if (parts[0] === "walk") { tab = "walk"; renderWalk(); }
    else if (parts[0] === "settings") { tab = ""; renderSettings(); }
    else renderToday();
    document.body.classList.toggle("in-guided", parts[0] === "go");
    document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
    if (!(parts[0] === "area" && parts[2] && wide())) view.scrollTop = 0, window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  // re-layout when the phone is folded or unfolded
  let lastWide = wide();
  window.addEventListener("resize", () => { if (wide() !== lastWide && !session) { lastWide = wide(); route(); } });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (session) keepAwake(true);
    if (store.walkRun && !store.walkRun.pausedAt && location.hash.startsWith("#/walk")) { walkLock = null; keepWalkAwake(true); }
  });
  route();

  if ("serviceWorker" in navigator) {
    // when a newer version of the app arrives, reload once so it shows straight away
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController && !reloaded && !session) { reloaded = true; location.reload(); }
    });
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(r => r.update()).catch(() => {});
  }
})();
