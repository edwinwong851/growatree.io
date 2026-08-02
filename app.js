let minutes = 0;
let wood = 0;
let essence = 0;
let growing = false;
let growthMultiplier = 1;
let focusSeconds = 0;
let growInterval = null;
let secondsInterval = null;
let lastEssenceCount = 0;
let lastEssenceMinute = -1;

const timerEl = document.getElementById("timer");
const treeEl = document.getElementById("tree");
const woodEl = document.getElementById("wood");
const essenceEl = document.getElementById("essence");
const forestEl = document.getElementById("forest");
const growthEl = document.getElementById("growth");
const focusSecondsEl = document.getElementById("focusSecondsValue");
const essenceCountdownEl = document.getElementById("essenceCountdownValue");

console.log("App.js loaded! focusSecondsEl:", focusSecondsEl);

const stages = ["🌱", "🌿", "🌳", "🌲", "🌴"];

// GROW_INTERVAL: 60000 = 1 minute, 5000 = 5 seconds (for testing)
const GROW_INTERVAL = 60000;

// Tree species based on session length
const species = [
{ name: "Birch", emoji: "🌱", min: 0 },
{ name: "Oak", emoji: "🌿", min: 10 },
{ name: "Redwood", emoji: "🌳", min: 25 },
{ name: "Crystal Tree", emoji: "💠", min: 45 }
];

function getTreeSpecies(minutes) {
return species.filter(s => minutes >= s.min).pop();
}

function animateTree() {
treeEl.classList.add("tree-grow");
setTimeout(() => treeEl.classList.remove("tree-grow"), 500);
}

function getSecondsUntilNextEssence() {
  // Essence is given at 2, 4, 6, 8... minutes
  // Calculate how many seconds until the next 2-minute mark
const totalSeconds = focusSeconds;
  const nextEssenceAt = Math.ceil(totalSeconds / 120) * 120; // Next multiple of 120
  const nextEssenceAt = Math.ceil(totalSeconds / 120) * 120;
return Math.max(0, nextEssenceAt - totalSeconds);
}

function showEssenceNotification() {
const notification = document.createElement("div");
notification.className = "essence-notification";
notification.textContent = "✨ +1 Essence!";
document.body.appendChild(notification);

  // Remove after animation completes
  console.log("Showing essence notification!");
  
setTimeout(() => notification.remove(), 3000);
}

document.getElementById("startBtn").onclick = () => {
console.log("Start button clicked!");
if (growing) return;

growing = true;
minutes = 0;
focusSeconds = 0;
  lastEssenceCount = essence;
  lastEssenceMinute = -1;

timerEl.textContent = "Timer: 0 min";
focusSecondsEl.textContent = "0";
essenceCountdownEl.textContent = "120";
treeEl.textContent = stages[0];

console.log("Session started!");

// Seconds counter - updates every 1 second
secondsInterval = setInterval(() => {
if (!growing) {
clearInterval(secondsInterval);
return;
}
focusSeconds += 1;
focusSecondsEl.textContent = focusSeconds;

// Update essence countdown
const secondsUntil = getSecondsUntilNextEssence();
essenceCountdownEl.textContent = secondsUntil;

console.log("Seconds:", focusSeconds, "Until next essence:", secondsUntil);
}, 1000);

// Growth interval - updates every GROW_INTERVAL (1 minute)
growInterval = setInterval(() => {
if (!growing) {
clearInterval(growInterval);
return;
}

minutes += growthMultiplier;
    timerEl.textContent = `Timer: ${Math.floor(minutes)} min`;
    const floorMinutes = Math.floor(minutes);
    timerEl.textContent = `Timer: ${floorMinutes} min`;

    const stageIndex = Math.min(stages.length - 1, Math.floor(minutes));
    const stageIndex = Math.min(stages.length - 1, floorMinutes);
treeEl.textContent = stages[stageIndex];
animateTree();

wood += 2 * growthMultiplier;
woodEl.textContent = Math.floor(wood);

    // Essence given every 2 minutes
    if (minutes >= 2 && minutes % 2 === 0) {
    // Essence given every 2 minutes - check if we just hit a 2-minute mark
    if (floorMinutes >= 2 && floorMinutes % 2 === 0 && floorMinutes !== lastEssenceMinute) {
      lastEssenceMinute = floorMinutes;
essence += 1;
      essenceEl.textContent = essence;
      console.log("ESSENCE EARNED! Total:", essence, "At minute:", floorMinutes);
showEssenceNotification();
}
    essenceEl.textContent = essence;

// Update countdown
const secondsUntil = getSecondsUntilNextEssence();
essenceCountdownEl.textContent = secondsUntil;

if (minutes >= 5) {
growing = false;
const sp = getTreeSpecies(minutes);
addTreeToForest(stageIndex, sp);
updateBiome();
saveForest();
clearInterval(growInterval);
clearInterval(secondsInterval);
}

}, GROW_INTERVAL);
};

// Focus lock
document.addEventListener("visibilitychange", () => {
if (document.hidden && growing) {
growing = false;
alert("Focus lost — tree stopped growing.");
clearInterval(growInterval);
clearInterval(secondsInterval);
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
localStorage.setItem("essence", essence);
localStorage.setItem("growthMultiplier", growthMultiplier);
}

function loadForest() {
forestEl.innerHTML = localStorage.getItem("forest") || "";
wood = Number(localStorage.getItem("wood")) || 0;
essence = Number(localStorage.getItem("essence")) || 0;
growthMultiplier = Number(localStorage.getItem("growthMultiplier")) || 1;

woodEl.textContent = wood;
essenceEl.textContent = essence;
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
}
}

function craftLantern() {
if (wood >= 20) {
wood -= 20;
woodEl.textContent = wood;
forestEl.innerHTML += "<p>🏮 Lantern crafted! Growth speed +0.2x</p>";
increaseGrowth(0.2);
}
}

function craftTreehouse() {
if (wood >= 50 && essence >= 5) {
wood -= 50;
essence -= 5;
woodEl.textContent = wood;
essenceEl.textContent = essence;
forestEl.innerHTML += "<p>🏡 Treehouse crafted! Growth speed +0.5x</p>";
increaseGrowth(0.5);
}
}

function craftShrine() {
if (wood >= 80 && essence >= 10) {
wood -= 80;
essence -= 10;
woodEl.textContent = wood;
essenceEl.textContent = essence;
forestEl.innerHTML += "<p>⛩️ Shrine crafted! Growth speed +2.0x</p>";
increaseGrowth(2.0);
}
}
