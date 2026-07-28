let minutes = 0;
let wood = 0;
let growing = false;

const timerEl = document.getElementById("timer");
const treeEl = document.getElementById("tree");
const woodEl = document.getElementById("wood");
const forestEl = document.getElementById("forest");

const stages = ["🌱", "🌿", "🌳", "🌲", "🌴"];

document.getElementById("startBtn").onclick = () => {
  if (growing) return;
  growing = true;
  minutes = 0;
  treeEl.textContent = stages[0];

  const interval = setInterval(() => {
    if (!growing) {
      clearInterval(interval);
      return;
    }

    minutes++;
    timerEl.textContent = `Timer: ${minutes} min`;

    // Tree grows every minute
    const stageIndex = Math.min(stages.length - 1, Math.floor(minutes / 1));
    treeEl.textContent = stages[stageIndex];

    // Gain wood every minute
    wood += 2;
    woodEl.textContent = wood;

    // End session at 5 minutes (demo)
    if (minutes >= 5) {
      growing = false;
      addTreeToForest(stageIndex);
      clearInterval(interval);
    }

  }, 60000); // 1 minute
};

function addTreeToForest(stageIndex) {
  const tree = document.createElement("span");
  tree.className = "tree-icon";
  tree.textContent = stages[stageIndex];
  forestEl.appendChild(tree);
}

function craftBench() {
  if (wood >= 10) {
    wood -= 10;
    woodEl.textContent = wood;
    forestEl.innerHTML += "<p>🪑 Crafted a Bench!</p>";
  }
}

function craftLantern() {
  if (wood >= 20) {
    wood -= 20;
    woodEl.textContent = wood;
    forestEl.innerHTML += "<p>🏮 Crafted a Lantern!</p>";
  }
}
