// =============================================================
// shared-settings.js
// Unified settings for the Local AI Platform
// Manages: Model selection + Mode (Demo/Local) across all pages
// =============================================================

const SharedSettings = (function () {

  // ----- Storage keys (one source of truth) -----
  const KEY_MODEL = "localAiModel";
  const KEY_MODE  = "localAiMode";  // "demo" or "local"

  // ----- Defaults -----
 const DEFAULT_MODEL = "qwen-turbo:latest";
  const DEFAULT_MODE  = "demo";

  // ----- Backend URLs -----
  const LOCAL_BACKEND_URL = "http://localhost:11434/api/chat";
  const OLLAMA_TAGS_URL   = "http://localhost:11434/api/tags";

  // ----- Available models (shown in dropdowns) -----
  const AVAILABLE_MODELS = [
    "qwen-turbo:latest",
    "qwen-fast:latest",
    "coder-turbo:latest",
    "qwen2.5:32b",
    "qwen2.5-coder:32b",
    "llama3.2-vision:11b",
    "gemma3:latest",
    "devstral:latest"
  ];

  // ----- Get / Set Model -----
  // ----- Per-page recommended models -----
const PAGE_RECOMMENDED_MODELS = {
  "chat":    "qwen-turbo:latest",
  "coding":  "coder-turbo:latest",
  "file":    "qwen-turbo:latest",
  "project": "qwen-fast:latest"
};

// Detect current page from URL
function getCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("chat"))    return "chat";
  if (path.includes("coding"))  return "coding";
  if (path.includes("file"))    return "file";
  if (path.includes("project")) return "project";
  return null;
}

function getModel() {
  // 1. Check if user manually selected a model for this page
  const page = getCurrentPage();
  if (page) {
    const pageKey = KEY_MODEL + "_" + page;
    const pageModel = localStorage.getItem(pageKey);
    if (pageModel) return pageModel;
  }
  // 2. Fall back to global manual selection
  const globalModel = localStorage.getItem(KEY_MODEL);
  if (globalModel) return globalModel;
  // 3. Fall back to recommended for this page
  if (page && PAGE_RECOMMENDED_MODELS[page]) {
    return PAGE_RECOMMENDED_MODELS[page];
  }
  // 4. Final fallback
  return DEFAULT_MODEL;
}

function setModel(modelName) {
  if (!modelName) return;
  // Save per-page (so each page remembers its choice)
  const page = getCurrentPage();
  if (page) {
    localStorage.setItem(KEY_MODEL + "_" + page, modelName);
  }
  // Also save globally as fallback
  localStorage.setItem(KEY_MODEL, modelName);
}

  // ----- Get / Set Mode -----
  function getMode() {
    return localStorage.getItem(KEY_MODE) || DEFAULT_MODE;
  }

  function setMode(mode) {
    if (mode !== "demo" && mode !== "local") return;
    localStorage.setItem(KEY_MODE, mode);
  }

  function isLocal() {
    return getMode() === "local";
  }

  // ----- Connection test (shared logic) -----
  async function testConnection() {
    try {
      const res = await fetch(OLLAMA_TAGS_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const installed = (data.models || []).map(m => m.name);
      const selected  = getModel();
      return {
        ok: true,
        installed,
        modelFound: installed.includes(selected),
        selectedModel: selected
      };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ----- File:// protocol guard -----
  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  // ----- Public API -----
  return {
    KEY_MODEL,
    KEY_MODE,
    DEFAULT_MODEL,
    DEFAULT_MODE,
    LOCAL_BACKEND_URL,
    OLLAMA_TAGS_URL,
    AVAILABLE_MODELS,
    getModel,
    setModel,
    getMode,
    setMode,
    isLocal,
    testConnection,
    isFileProtocol
  };

})();