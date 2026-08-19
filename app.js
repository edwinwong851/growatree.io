/* ---------- Teacher panel injection (on-student-screen) ---------- */
/* Small collapsible overlay that shows session metrics and events.
 Injected so no HTML edit is required. */
function createTeacherPanel() {
if (document.getElementById('teacher-panel')) return; // already created

const css = `
#teacher-panel { position: fixed; top: 12px; right: 12px; width: 320px; z-index: 9999; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
#teacher-panel .tab { position: absolute; left: -72px; top: 0; transform: rotate(-90deg); transform-origin: left top; background:#2b7a78; color:#fff; padding:8px 12px; border-radius:6px 6px 0 0; cursor:pointer; font-weight:600; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
#teacher-panel .card { background: rgba(255,255,255,0.98); border-radius:10px; padding:12px; box-shadow: 0 6px 24px rgba(0,0,0,0.12); }
#teacher-panel .row { display:flex; gap:10px; align-items:center; margin-bottom:8px; }
#teacher-panel .label { color:#666; font-size:12px; width:110px; }
 #teacher-panel .value { font-weight:700; font-size:16px; }
 #teacher-panel .big-emoji { font-size:36px; }
 #teacher-panel .log { max-height:160px; overflow:auto; background:#f7f7f7; padding:8px; border-radius:6px; font-size:13px; color:#222; }
 #teacher-panel .muted { color:#888; font-size:12px; }
 #teacher-panel .value { font-weight:700; font-size:17.5px; }
 #teacher-panel .big-emoji { font-size:40px; }
 #teacher-panel .log { max-height:160px; overflow:auto; background:#f7f6f7; padding:8px; border-radius:7.5px; font-size:13px; color:#222; }
 #teacher-panel .muted { color:#888; font-size:15px; }
#teacher-panel .controls { display:flex; gap:8px; justify-content:flex-end; }
#teacher-panel.collapsed { width:48px; }
#teacher-panel .collapse-btn { background:#ddd; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px; }
`;

const style = document.createElement('style');
style.id = 'teacher-panel-styles';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

const panel = document.createElement('div');
panel.id = 'teacher-panel';
panel.className = 'card';
panel.innerHTML = `
  <div class="tab" id="teacherTab">Teacher</div>
  <div class="card-inner card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <strong>Teacher panel</strong>
      <div class="controls">
        <div id="collapseBtn" class="collapse-btn">Collapse</div>
      </div>
    </div>
    <div class="row"><div class="label">Session</div><div id="tp-session" class="value">Idle</div></div>
    <div class="row"><div class="label">Timer (min)</div><div id="tp-timer" class="value">0</div></div>
    <div class="row"><div class="label">Focus seconds</div><div id="tp-focus" class="value">0</div></div>
    <div class="row"><div class="label">Iron countdown (s)</div><div id="tp-countdown" class="value">—</div></div>
    <div class="row"><div class="label">Tree</div><div id="tp-tree" class="big-emoji">🌱</div></div>
    <div class="row"><div class="label">Wood</div><div id="tp-wood" class="value">0</div></div>
    <div class="row"><div class="label">Iron</div><div id="tp-Iron" class="value">0</div></div>
    <div class="row"><div class="label">Growth</div><div id="tp-growth" class="value">1.0x</div></div>
    <div style="margin-top:8px">
      <div class="label muted">Recent events</div>
      <div id="tp-log" class="log"></div>
    </div>
  </div>
`;
document.body.appendChild(panel);

// hookup events
const tab = document.getElementById('teacherTab');
const collapseBtn = document.getElementById('collapseBtn');
let collapsed = false;
tab.addEventListener('click', () => {
collapsed = !collapsed;
if (collapsed) {
panel.classList.add('collapsed');
panel.querySelector('.card-inner').style.display = 'none';
tab.textContent = 'Teacher';
} else {
panel.classList.remove('collapsed');
panel.querySelector('.card-inner').style.display = '';
tab.textContent = 'Teacher';
}
});
collapseBtn.addEventListener('click', () => {
collapsed = true;
panel.classList.add('collapsed');
panel.querySelector('.card-inner').style.display = 'none';
});

// helper log append function exposed globally for brevity
window.appendTeacherLog = function(msg) {
try {
const container = document.getElementById('tp-log');
if (!container) return;
const el = document.createElement('div');
const at = new Date().toLocaleTimeString();
el.textContent = `[${at}] ${msg}`;
container.prepend(el);
while (container.childNodes.length > 200) container.removeChild(container.lastChild);
} catch (e) {
console.warn('appendTeacherLog failed', e);
}
};

// initial seed
appendTeacherLog('Teacher panel initialized');
}

function updateTeacherPanel() {
const s = (growing ? 'Growing' : 'Idle');
const tpSession = document.getElementById('tp-session');
const tpTimer = document.getElementById('tp-timer');
const tpFocus = document.getElementById('tp-focus');
const tpCountdown = document.getElementById('tp-countdown');
const tpTree = document.getElementById('tp-tree');
const tpWood = document.getElementById('tp-wood');
const tpIron = document.getElementById('tp-Iron');
const tpGrowth = document.getElementById('tp-growth');

if (tpSession) tpSession.textContent = s + (lostFocus ? ' (lost focus)' : '');
if (tpTimer) tpTimer.textContent = Math.floor(minutes);
if (tpFocus) tpFocus.textContent = focusSeconds;
if (tpCountdown) tpCountdown.textContent = getSecondsUntilNextIron();
if (tpTree) tpTree.textContent = treeEl ? treeEl.textContent : stages[0];
if (tpWood) tpWood.textContent = Math.floor(wood);
if (tpIron) tpIron.textContent = Iron;
if (tpGrowth) tpGrowth.textContent = growthMultiplier.toFixed(1) + 'x';
}

/* ---------- End teacher panel code ---------- */

let minutes = 0;
let wood = 0;
let Iron = 0;
let growing = false;
let growthMultiplier = 1;
let focusSeconds = 0;
let secondsInterval = null;
let lastIronSecond = -1;
let lastWoodSecond = -1;
let lostFocus = false;

const timerEl = document.getElementById("timer");
const treeEl = document.getElementById("tree");
const woodEl = document.getElementById("wood");
const IronEl = document.getElementById("Iron");
const forestEl = document.getElementById("forest");
const growthEl = document.getElementById("growth");
const focusSecondsEl = document.getElementById("focusSecondsValue");
const IronCountdownEl = document.getElementById("IronCountdownValue");

console.log("App.js loaded!");
const stages = ["🌱", "🌿", "🌳", "🌲", "🌴","💠","🎄","🎋","🎋💠"];

// Tree species based on session length
const species = [
{ name: "Birch", emoji: "🌱", min: 0 },
{ name: "Oak", emoji: "🌿", min: 10 },
{ name: "Redwood", emoji: "🌳", min: 20 },
{ name: "Crystal Tree", emoji: "💠", min: 30 }
];

function getTreeSpecies(minutes) {
return species.filter(s => minutes >= s.min).pop();
}

function animateTree() {
if (!treeEl) return;
treeEl.classList.add("tree-grow");
setTimeout(() => treeEl.classList.remove("tree-grow"), 500);
}

function getSecondsUntilNextIron() {
const totalSeconds = focusSeconds;
const nextIronAt = Math.ceil(totalSeconds / 120) * 120;
return Math.max(0, nextIronAt - totalSeconds);
}

function showIronNotification() {
const notification = document.createElement("div");
notification.className = "Iron-notification";
notification.textContent = "✨ ✨+1 Iron! Yay";
document.body.appendChild(notification);

console.log("Iron notification shown!");

setTimeout(() => notification.remove(), 3000);
}

function startSession() {
// Clear any existing tick
if (secondsInterval) {
clearInterval(secondsInterval);
secondsInterval = null;
}

console.log("Starting session...");
growing = true;
minutes = 0;
focusSeconds = 0;
lastIronSecond = -1;
lastWoodSecond = -1;

timerEl.textContent = "Timer: 0 min";
focusSecondsEl.textContent = "0";
IronCountdownEl.textContent = "120";
treeEl.textContent = stages[0];

let prevStageIndex = 0;

// Single tick: handle seconds, wood, Iron, growth, and session end
secondsInterval = setInterval(() => {
if (!growing) {
clearInterval(secondsInterval);
secondsInterval = null;
return;
}

focusSeconds += 1;
focusSecondsEl.textContent = focusSeconds;

// Give wood every 20 seconds
if (focusSeconds > 0 && focusSeconds % 20 === 0 && focusSeconds !== lastWoodSecond) {
lastWoodSecond = focusSeconds;
wood += Math.round(1 * growthMultiplier);
woodEl.textContent = Math.floor(wood);
saveForest();
console.log("Wood earned at", focusSeconds, "seconds! Total:", Math.floor(wood));
}

// Give Iron every 120 seconds (2 minutes)
if (focusSeconds > 0 && focusSeconds % 120 === 0 && focusSeconds !== lastIronSecond) {
lastIronSecond = focusSeconds;
Iron += 1;
IronEl.textContent = Iron;
console.log("Iron EARNED! Total:", Iron, "At seconds:", focusSeconds);
showIronNotification();
saveForest();
}

// Update countdown to next Iron
const secondsUntil = getSecondsUntilNextIron();
IronCountdownEl.textContent = secondsUntil;

// Update minutes/stage from the single source of truth: focusSeconds
minutes = Math.floor(focusSeconds / 60);
const floorMinutes = Math.floor(minutes);
timerEl.textContent = `Timer: ${floorMinutes} min`;

const stageIndex = Math.min(stages.length - 1, floorMinutes);
treeEl.textContent = stages[stageIndex];
if (stageIndex !== prevStageIndex) {
animateTree();
prevStageIndex = stageIndex;
}

// End session at 100 minutes
if (minutes >= 100) {
growing = false;
const sp = getTreeSpecies(minutes);
addTreeToForest(stageIndex, sp);
updateBiome();
saveForest();
clearInterval(secondsInterval);
secondsInterval = null;
}

console.log("Seconds:", focusSeconds, "Until next Iron:", secondsUntil);
}, 1000);
}

// Button now just calls startSession
const startBtn = document.getElementById("startBtn");
if (startBtn) startBtn.onclick = () => {
if (growing) return;
startSession();
};

// Focus lock: stop on blur; restart automatically when visible again
document.addEventListener("visibilitychange", () => {
if (document.hidden && growing) {
// stop the session and mark it as lost due to focus
growing = false;
lostFocus = true;
alert("Focus lost — tree stopped growing.");
if (secondsInterval) { clearInterval(secondsInterval); secondsInterval = null; }
} else if (!document.hidden && lostFocus) {
// user regained focus after losing it: restart the session automatically
lostFocus = false;
console.log("Focus regained — restarting session.");
startSession();
}
});

function addTreeToForest(stageIndex, species) {
const tree = document.createElement("span");
tree.className = "tree-icon";
tree.textContent = species.emoji;
forestEl.appendChild(tree);

// Give 3 wood for planting a tree
wood += 3;
woodEl.textContent = Math.floor(wood);
}

function updateBiome() {
const count = forestEl.querySelectorAll(".tree-icon").length;

if (count >= 50) document.body.style.background = "#e0f7fa"; // Mystic Grove
else if (count >= 25) document.body.style.background = "#fff8e1"; // Riverbank
else if (count >= 10) document.body.style.background = "#f1f8e9"; // Meadow
}

function saveForest() {
localStorage.setItem("forest", forestEl.innerHTML);
localStorage.setItem("wood", wood);
localStorage.setItem("Iron", Iron);
localStorage.setItem("growthMultiplier", growthMultiplier);
}

function loadForest() {
forestEl.innerHTML = localStorage.getItem("forest") || "";
wood = Number(localStorage.getItem("wood")) || 0;
Iron = Number(localStorage.getItem("Iron")) || 0;
growthMultiplier = Number(localStorage.getItem("growthMultiplier")) || 1;

woodEl.textContent = wood;
IronEl.textContent = Iron;
growthEl.textContent = growthMultiplier.toFixed(1) + "x";
}

loadForest();

// Crafting upgrades growth speed
function increaseGrowth(amount) {
growthMultiplier += amount;
growthEl.textContent = growthMultiplier.toFixed(1) + "x";
saveForest();
}

function craftBench() {
if (wood >= 10) {
wood -= 10;
woodEl.textContent = wood;
forestEl.innerHTML += "<p>🪑 Bench crafted! Growth speed +0.1x</p>";
increaseGrowth(0.1);
saveForest();
}
}

function craftLantern() {
if (wood >= 25) {
wood -= 25;
woodEl.textContent = wood;
forestEl.innerHTML += "<p>🏮 Lantern crafted! Growth speed +0.3x</p>";
increaseGrowth(0.3);
saveForest();
}
}

function craftTreehouse() {
if (wood >= 40 && Iron >= 2) {
wood -= 40;
Iron -= 2;
woodEl.textContent = wood;
IronEl.textContent = Iron;
forestEl.innerHTML += "<p>🏡 Treehouse crafted! Growth speed +0.75x</p>";
increaseGrowth(0.75);
saveForest();
}
}

function craftShrine() {
if (wood >= 70 && Iron >= 4) {
wood -= 70;
Iron -= 4;
woodEl.textContent = wood;
IronEl.textContent = Iron;
forestEl.innerHTML += "<p>⛩️ Shrine crafted! Growth speed +2.5x</p>";
increaseGrowth(2.5);
saveForest();
}
}

function craftShrine() {
if (wood >= 50 && Iron >= 6) {
wood -= 50;
Iron -= 6;
woodEl.textContent = wood;
IronEl.textContent = Iron;
forestEl.innerHTML += "<p>⛩️ Shrine crafted! Growth speed +2.5x</p>";
increaseGrowth(2.5);
saveForest();
}
}
