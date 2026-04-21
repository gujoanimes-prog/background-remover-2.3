// script.js – frontend logic (updated)

/* ---------- ELEMENT REFS ---------- */
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const previewWrapper = document.getElementById("preview-wrapper");
const previewImg = document.getElementById("preview-img");
const removePreviewBtn = document.getElementById("remove-preview");
const fileInfo = document.getElementById("file-info");

const actionCard = document.getElementById("action-card");
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

/* ---------- FILE HANDLING ---------- */
function resetUI() {
  // Clear preview & result, hide cards, reset file info
  previewImg.src = "";
  previewWrapper.hidden = true;
  actionCard.hidden = true;
  resultCard.hidden = true;
  fileInfo.hidden = true;
  // Reset file input (so same file can be selected again)
  fileInput.value = "";
}

function showCard(card) {
  card.hidden = false;
  card.classList.remove("fade-out");
  card.classList.add("fade-in");
}
function hideCard(card) {
  card.classList.remove("fade-in");
  card.classList.add("fade-out");
  setTimeout(() => { card.hidden = true; }, 300); // match transition duration
}

function handleFile(file) {
  if (!file) return;
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    toast("Please upload a PNG or JPEG image.");
    return;
  }
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewWrapper.hidden = false;
  actionCard.hidden = false;
  fileInfo.hidden = false;
  fileInfo.textContent = `${file.name} • ${formatBytes(file.size)}`;
  // Animate cards
  showCard(previewWrapper.parentElement); // upload card
  showCard(actionCard);
}

/* ---------- EVENT LISTENERS ---------- */
// Drag & drop area
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });

dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
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
  // Show upload card again for a fresh start
  const uploadCard = document.querySelector('.upload-card');
  showCard(uploadCard);
});

toggleHistoryBtn.addEventListener("click", () => {
  if (historyCard.hidden) {
    showCard(historyCard);
    loadHistory();
  } else {
    hideCard(historyCard);
  }
});

// Remove background flow
removeBtn.addEventListener("click", async () => {
  if (!previewImg.src) return;
  removeBtn.disabled = true;
  spinner.hidden = false;
  try {
    const formData = new FormData();
    const response = await fetch(previewImg.src);
    const blob = await response.blob();
    const file = new File([blob], "upload.png", { type: blob.type });
    formData.append("image", file);
    const apiRes = await fetch("/api/remove-bg", { method: "POST", body: formData });
    if (!apiRes.ok) throw new Error("Server error");
    const data = await apiRes.json();
    resultImg.src = data.output_url;
    downloadLink.href = data.output_url;
    showCard(resultCard);
    // Refresh history view if it is visible
    if (!historyCard.hidden) loadHistory();
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
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "grid-item";
      const img = document.createElement("img");
      img.src = item.output_url;
      div.appendChild(img);
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.textContent = "Download";
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
    toast("Unable to load history.");
  }
}

// Initial load – keep history hidden until user opens file manager
historyCard.hidden = true;
loadHistory();
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const previewWrapper = document.getElementById("preview-wrapper");
const previewImg = document.getElementById("preview-img");
const removePreviewBtn = document.getElementById("remove-preview");

const actionCard = document.getElementById("action-card");
const removeBtn = document.getElementById("remove-btn");
const spinner = document.getElementById("spinner");

const resultCard = document.getElementById("result-card");
const resultImg = document.getElementById("result-img");
const downloadLink = document.getElementById("download-link");

const historyGrid = document.getElementById("history-grid");

// Helper: simple toast fallback
function toast(msg) { alert(msg); }

// File handling
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });

dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file) return;
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    toast("Please upload a PNG or JPEG image.");
    return;
  }
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewWrapper.hidden = false;
  actionCard.hidden = false;
}

removePreviewBtn.addEventListener("click", () => {
  previewImg.src = "";
  previewWrapper.hidden = true;
  actionCard.hidden = true;
  resultCard.hidden = true;
});

// Remove background flow
removeBtn.addEventListener("click", async () => {
  if (!previewImg.src) return;
  removeBtn.disabled = true;
  spinner.hidden = false;
  try {
    const formData = new FormData();
    const response = await fetch(previewImg.src);
    const blob = await response.blob();
    const file = new File([blob], "upload.png", { type: blob.type });
    formData.append("image", file);
    const apiRes = await fetch("/api/remove-bg", { method: "POST", body: formData });
    if (!apiRes.ok) throw new Error("Server error");
    const data = await apiRes.json();
    resultImg.src = data.output_url;
    downloadLink.href = data.output_url;
    resultCard.hidden = false;
    loadHistory();
  } catch (err) {
    console.error(err);
    toast("Failed to remove background.");
  } finally {
    removeBtn.disabled = false;
    spinner.hidden = true;
  }
});

// Load history
async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) throw new Error("History fetch error");
    const items = await res.json();
    historyGrid.innerHTML = "";
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "grid-item";
      const img = document.createElement("img");
      img.src = item.output_url;
      div.appendChild(img);
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.textContent = "Download";
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
    toast("Unable to load history.");
  }
}

// Initial load
loadHistory();
