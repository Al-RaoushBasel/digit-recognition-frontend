// Canvas drawing setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Initialize the canvas with a white background
function initializeCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
initializeCanvas();

// Event listeners for drawing on the canvas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY]; // Start drawing at this position
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx.beginPath(); // Reset the path to avoid connecting new lines to the last point
});

canvas.addEventListener("mousemove", draw);

// Function to draw smooth lines on the canvas
function draw(e) {
  if (!isDrawing) return;
  ctx.strokeStyle = "black"; // Brush color
  ctx.lineWidth = 20; // Brush size
  ctx.lineCap = "round"; // Rounded brush strokes
  ctx.lineJoin = "round"; // Smooth connection between lines

  ctx.beginPath();
  ctx.moveTo(lastX, lastY); // Start from the last position
  ctx.lineTo(e.offsetX, e.offsetY); // Draw a line to the current position
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY]; // Update the last position
}

// Clear the canvas
document.getElementById("clearCanvas").addEventListener("click", clearCanvas);

function clearCanvas() {
  initializeCanvas(); // Reset canvas to its initial state
  document.getElementById("prediction-result").innerText = "_"; // Reset prediction display
}

// Predict from canvas
document.getElementById("predictCanvas").addEventListener("click", async () => {
  try {
    const imageBlob = await prepareCanvasImage();
    await sendImageToBackend(imageBlob);
  } catch (error) {
    console.error("Error during canvas prediction:", error);
  }
});

// Predict from uploaded image
document.getElementById("predictImage").addEventListener("click", () => {
  const fileInput = document.getElementById("uploadImage");
  const file = fileInput.files[0];
  if (file) {
    sendImageToBackend(file);
  } else {
    console.warn("No file selected for upload.");
    alert("Please choose an image file to upload.");
  }
});

// Get references to the file input and message display
const uploadInput = document.getElementById("uploadImage");
const uploadMessage = document.getElementById("uploadMessage");

// Add an event listener for file selection
uploadInput.addEventListener("change", () => {
  if (uploadInput.files.length > 0) {
    const fileName = uploadInput.files[0].name;
    uploadMessage.innerText = `File " ${fileName} " uploaded successfully! ✅`;
  } else {
    uploadMessage.innerText = ""; // Clear the message if no file is selected
  }
});

// Function to prepare the canvas image for prediction
async function prepareCanvasImage() {
  // Create an offscreen canvas to resize the current canvas data
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = 280;
  offscreenCanvas.height = 280;
  const offscreenCtx = offscreenCanvas.getContext("2d");

  // Initialize the offscreen canvas with a white background
  offscreenCtx.fillStyle = "white";
  offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

  // Draw the current canvas content onto the offscreen canvas
  offscreenCtx.drawImage(canvas, 0, 0, 280, 280);

  // Convert the offscreen canvas to a Blob
  return new Promise((resolve) => offscreenCanvas.toBlob(resolve, "image/png"));
}

// Function to send image to backend and display the prediction
async function sendImageToBackend(image) {
  const formData = new FormData();
  formData.append("file", image);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      // Update the prediction result in the section
      document.getElementById("prediction-result").innerText =
        result.prediction;
    } else {
      console.error("Error in backend response:", response.statusText);
      document.getElementById("prediction-result").innerText = "Error";
    }
  } catch (error) {
    console.error("Error connecting to backend:", error);
    document.getElementById("prediction-result").innerText = "Error";
  }
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll("nav ul li a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default anchor behavior
    const sectionId = link.getAttribute("href").substring(1); // Get section ID without the "#"
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" }); // Smooth scroll to section
  });
});

// Highlight Active Section in Navbar
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");

window.addEventListener("scroll", () => {
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 60; // Adjust for navbar height
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").substring(1) === currentSection) {
      link.classList.add("active");
    }
  });
});
