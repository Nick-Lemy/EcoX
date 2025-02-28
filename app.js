const URL = "https://teachablemachine.withgoogle.com/models/1iyHm8kQn/";
    let model, webcam;
    let isRunning = false;

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

    // Reset all bins to inactive state
    function resetBins() {
      document.getElementById("organic-bin").classList.remove("active-bin");
      document.getElementById("plastic-bin").classList.remove("active-bin");
      document.getElementById("paper-bin").classList.remove("active-bin");
      document.getElementById("message").style.backgroundColor = "";
      document.getElementById("message").style.color = "#333";
    }

    async function predict() {
      const prediction = await model.predict(webcam.canvas);
      let highestPrediction = prediction.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current
      );

      // Reset bins before activating the new one
      resetBins();

      let activeBin = null;
      let messageColor = "";
      let message = "";

      if (highestPrediction.probability > 0.7) {
        switch (highestPrediction.className) {
          case "Food":
            activeBin = "organic-bin";
            message = "Throw in Organic Bin";
            messageColor = "rgba(76, 175, 80, 0.2)";
            document.getElementById("message").style.color = "#1b5e20";
            break;
          case "Plastic":
            activeBin = "plastic-bin";
            message = "Throw in Plastic Bin";
            messageColor = "rgba(33, 150, 243, 0.2)";
            document.getElementById("message").style.color = "#0d47a1";
            break;
          case "Paper and Cardboard":
            activeBin = "paper-bin";
            message = "Throw in Paper Bin";
            messageColor = "rgba(255, 152, 0, 0.2)";
            document.getElementById("message").style.color = "#e65100";
            break;
          default:
            message = "Unknown Item";
        }

        if (activeBin) {
          document.getElementById(activeBin).classList.add("active-bin");
          document.getElementById("message").style.backgroundColor = messageColor;
        }
      } else {
        message = "Awaiting clear detection...";
      }

      document.getElementById("message").innerText = message;
      document.getElementById("confidence").innerText = 
        highestPrediction.probability > 0 
          ? `Confidence: ${(highestPrediction.probability * 100).toFixed(1)}%` 
          : "";
    }