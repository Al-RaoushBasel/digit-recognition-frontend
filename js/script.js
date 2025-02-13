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

// Helper function to get touch/mouse position
function getPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX || event.touches[0].clientX) - rect.left,
    y: (event.clientY || event.touches[0].clientY) - rect.top
  };
}

// Start Drawing (Mouse & Touch)
function startDrawing(event) {
  isDrawing = true;
  const pos = getPosition(event);
  lastX = pos.x;
  lastY = pos.y;
}

// Stop Drawing
function stopDrawing() {
  isDrawing = false;
  ctx.beginPath(); // Reset path
}

// Draw Function (Mouse & Touch)
function draw(event) {
  if (!isDrawing) return;
  event.preventDefault(); // Prevent scrolling on touch

  const pos = getPosition(event);
  ctx.strokeStyle = "black"; // Brush color
  ctx.lineWidth = 20; // Brush size
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

// Add event listeners for both mouse and touch
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// Touch events for mobile
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDrawing);

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

const uploadInput = document.getElementById("uploadImage");
const uploadMessage = document.getElementById("uploadMessage");

uploadInput.addEventListener("change", () => {
  if (uploadInput.files.length > 0) {
    const fileName = uploadInput.files[0].name;
    uploadMessage.innerText = `File " ${fileName} " uploaded successfully! ✅`;
  } else {
    uploadMessage.innerText = "";
  }
});

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

// Allowed file types
const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes

async function sendImageToBackend(image) {
  // Validate file type (if uploaded from input)
  if (image instanceof File) {
    if (!allowedFileTypes.includes(image.type)) {
      alert("❌ Invalid file type! Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (image.size > maxFileSize) {
      alert("❌ File is too large! Please upload an image under 2MB.");
      return;
    }
  }

  const formData = new FormData();
  formData.append("file", image);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      document.getElementById("prediction-result").innerText = result.prediction;
    } else {
      console.error("Error in backend response:", response.statusText);
      document.getElementById("prediction-result").innerText = "Error";
    }
  } catch (error) {
    console.error("Error connecting to backend:", error);
    document.getElementById("prediction-result").innerText = "Error";
  }
}


document.querySelectorAll("nav ul li a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const sectionId = link.getAttribute("href").substring(1);
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
  });
});

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");

window.addEventListener("scroll", () => {
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 60;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
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