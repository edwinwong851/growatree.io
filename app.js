let minutes = 0;
let wood = 0;
let essence = 0;
let growing = false;
let growthMultiplier = 1;
let focusSeconds = 0;
let growInterval = null;
let secondsInterval = null;

// Wait for DOM to load before accessing elements
function initializeElements() {
  window.timerEl = document.getElementById("timer");
  window.treeEl = document.getElementById("tree");
  window.woodEl = document.getElementById("wood");
  window.essenceEl = document.getElementById("essence");
  window.forestEl = document.getElementById("forest");
  window.growthEl = document.getElementById("growth");
  window.focusSecondsEl = document.getElementById("focusSecondsValue");
  
  console.log("Elements initialized:", window.focusSecondsEl);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeElements);
} else {
  initializeElements();
}

const stages = ["🌱", "🌿", "🌳", "🌲", "🌴"];

// TEST MODE: 1 second = 1 minute
// REAL MODE: change to 60000
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
  window.treeEl.classList.add("tree-grow");
  setTimeout(() => window.treeEl.classList.remove("tree-grow"), 500);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").onclick = () => {
    if (growing) return;

    growing = true;
    minutes = 0;
    focusSeconds = 0;

    window.timerEl.textContent = "Timer: 0 min";
    window.focusSecondsEl.textContent = "0";
    window.treeEl.textContent = stages[0];

    console.log("Session started, focusSecondsEl:", window.focusSecondsEl);

    // Seconds counter - updates every 1 second
    secondsInterval = setInterval(() => {
      if (!growing) {
        clearInterval(secondsInterval);
        return;
      }
      focusSeconds += 1;
      window.focusSecondsEl.textContent = focusSeconds;
      console.log("Seconds updated:", focusSeconds);
    }, 1000);

    // Growth interval - updates every GROW_INTERVAL (1 minute)
    growInterval = setInterval(() => {
      if (!growing) {
        clearInterval(growInterval);
        return;
      }

      minutes += growthMultiplier;
      window.timerEl.textContent = `Timer: ${Math.floor(minutes)} min`;

      const stageIndex = Math.min(stages.length - 1, Math.floor(minutes));
      window.treeEl.textContent = stages[stageIndex];
      animateTree();

      wood += 2 * growthMultiplier;
      window.woodEl.textContent = Math.floor(wood);

      if (minutes >= 20) essence += 1;
      if (minutes >= 45) essence += 3;
      window.essenceEl.textContent = essence;

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
});

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
  window.forestEl.appendChild(tree);
}

function updateBiome() {
  const count = window.forestEl.querySelectorAll(".tree-icon").length;

  if (count >= 50) document.body.style.background = "#e0f7fa"; // Mystic Grove
  else if (count >= 25) document.body.style.background = "#fff8e1"; // Riverbank
  else if (count >= 10) document.body.style.background = "#f1f8e9"; // Meadow
}

function saveForest() {
  localStorage.setItem("forest", window.forestEl.innerHTML);
  localStorage.setItem("wood", wood);
  localStorage.setItem("essence", essence);
  localStorage.setItem("growthMultiplier", growthMultiplier);
}

function loadForest() {
  window.forestEl.innerHTML = localStorage.getItem("forest") || "";
  wood = Number(localStorage.getItem("wood")) || 0;
  essence = Number(localStorage.getItem("essence")) || 0;
  growthMultiplier = Number(localStorage.getItem("growthMultiplier")) || 1;

  window.woodEl.textContent = wood;
  window.essenceEl.textContent = essence;
  window.growthEl.textContent = growthMultiplier.toFixed(1) + "x";
}

document.addEventListener("DOMContentLoaded", () => {
  loadForest();
});

// Crafting upgrades growth speed
function increaseGrowth(amount) {
  growthMultiplier += amount;
  window.growthEl.textContent = growthMultiplier.toFixed(1) + "x";
  saveForest();
}

function craftBench() {
  if (wood >= 10) {
    wood -= 10;
    window.woodEl.textContent = wood;
    window.forestEl.innerHTML += "<p>🪑 Bench crafted! Growth speed +0.1x</p>";
    increaseGrowth(0.1);
  }
}

function craftLantern() {
  if (wood >= 20) {
    wood -= 20;
    window.woodEl.textContent = wood;
    window.forestEl.innerHTML += "<p>🏮 Lantern crafted! Growth speed +0.2x</p>";
    increaseGrowth(0.2);
  }
}

function craftTreehouse() {
  if (wood >= 50 && essence >= 5) {
    wood -= 50;
    essence -= 5;
    window.woodEl.textContent = wood;
    window.essenceEl.textContent = essence;
    window.forestEl.innerHTML += "<p>🏡 Treehouse crafted! Growth speed +0.5x</p>";
    increaseGrowth(0.5);
  }
}

function craftShrine() {
  if (wood >= 100 && essence >= 10) {
    wood -= 100;
    essence -= 10;
    window.woodEl.textContent = wood;
    window.essenceEl.textContent = essence;
    window.forestEl.innerHTML += "<p>⛩️ Shrine crafted! Growth speed +1.0x</p>";
    increaseGrowth(1.0);
  }
}
