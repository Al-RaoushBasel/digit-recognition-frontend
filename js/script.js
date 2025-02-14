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

// Get touch/mouse position relative to canvas
function getPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX || event.touches[0].clientX) - rect.left,
    y: (event.clientY || event.touches[0].clientY) - rect.top,
  };
}

// Start drawing
function startDrawing(event) {
  isDrawing = true;
  const pos = getPosition(event);
  lastX = pos.x;
  lastY = pos.y;
}

// Stop drawing
function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

// Draw on canvas
function draw(event) {
  if (!isDrawing) return;
  event.preventDefault();

  const pos = getPosition(event);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

// Add event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDrawing);

// Clear canvas
function clearCanvas() {
  initializeCanvas();
  document.getElementById("prediction-result").innerText = "_";
}
document.getElementById("clearCanvas").addEventListener("click", clearCanvas);

// Predict digit from canvas
async function predictFromCanvas() {
  try {
    const imageBlob = await prepareCanvasImage();
    await sendImageToBackend(imageBlob);
  } catch (error) {
    console.error("Error during canvas prediction:", error);
  }
}
document
  .getElementById("predictCanvas")
  .addEventListener("click", predictFromCanvas);

// Predict digit from uploaded image
function predictFromImage() {
  const fileInput = document.getElementById("uploadImage");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please choose an image file to upload.");
    return;
  }

  if (!allowedFileTypes.includes(file.type)) {
    alert("Invalid file type! Please upload a PNG, JPG, or WEBP image.");
    return;
  }

  if (file.size > maxFileSize) {
    alert("File is too large! Please upload an image under 2MB.");
    return;
  }

  sendImageToBackend(file);
}
document
  .getElementById("predictImage")
  .addEventListener("click", predictFromImage);

// Display uploaded file name
const uploadInput = document.getElementById("uploadImage");
const uploadMessage = document.getElementById("uploadMessage");
uploadInput.addEventListener("change", () => {
  uploadMessage.innerText =
    uploadInput.files.length > 0
      ? `File "${uploadInput.files[0].name}" uploaded successfully! ✅`
      : "";
});

// Prepare canvas image for sending
async function prepareCanvasImage() {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = 280;
  offscreenCanvas.height = 280;
  const offscreenCtx = offscreenCanvas.getContext("2d");

  offscreenCtx.fillStyle = "white";
  offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  offscreenCtx.drawImage(canvas, 0, 0, 280, 280);

  return new Promise((resolve) => offscreenCanvas.toBlob(resolve, "image/png"));
}

const API_URL = "https://digit-recognition-backend-production.up.railway.app";
const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxFileSize = 2 * 1024 * 1024;

// Send image to backend for prediction
async function sendImageToBackend(image) {
  const formData = new FormData();
  formData.append("file", image);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    document.getElementById("prediction-result").innerText = response.ok
      ? result.prediction
      : "Error";
  } catch (error) {
    console.error("Error connecting to backend:", error);
    document.getElementById("prediction-result").innerText = "Error";
  }
}

// Smooth scrolling for navigation links
document.querySelectorAll("nav ul li a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    document
      .getElementById(link.getAttribute("href").substring(1))
      .scrollIntoView({ behavior: "smooth" });
  });
});

// Highlight active section in navigation
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");
window.addEventListener("scroll", () => {
  let currentSection = "";
  sections.forEach((section) => {
    if (
      window.scrollY >= section.offsetTop - 60 &&
      window.scrollY < section.offsetTop + section.offsetHeight
    ) {
      currentSection = section.getAttribute("id");
    }
  });
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href").substring(1) === currentSection
    );
  });
});
