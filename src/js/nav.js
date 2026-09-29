/* ============================================================
   TERRA-CADASTRAL AI — Navigation Controller
   ============================================================ */

// Map screen ID → workflow stage number
const STAGE_MAP = {
  "s01-acquisition":  1,
  "s02-preprocess":   2,
  "s03-ai-extract":   3,
  "s04-vectorize":    4,
  "s05-parcels":      5,
  "s06-topology":     6,
  "s07-confidence":   7,
  "s08-storage":      8,
  "s09-webgis":       9,
  "s10-review":       10,
  "s11-export":       11
};

let currentScreen = "s09-webgis";

function navigateTo(screenId) {
  if (screenId === currentScreen) return;

  // Hide current
  document.getElementById(currentScreen)?.classList.remove("active");
  document.getElementById("nav-" + currentScreen.split("-")[0])?.classList.remove("active");

  // Show new
  const el = document.getElementById(screenId);
  if (!el) return;
  el.classList.add("active");
  currentScreen = screenId;

  // Update sidebar nav active state
  const prefix = "nav-" + screenId.split("-")[0];
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById(prefix)?.classList.add("active");

  // Update workflow bar
  const stageNum = STAGE_MAP[screenId];
  document.querySelectorAll(".wf-stage").forEach((s, i) => {
    s.classList.remove("active", "completed");
    const sNum = i + 1;
    if (sNum < stageNum)       s.classList.add("completed");
    else if (sNum === stageNum) s.classList.add("active");
  });
  document.querySelectorAll(".wf-connector").forEach((c, i) => {
    c.classList.toggle("done", i < stageNum - 1);
  });

  // Call screen init if available
  if (typeof window["init_" + screenId.replace(/-/g,"_")] === "function") {
    window["init_" + screenId.replace(/-/g,"_")]();
  }

  // Reinit lucide icons for newly rendered content
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Initialise default screen on load
document.addEventListener("DOMContentLoaded", () => {
  navigateTo("s09-webgis");
});
