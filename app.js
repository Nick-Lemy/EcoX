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


// Initialize Teachable Machine model & webcam
async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        document.getElementById("status-text").innerText = "Loading model...";
        model = await tmImage.load(modelURL, metadataURL);
        document.getElementById("status-text").innerText = "Setting up camera...";
        webcam = new tmImage.Webcam(200, 200, true);
        await webcam.setup();
        await webcam.play();
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        document.getElementById("status-dot").classList.add("active");
        document.getElementById("status-text").innerText = "Camera active - detecting items";
        isRunning = true;
        document.querySelector(".start-button").innerText = "Restart Camera";
        window.requestAnimationFrame(loop);
    } catch (error) {
        console.error(error);
        document.getElementById("status-text").innerText = "Error: " + error.message;
    }
}

async function loop() {
    if (!isRunning) return;
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// Bin interactions (click & keyboard support)
function playInteractionAnimation(binId) {
  const bin = document.getElementById(binId);
  bin.classList.add("shake-bin");
  setTimeout(() => {
      bin.classList.remove("shake-bin");
  }, 600);
}

// Process classification results and update UI
function applyFeedback(prediction) {
  resetBins();
  const messageDiv = document.getElementById("message");
  const confidenceDiv = document.getElementById("confidence");
  let highestConfidence = 0;
  let predictedClass = "";
  prediction.forEach(p => {
      if (p.probability > highestConfidence) {
          highestConfidence = p.probability;
          predictedClass = p.className;
      }
  });
  if (highestConfidence < 0.70) {
      messageDiv.textContent = "Awaiting detection...";
      confidenceDiv.textContent = "";
      return;
  }
  if (lastPrediction === predictedClass) return;
  stats.totalItems++;
  document.getElementById("total-items").textContent = stats.totalItems;
  lastPrediction = predictedClass;
  const binMap = {
      "Organic": "organic-bin",
      "Plastic": "plastic-bin",
      "Paper": "paper-bin"
  };
  if (binMap[predictedClass]) {
      document.getElementById(binMap[predictedClass]).classList.add("active-bin");
      document.body.classList.add(${predictedClass.toLowerCase()}-mode);
      messageDiv.textContent = ${predictedClass} Waste Detected;
      stats[${predictedClass.toLowerCase()}Items]++;
      document.getElementById(${predictedClass.toLowerCase()}-count).textContent = stats[${predictedClass.toLowerCase()}Items];
  }
  confidenceDiv.textContent = Confidence: ${Math.round(highestConfidence * 100)}%;
  playInteractionAnimation(binMap[predictedClass]);
}