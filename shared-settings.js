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
  function getModel() {
    return localStorage.getItem(KEY_MODEL) || DEFAULT_MODEL;
  }

  function setModel(modelName) {
    if (!modelName) return;
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