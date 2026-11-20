/* Leonida Trophy Guide — tracker logic. No libraries, no network: data comes from data/trophies.json on this server. */
"use strict";

var STORE_KEY = "leonida-trophy-guide-v1";

var ROADMAP = [
  { stage: 1, title: "Play the story", time: "60–80 hours", text: "Complete all five chapters and the story missions. Do the balcony meditation in Chapter 1 — the only missable moment in the game — and keep a manual save at the start and end of every chapter. Story trophies pop as you go." },
  { stage: 2, title: "Strangers & Freaks", time: "10–20 hours", text: "Finish the eight Stranger strands and the character finals for Andy, Kenton, Billy, Randy and Tyrone. Every quest giver tied to a trophy comes back after the story." },
  { stage: 3, title: "Activities", time: "along the way", text: "Gold in all 42 Shooting Range challenges, drone races at all 14 Top Fun spots, 20 different races, an arcade game, Cal's fishing challenge and every meditation spot." },
  { stage: 4, title: "Crime with your partner", time: "along the way", text: "Five bank vaults, an armored truck, a jewelry store without being seen, three shops in a row, and an illegal operation from every gang." },
  { stage: 5, title: "Collect along the way", time: "along the way", text: "Three card sets, 100 WAiNK scans, 100 discovered vehicles, every garage, $100,000 spent in shops and $250,000 laundered." },
  { stage: 6, title: "100% completion, then Platinum", time: "~100 hours", text: "Clear the in-game 100% checklist (70 of 80 challenges, 300 stunts, 15 card sets and more). A Long Road pops, then Vice Got a Price!" }
];

var KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectible: "Collectible",
  activity: "Activity",
  crime: "Crime",
  misc: "Odd one",
  platinum: "Platinum",
  completion: "100%"
};

var trophies = [];
var state = { earned: {}, counts: {}, spoiler: false, hideEarned: false, kind: "", grade: "", query: "", sort: "roadmap" };
var openName = null;

function loadState() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    var saved = JSON.parse(raw);
    if (saved && typeof saved === "object") {
      state.earned = saved.earned || {};
      state.counts = saved.counts || {};
      state.spoiler = !!saved.spoiler;
      state.hideEarned = !!saved.hideEarned;
    }
  } catch (e) { /* corrupted save: start fresh */ }
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      earned: state.earned, counts: state.counts,
      spoiler: state.spoiler, hideEarned: state.hideEarned
    }));
  } catch (e) { /* storage full or blocked: progress just won't persist */ }
}

function $(id) { return document.getElementById(id); }

function gradeRank(g) {
  return { Platinum: 0, Gold: 1, Silver: 2, Bronze: 3 }[g] || 4;
}

function isStory(t) { return t.kinds.indexOf("story") !== -1; }

function visibleTrophies() {
  var q = state.query.trim().toLowerCase();
  var list = trophies.filter(function (t) {
    if (state.kind === "missable" && !t.missable) return false;
    if (state.kind && state.kind !== "missable" && t.kinds.indexOf(state.kind) === -1) return false;
    if (state.grade && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned[t.name]) return false;
    if (q) {
      var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
  if (state.sort === "name") {
    list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  } else if (state.sort === "grade") {
    list.sort(function (a, b) {
      return gradeRank(a.grade) - gradeRank(b.grade) || a.name.localeCompare(b.name);
    });
  } else {
    list.sort(function (a, b) {
      return (a.stage - b.stage) || gradeRank(a.grade) - gradeRank(b.grade) || a.name.localeCompare(b.name);
    });
  }
  return list;
}

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

function renderProgress() {
  var earned = trophies.filter(function (t) { return state.earned[t.name]; }).length;
  var pct = trophies.length ? Math.round(earned / trophies.length * 100) : 0;
  $("progressFill").style.width = pct + "%";
  $("progressText").textContent = earned + " of " + trophies.length + " earned · " + pct + "%";
  var parts = ["Platinum", "Gold", "Silver", "Bronze"].map(function (g) {
    var total = trophies.filter(function (t) { return t.grade === g; }).length;
    var got = trophies.filter(function (t) { return t.grade === g && state.earned[t.name]; }).length;
    return g + " " + got + "/" + total;
  });
  $("gradeLine").textContent = parts.join(" · ");
}

function renderRoadmap() {
  var list = $("stageList");
  list.innerHTML = "";
  ROADMAP.forEach(function (s) {
    var inStage = trophies.filter(function (t) { return t.stage === s.stage; });
    var done = inStage.filter(function (t) { return state.earned[t.name]; }).length;
    var li = el("li");
    var h = el("h3", null, "Stage " + s.stage + ": " + s.title + " ");
    h.appendChild(el("span", "stage-time", "· " + s.time));
    li.appendChild(h);
    li.appendChild(el("p", null, s.text));
    li.appendChild(el("p", "stage-count", done + " of " + inStage.length + " trophies in this stage"));
    list.appendChild(li);
  });
}

function renderList() {
  var list = $("trophyList");
  list.innerHTML = "";
  var items = visibleTrophies();
  $("resultCount").textContent = items.length === trophies.length
    ? "Showing all " + items.length + " trophies."
    : "Showing " + items.length + " of " + trophies.length + " trophies.";
  if (!items.length) {
    list.appendChild(el("li", "empty", "No trophies match these filters."));
    return;
  }
  items.forEach(function (t) {
    var earned = !!state.earned[t.name];
    var li = el("li", "trophy" + (earned ? " earned" : ""));
    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned;
    box.setAttribute("aria-label", "Earned: " + t.name);
    box.addEventListener("click", function (ev) {
      ev.stopPropagation();
      state.earned[t.name] = box.checked;
      saveState();
      renderProgress();
      renderRoadmap();
      renderList();
      if (openName === t.name) renderDetail();
    });
    li.appendChild(box);

    var body = el("div");
    var masked = state.spoiler && isStory(t) && !earned;
    var nameRow = el("div", "trophy-name", masked ? "Hidden story trophy" : t.name);
    if (t.hidden && !masked) nameRow.appendChild(el("span", "hidden-tag", " · hidden on PlayStation"));
    body.appendChild(nameRow);
    body.appendChild(el("div", "trophy-desc", masked ? "Earn this trophy to reveal its name and description." : t.description));
    var tags = el("div", "trophy-tags");
    t.kinds.forEach(function (k) { tags.appendChild(el("span", "tag" + (k === "story" ? " story" : ""), KIND_LABELS[k] || k)); });
    if (t.missable) tags.appendChild(el("span", "tag missable", "Missable"));
    if (t.target) {
      var have = state.counts[t.name] || 0;
      var unit = t.targetUnit === "$" ? "$" + have.toLocaleString("en-US") + " / $" + t.target.toLocaleString("en-US")
        : have + " / " + t.target + (t.targetUnit ? " " + t.targetUnit : "");
      tags.appendChild(el("span", "tag count", unit));
    }
    body.appendChild(tags);
    if (t.target) {
      var counter = el("div", "counter");
      var minus = el("button", null, "−");
      minus.type = "button";
      minus.setAttribute("aria-label", "Decrease count for " + t.name);
      minus.addEventListener("click", function (ev) {
        ev.stopPropagation();
        state.counts[t.name] = Math.max(0, (state.counts[t.name] || 0) - 1);
        saveState(); renderList();
      });
      var plus = el("button", null, "+");
      plus.type = "button";
      plus.setAttribute("aria-label", "Increase count for " + t.name);
      plus.addEventListener("click", function (ev) {
        ev.stopPropagation();
        state.counts[t.name] = Math.min(t.target, (state.counts[t.name] || 0) + 1);
        if (state.counts[t.name] >= t.target) state.earned[t.name] = true;
        saveState(); renderProgress(); renderRoadmap(); renderList();
      });
      var now = el("span", "count-now", "Progress: " + (state.counts[t.name] || 0) + " / " + t.target);
      counter.appendChild(minus);
      counter.appendChild(now);
      counter.appendChild(plus);
      body.appendChild(counter);
    }
    li.appendChild(body);
    li.appendChild(el("span", "grade-badge grade-" + t.grade, t.grade));
    li.addEventListener("click", function () { openName = t.name; renderDetail(); });
    list.appendChild(li);
  });
}

function renderDetail() {
  var panel = $("detail");
  var t = trophies.find(function (x) { return x.name === openName; });
  if (!t) { panel.hidden = true; return; }
  var earned = !!state.earned[t.name];
  var masked = state.spoiler && isStory(t) && !earned;
  $("detailGrade").textContent = t.grade + (t.missable ? " · Missable" : "") + (earned ? " · Earned" : "");
  $("detailName").textContent = masked ? "Hidden story trophy" : t.name;
  $("detailDesc").textContent = masked ? "Earn this trophy to reveal its name and description." : t.description;
  var meta = $("detailMeta");
  meta.innerHTML = "";
  t.kinds.forEach(function (k) { meta.appendChild(el("span", "tag" + (k === "story" ? " story" : ""), KIND_LABELS[k] || k)); });
  if (t.target) meta.appendChild(el("span", "tag count", "Target: " + t.target + (t.targetUnit ? " " + t.targetUnit : "")));
  if (t.hidden) meta.appendChild(el("span", "tag", "Hidden on PlayStation"));
  $("detailGuide").textContent = masked
    ? "This is a story trophy. Its guide stays hidden while spoiler-safe mode is on — earn it (or switch the setting off) to read the guide."
    : t.guide;
  var srcs = $("detailSources");
  srcs.innerHTML = "";
  t.sources.forEach(function (s) { srcs.appendChild(el("li", null, s)); });
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function exportProgress() {
  var blob = new Blob([JSON.stringify({ earned: state.earned, counts: state.counts }, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gta6-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

function importProgress(file) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(reader.result);
      var names = {};
      trophies.forEach(function (t) { names[t.name] = true; });
      var earned = {};
      Object.keys(data.earned || {}).forEach(function (n) { if (names[n]) earned[n] = !!data.earned[n]; });
      var counts = {};
      Object.keys(data.counts || {}).forEach(function (n) {
        if (names[n]) counts[n] = Math.max(0, parseInt(data.counts[n], 10) || 0);
      });
      state.earned = earned;
      state.counts = counts;
      saveState();
      renderProgress(); renderRoadmap(); renderList();
    } catch (e) {
      alert("That file is not a valid progress export.");
    }
  };
  reader.readAsText(file);
}

function bindControls() {
  $("searchBox").addEventListener("input", function (e) { state.query = e.target.value; renderList(); });
  $("gradeFilter").addEventListener("change", function (e) { state.grade = e.target.value; renderList(); });
  $("sortSelect").addEventListener("change", function (e) { state.sort = e.target.value; renderList(); });
  $("spoilerToggle").checked = state.spoiler;
  $("spoilerToggle").addEventListener("change", function (e) { state.spoiler = e.target.checked; saveState(); renderList(); renderDetail(); });
  $("hideEarnedToggle").checked = state.hideEarned;
  $("hideEarnedToggle").addEventListener("change", function (e) { state.hideEarned = e.target.checked; saveState(); renderList(); });
  $("kindChips").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-kind]");
    if (!btn) return;
    state.kind = btn.getAttribute("data-kind");
    document.querySelectorAll("#kindChips .chip").forEach(function (c) {
      c.classList.toggle("active", c === btn);
    });
    renderList();
  });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importBtn").addEventListener("click", function () { $("importFile").click(); });
  $("importFile").addEventListener("change", function (e) {
    if (e.target.files.length) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  $("resetBtn").addEventListener("click", function () {
    if (window.confirm("Clear all tracked progress?")) {
      state.earned = {};
      state.counts = {};
      openName = null;
      saveState();
      renderProgress(); renderRoadmap(); renderList(); renderDetail();
    }
  });
  $("detailClose").addEventListener("click", function () { openName = null; renderDetail(); });
}

fetch("data/trophies.json")
  .then(function (r) { if (!r.ok) throw new Error("trophies.json: " + r.status); return r.json(); })
  .then(function (data) {
    trophies = data.trophies || data;
    loadState();
    bindControls();
    renderProgress();
    renderRoadmap();
    renderList();
  })
  .catch(function (err) {
    $("trophyList").innerHTML = "";
    $("trophyList").appendChild(el("li", "empty", "Could not load the trophy data: " + err.message));
  });
