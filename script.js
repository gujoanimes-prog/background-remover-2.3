/* script.js - Premium Dark Studio Logic */

/* ---------- ELEMENT REFS ---------- */
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const previewWrapper = document.getElementById("preview-wrapper");
const previewImg = document.getElementById("preview-img");
const removePreviewBtn = document.getElementById("remove-preview");
const fileInfo = document.getElementById("file-info");

const removeBtn = document.getElementById("remove-btn");
const spinner = document.getElementById("spinner");

const resultCard = document.getElementById("result-card");
const resultImg = document.getElementById("result-img");
const downloadLink = document.getElementById("download-link");

const historyGrid = document.getElementById("history-grid");
const historyCard = document.getElementById("history-card");

// Toolbar buttons
const startWorkBtn = document.getElementById("start-work");
const toggleHistoryBtn = document.getElementById("toggle-history");

// Quality selector
const qualitySelect = document.getElementById("quality-select");

/* ---------- UTILITIES ---------- */
function toast(msg) { alert(msg); }

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = 2;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Resizes an image to a target height while maintaining aspect ratio.
 */
async function resizeImage(imgElement, targetHeight) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const scaleFactor = targetHeight / imgElement.naturalHeight;
    const targetWidth = imgElement.naturalWidth * scaleFactor;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

/* ---------- FILE HANDLING ---------- */
function resetUI() {
  previewImg.src = "";
  previewWrapper.hidden = true;
  resultCard.hidden = true;
  fileInfo.textContent = "";
  fileInput.value = "";
  removeBtn.disabled = false;
}

function handleFile(file) {
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    toast("Please upload a PNG or JPEG image.");
    return;
  }
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewWrapper.hidden = false;
  fileInfo.textContent = `${file.name} • ${formatBytes(file.size)}`;
}

/* ---------- EVENT LISTENERS ---------- */
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "var(--primary-blue)";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "var(--card-border)";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "var(--card-border)";
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});

removePreviewBtn.addEventListener("click", () => {
  resetUI();
});

// Toolbar actions
startWorkBtn.addEventListener("click", () => {
  resetUI();
});

toggleHistoryBtn.addEventListener("click", () => {
  historyCard.hidden = !historyCard.hidden;
});

// Remove background flow
removeBtn.addEventListener("click", async () => {
  if (!previewImg.src) {
    toast("Please select an image first.");
    return;
  }

  removeBtn.disabled = true;
  spinner.hidden = false;

  try {
    let blob;
    const qualityValue = qualitySelect.value;

    if (qualityValue === "original") {
      // Use original file
      const response = await fetch(previewImg.src);
      blob = await response.blob();
    } else {
      // Resize to selected quality (480, 720, 1080)
      const targetHeight = parseInt(qualityValue);
      // Only downscale, don't upscale
      if (previewImg.naturalHeight > targetHeight) {
        blob = await resizeImage(previewImg, targetHeight);
      } else {
        const response = await fetch(previewImg.src);
        blob = await response.blob();
      }
    }

    const formData = new FormData();
    const file = new File([blob], "upload.png", { type: blob.type });
    formData.append("image", file);

    const apiRes = await fetch("/api/remove-bg", {
      method: "POST",
      body: formData,
    });

    if (!apiRes.ok) throw new Error("Server error");
    const data = await apiRes.json();

    // Show result
    resultImg.src = data.output_url;
    downloadLink.href = data.output_url;
    resultCard.hidden = false;

    // Refresh history
    loadHistory();
  } catch (err) {
    console.error(err);
    toast("Failed to remove background.");
  } finally {
    removeBtn.disabled = false;
    spinner.hidden = true;
  }
});

/* ---------- HISTORY ---------- */
async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) throw new Error("History fetch error");
    const items = await res.json();

    historyGrid.innerHTML = "";
    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-item";

      const img = document.createElement("img");
      img.src = item.output_url;
      div.appendChild(img);

      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.innerHTML = '<span style="color: white; font-weight: bold; cursor: pointer;">Download</span>';
      overlay.onclick = () => {
        const a = document.createElement("a");
        a.href = item.output_url;
        a.download = "bg_removed.png";
        a.click();
      };
      div.appendChild(overlay);

      historyGrid.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}

// Initial load
loadHistory();
