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

async function predict() {
    // Run classification on the current webcam frame
    const prediction = await model.predict(webcam.canvas);
  
    // Find the highest confidence prediction
    let highestPrediction = prediction.reduce((prev, current) => 
      (prev.probability > current.probability) ? prev : current
    );
  
    // Reset bins before setting the new active bin
    resetBins();
  
    let activeBin = null;
    let messageColor = "";
    let message = "";
  
    // Process classification results if confidence is above 70%
    if (highestPrediction.probability > 0.7) {
      switch (highestPrediction.className) {
        case "Food":
          activeBin = "organic-bin";
          message = "Throw in Organic Bin";
          messageColor = "rgba(76, 175, 80, 0.2)"; // Green
          document.getElementById("message").style.color = "#1b5e20";
          break;
        case "Plastic":
          activeBin = "plastic-bin";
          message = "Throw in Plastic Bin";
          messageColor = "rgba(33, 150, 243, 0.2)"; // Blue
          document.getElementById("message").style.color = "#0d47a1";
          break;
        case "Paper and Cardboard":
          activeBin = "paper-bin";
          message = "Throw in Paper Bin";
          messageColor = "rgba(255, 152, 0, 0.2)"; // Orange
          document.getElementById("message").style.color = "#e65100";
          break;
        default:
          message = "Unknown Item";
      }
  
      // Highlight the correct bin if detected
      if (activeBin) {
        document.getElementById(activeBin).classList.add("active-bin");
        document.getElementById("message").style.backgroundColor = messageColor;
      }
    } else {
      message = "Awaiting clear detection...";
    }
  
    // Display the detection result and confidence score
    document.getElementById("message").innerText = message;
    document.getElementById("confidence").innerText = 
      highestPrediction.probability > 0 
        ? `Confidence: ${(highestPrediction.probability * 100).toFixed(1)}%` 
        : "";
  }
  
