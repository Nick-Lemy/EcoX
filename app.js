// Ensure the script runs only after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Fix 1: Wrap all event listeners inside DOMContentLoaded
  let model, webcam;
  let isRunning = false;
  let lastPrediction = null;
  let stats = {
    totalItems: 0,
    organicItems: 0,
    plasticItems: 0,
    paperItems: 0,
  };

  // Fix 2: Add event listeners for buttons instead of inline HTML events
  document.getElementById("start-button").addEventListener("click", init);
  document.querySelectorAll(".bin").forEach((bin) => {
    bin.addEventListener("click", function () {
      playInteractionAnimation(this.id);
    });
    bin.addEventListener("keypress", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        playInteractionAnimation(this.id);
      }
    });
  });
});
