const URL = "https://teachablemachine.withgoogle.com/models/1iyHm8kQn/";
let model, webcam;
let isRunning = false;

async function init() {
  try {
    // Construct model and metadata URLs
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Update UI to indicate model is loading
    document.getElementById("status-text").innerText = "Loading model...";

    // Load AI model from Teachable Machine
    model = await tmImage.load(modelURL, metadataURL);

    document.getElementById("status-text").innerText = "Setting up camera...";

    // Initialize webcam feed (200x200 pixels, flipped for mirroring)
    webcam = new tmImage.Webcam(200, 200, true);
    await webcam.setup(); // Request camera permissions
    await webcam.play(); // Start streaming

    // Append webcam feed to the page
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // Update UI to indicate camera is active
    document.getElementById("status-dot").classList.add("active");
    document.getElementById("status-text").innerText =
      "Camera active - detecting items";

    isRunning = true;
    document.querySelector(".start-button").innerText = "Restart Camera";

    // Begin continuous detection loop
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error(error);
    document.getElementById("status-text").innerText =
      "Error: " + error.message;
  }
}

async function loop() {
  if (!isRunning) return; // Stop loop if the system is inactive

  webcam.update(); // Refresh webcam feed
  await predict(); // Run waste classification

  // Request the next frame to keep running
  window.requestAnimationFrame(loop);
}

// Reset all bins to their default state (remove highlights)
function resetBins() {
  document.getElementById("organic-bin").classList.remove("active-bin");
  document.getElementById("plastic-bin").classList.remove("active-bin");
  document.getElementById("paper-bin").classList.remove("active-bin");

  // Reset message background and text color
  document.getElementById("message").style.backgroundColor = "";
  document.getElementById("message").style.color = "#333";
}
