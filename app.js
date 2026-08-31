```javascript
// ============================================================
// 🌳 GROWATREE.IO — FOCUS FOREST
// Complete game engine
// ============================================================


// ============================================================
// GAME STATE
// ============================================================

let wood = 0;
let Iron = 0;

let focusSeconds = 0;
let growing = false;
let lostFocus = false;

let growthMultiplier = 1;

let secondsInterval = null;

let forest = [];

let currentTreeStage = 0;


// ============================================================
// DOM ELEMENTS
// ============================================================

const timerEl = document.getElementById("timer");
const treeEl = document.getElementById("tree");

const woodEl = document.getElementById("wood");
const IronEl = document.getElementById("Iron");

const forestEl = document.getElementById("forest");

const growthEl = document.getElementById("growth");

const focusSecondsEl =
    document.getElementById("focusSecondsValue");

const IronCountdownEl =
    document.getElementById("IronCountdownValue");

const growthBar =
    document.getElementById("growthBar");

const treeName =
    document.getElementById("treeName");

const treeCount =
    document.getElementById("treeCount");


// ============================================================
// TREE STAGES
// ============================================================

const stages = [
    {
        emoji: "🌱",
        name: "Tiny Seedling",
        required: 0
    },

    {
        emoji: "🌿",
        name: "Young Plant",
        required: 2
    },

    {
        emoji: "🌳",
        name: "Growing Tree",
        required: 5
    },

    {
        emoji: "🌲",
        name: "Mighty Tree",
        required: 10
    },

    {
        emoji: "🌴",
        name: "Ancient Tree",
        required: 20
    },

    {
        emoji: "💠",
        name: "Crystal Tree",
        required: 30
    },

    {
        emoji: "🎄",
        name: "Mystic Tree",
        required: 45
    },

    {
        emoji: "🎋",
        name: "Spirit Tree",
        required: 60
    }
];


// ============================================================
// TREE SPECIES
// ============================================================

const species = [
    {
        name: "Birch",
        emoji: "🌳",
        minimumMinutes: 1
    },

    {
        name: "Oak",
        emoji: "🌲",
        minimumMinutes: 5
    },

    {
        name: "Redwood",
        emoji: "🌴",
        minimumMinutes: 10
    },

    {
        name: "Crystal Tree",
        emoji: "💠",
        minimumMinutes: 20
    },

    {
        name: "Mystic Tree",
        emoji: "🎄",
        minimumMinutes: 30
    },

    {
        name: "Spirit Tree",
        emoji: "🎋",
        minimumMinutes: 45
    }
];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadGame();

    updateUI();

    updateForest();

    updateBiome();

    console.log("🌳 Focus Forest loaded!");

});


// ============================================================
// START FOCUS
// ============================================================

function startFocus() {

    if (growing) {
        return;
    }

    growing = true;
    lostFocus = false;

    focusSeconds = 0;
    currentTreeStage = 0;

    treeEl.textContent = stages[0].emoji;

    showNotification(
        "🌱 Focus session started!"
    );

    updateUI();

    secondsInterval = setInterval(
        focusTick,
        1000
    );

}


// ============================================================
// STOP FOCUS
// ============================================================

function stopFocus() {

    if (!growing) {
        return;
    }

    growing = false;

    if (secondsInterval !== null) {

        clearInterval(secondsInterval);

        secondsInterval = null;

    }

    // Reward based on completed focus time
    const minutes = Math.floor(
        focusSeconds / 60
    );

    if (minutes > 0) {

        finishTree();

    }

    showNotification(
        "🛑 Focus session ended."
    );

    saveGame();

    updateUI();

}


// ============================================================
// MAIN TIMER
// ============================================================

function focusTick() {

    if (!growing) {
        return;
    }

    focusSeconds++;

    // --------------------------------------------------------
    // WOOD
    // --------------------------------------------------------

    if (focusSeconds % 20 === 0) {

        const woodEarned =
            Math.max(
                1,
                Math.round(growthMultiplier)
            );

        wood += woodEarned;

        showNotification(
            `🪵 +${woodEarned} Wood`
        );

    }


    // --------------------------------------------------------
    // IRON
    // --------------------------------------------------------

    if (focusSeconds % 120 === 0) {

        Iron++;

        showIronNotification();

    }


    // --------------------------------------------------------
    // TREE
    // --------------------------------------------------------

    updateTree();


    // --------------------------------------------------------
    // UI
    // --------------------------------------------------------

    updateUI();

    saveGame();

}


// ============================================================
// TREE GROWTH
// ============================================================

function updateTree() {

    let newStage = 0;

    for (
        let i = 0;
        i < stages.length;
        i++
    ) {

        if (
            focusSeconds >=
            stages[i].required * 60
        ) {

            newStage = i;

        }

    }

    if (
        newStage !== currentTreeStage
    ) {

        currentTreeStage = newStage;

        treeEl.textContent =
            stages[newStage].emoji;

        treeName.textContent =
            stages[newStage].name;

        animateTree();

        showNotification(
            `🌳 Your tree grew into a ${stages[newStage].name}!`
        );

    }

}


// ============================================================
// TREE ANIMATION
// ============================================================

function animateTree() {

    treeEl.style.transform =
        "scale(1.4)";

    setTimeout(() => {

        treeEl.style.transform =
            "scale(1)";

    }, 500);

}


// ============================================================
// FINISH TREE
// ============================================================

function finishTree() {

    if (focusSeconds < 60) {

        return;

    }

    const minutes =
        Math.floor(
            focusSeconds / 60
        );

    const treeSpecies =
        getTreeSpecies(minutes);

    forest.push({

        emoji: treeSpecies.emoji,

        name: treeSpecies.name,

        minutes: minutes,

        date: new Date().toISOString()

    });

    // Bonus wood for growing a complete tree
    wood += 3;

    showNotification(
        `🌲 ${treeSpecies.name} added to your forest! +3 Wood`
    );

    updateForest();

    updateBiome();

}


// ============================================================
// TREE SPECIES SELECTION
// ============================================================

function getTreeSpecies(minutes) {

    let result = species[0];

    for (
        const tree of species
    ) {

        if (
            minutes >=
            tree.minimumMinutes
        ) {

            result = tree;

        }

    }

    return result;

}


// ============================================================
// IRON COUNTDOWN
// ============================================================

function getSecondsUntilIron() {

    const remainder =
        focusSeconds % 120;

    return 120 - remainder;

}


// ============================================================
// IRON NOTIFICATION
// ============================================================

function showIronNotification() {

    showNotification(
        "⛓️ +1 Iron!"
    );

}


// ============================================================
// UI UPDATE
// ============================================================

function updateUI() {

    const minutes =
        Math.floor(
            focusSeconds / 60
        );

    const seconds =
        focusSeconds % 60;

    // Timer
    timerEl.textContent =
        `Timer: ${minutes} min ${seconds}s`;

    // Focus seconds
    focusSecondsEl.textContent =
        focusSeconds;

    // Resources
    woodEl.textContent =
        Math.floor(wood);

    IronEl.textContent =
        Math.floor(Iron);

    // Growth
    growthEl.textContent =
        growthMultiplier.toFixed(1) + "x";

    // Iron countdown
    if (growing) {

        IronCountdownEl.textContent =
            getSecondsUntilIron();

    } else {

        IronCountdownEl.textContent =
            "120";

    }

    // Tree count
    treeCount.textContent =
        forest.length;

    // Growth progress
    updateGrowthBar();

}


// ============================================================
// GROWTH BAR
// ============================================================

function updateGrowthBar() {

    const nextStage =
        stages[
            Math.min(
                currentTreeStage + 1,
                stages.length - 1
            )
        ];

    const previousStage =
        stages[currentTreeStage];

    if (
        currentTreeStage >=
        stages.length - 1
    ) {

        growthBar.style.width =
            "100%";

        return;

    }

    const start =
        previousStage.required * 60;

    const end =
        nextStage.required * 60;

    const progress =
        ((focusSeconds - start) /
        (end - start)) * 100;

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                progress
            )
        );

    growthBar.style.width =
        percentage + "%";

}


// ============================================================
// FOREST DISPLAY
// ============================================================

function updateForest() {

    forestEl.innerHTML = "";

    if (forest.length === 0) {

        const empty =
            document.createElement("p");

        empty.id =
            "emptyForest";

        empty.textContent =
            "Your forest is empty. Start focusing to grow your first tree!";

        forestEl.appendChild(empty);

        return;

    }

    forest.forEach(tree => {

        const treeElement =
            document.createElement("div");

        treeElement.className =
            "tree-icon";

        treeElement.textContent =
            tree.emoji;

        treeElement.title =
            `${tree.name} — ${tree.minutes} minute focus`;

        forestEl.appendChild(
            treeElement
        );

    });

}


// ============================================================
// BIOME SYSTEM
// ============================================================

function updateBiome() {

    const count =
        forest.length;

    if (count >= 50) {

        document.body.style.background =
            "linear-gradient(#b3e5fc, #4fc3f7)";

    }

    else if (count >= 25) {

        document.body.style.background =
            "linear-gradient(#fff8e1, #ffe082)";

    }

    else if (count >= 10) {

        document.body.style.background =
            "linear-gradient(#e8f5e9, #a5d6a7)";

    }

    else {

        document.body.style.background =
            "linear-gradient(#e8f5e9, #c8e6c9)";

    }

}


// ============================================================
// GROWTH UPGRADE
// ============================================================

function buyGrowthUpgrade() {

    const cost =
        25;

    if (wood < cost) {

        showNotification(
            "❌ You need 25 Wood!"
        );

        return;

    }

    wood -= cost;

    growthMultiplier += 0.5;

    showNotification(
        `⚡ Growth speed increased to ${growthMultiplier.toFixed(1)}x!`
    );

    updateUI();

    saveGame();

}


// ============================================================
// CRAFTING
// ============================================================

function increaseGrowth(amount) {

    growthMultiplier += amount;

    updateUI();

}


// ------------------------------------------------------------
// BENCH
// ------------------------------------------------------------

function craftBench() {

    if (wood < 10) {

        showNotification(
            "❌ You need 10 Wood!"
        );

        return;

    }

    wood -= 10;

    increaseGrowth(0.1);

    showNotification(
        "🪑 Bench crafted! +0.1x Growth"
    );

    saveGame();

}


// ------------------------------------------------------------
// LANTERN
// ------------------------------------------------------------

function craftLantern() {

    if (wood < 25) {

        showNotification(
            "❌ You need 25 Wood!"
        );

        return;

    }

    wood -= 25;

    increaseGrowth(0.3);

    showNotification(
        "🏮 Lantern crafted! +0.3x Growth"
    );

    saveGame();

}


// ------------------------------------------------------------
// TREEHOUSE
// ------------------------------------------------------------

function craftTreehouse() {

    if (
        wood < 40 ||
        Iron < 2
    ) {

        showNotification(
            "❌ Need 40 Wood + 2 Iron!"
        );

        return;

    }

    wood -= 40;

    Iron -= 2;

    increaseGrowth(0.75);

    showNotification(
        "🏡 Treehouse crafted! +0.75x Growth"
    );

    saveGame();

}


// ------------------------------------------------------------
// SHRINE
// ------------------------------------------------------------

function craftShrine1() {

    if (
        wood < 70 ||
        Iron < 4
    ) {

        showNotification(
            "❌ Need 70 Wood + 4 Iron!"
        );

        return;

    }

    wood -= 70;

    Iron -= 4;

    increaseGrowth(2.5);

    showNotification(
        "⛩️ Shrine crafted! +2.5x Growth"
    );

    saveGame();

}


// ------------------------------------------------------------
// IRON SHRINE
// ------------------------------------------------------------

function craftShrine2() {

    if (
        wood < 50 ||
        Iron < 6
    ) {

        showNotification(
            "❌ Need 50 Wood + 6 Iron!"
        );

        return;

    }

    wood -= 50;

    Iron -= 6;

    increaseGrowth(2.5);

    showNotification(
        "⛩️ Iron Shrine crafted! +2.5x Growth"
    );

    saveGame();

}


// ============================================================
// NOTIFICATIONS
// ============================================================

function showNotification(message) {

    const container =
        document.getElementById(
            "notificationContainer"
        );

    if (!container) {
        return;
    }

    const notification =
        document.createElement("div");

    notification.className =
        "notification";

    notification.textContent =
        message;

    container.appendChild(
        notification
    );

    setTimeout(() => {

        notification.remove();

    }, 2500);

}


// ============================================================
// SAVE GAME
// ============================================================

function saveGame() {

    const gameData = {

        wood: wood,

        Iron: Iron,

        growthMultiplier:
            growthMultiplier,

        forest:
            forest

    };

    localStorage.setItem(
        "focusForestSave",
        JSON.stringify(gameData)
    );

}


// ============================================================
// LOAD GAME
// ============================================================

function loadGame() {

    const saved =
        localStorage.getItem(
            "focusForestSave"
        );

    if (!saved) {

        wood = 0;

        Iron = 0;

        growthMultiplier = 1;

        forest = [];

        return;

    }

    try {

        const data =
            JSON.parse(saved);

        wood =
            Number(data.wood) || 0;

        Iron =
            Number(data.Iron) || 0;

        growthMultiplier =
            Number(
                data.growthMultiplier
            ) || 1;

        forest =
            Array.isArray(data.forest)
                ? data.forest
                : [];

    }

    catch (error) {

        console.error(
            "Save file could not be loaded.",
            error
        );

        wood = 0;

        Iron = 0;

        growthMultiplier = 1;

        forest = [];

    }

}


// ============================================================
// MANUAL SAVE BUTTON
// ============================================================

function saveGameButton() {

    saveGame();

    showNotification(
        "💾 Game saved!"
    );

}


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {

    const confirmed =
        confirm(
            "Are you sure you want to reset your entire forest?"
        );

    if (!confirmed) {
        return;
    }

    if (secondsInterval !== null) {

        clearInterval(
            secondsInterval
        );

        secondsInterval = null;

    }

    wood = 0;

    Iron = 0;

    focusSeconds = 0;

    growthMultiplier = 1;

    forest = [];

    growing = false;

    lostFocus = false;

    currentTreeStage = 0;

    localStorage.removeItem(
        "focusForestSave"
    );

    treeEl.textContent =
        stages[0].emoji;

    treeName.textContent =
        stages[0].name;

    updateForest();

    updateUI();

    updateBiome();

    showNotification(
        "🗑️ Forest reset."
    );

}


// ============================================================
// VISIBILITY / FOCUS PROTECTION
// ============================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            growing
        ) {

            growing = false;

            lostFocus = true;

            if (
                secondsInterval !== null
            ) {

                clearInterval(
                    secondsInterval
                );

                secondsInterval = null;

            }

            showNotification(
                "👀 Focus lost — session paused."
            );

            updateUI();

        }

    }
);


// ============================================================
// GLOBAL BUTTON COMPATIBILITY
// ============================================================

// The new HTML uses these functions directly.
// These aliases also make older HTML versions work.

window.startFocus =
    startFocus;

window.stopFocus =
    stopFocus;

window.craftBench =
    craftBench;

window.craftLantern =
    craftLantern;

window.craftTreehouse =
    craftTreehouse;

window.craftShrine1 =
    craftShrine1;

window.craftShrine2 =
    craftShrine2;

window.buyGrowthUpgrade =
    buyGrowthUpgrade;

window.saveGame =
    saveGameButton;

window.loadGame =
    () => {

        loadGame();

        updateUI();

        updateForest();

        updateBiome();

        showNotification(
            "📂 Game loaded!"
        );

    };

window.resetGame =
    resetGame;


// ============================================================
// AUTO-SAVE
// ============================================================

setInterval(
    () => {

        saveGame();

    },
    10000
);


// ============================================================
// INITIAL UI
// ============================================================

updateUI();
```
