const input = document.getElementById("input");
const generation = document.getElementById("generation");
const translateBtn = document.getElementById("translate-btn");
const decodeBtn = document.getElementById("decode-btn");
const output = document.getElementById("output");
const outputText = document.getElementById("output-text");
const error = document.getElementById("error");
const errorText = document.getElementById("error-text");
const charCurrent = document.getElementById("char-current");

const MAX_CHARS = 500;

input.addEventListener("input", () => {
  const len = input.value.length;
  charCurrent.textContent = len;
  charCurrent.classList.toggle("over-limit", len >= MAX_CHARS);
});

function trackEvent(name, params) {
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

async function doTranslate(source, target) {
  const text = input.value.trim();
  if (!text) {
    showError("Please enter some text to translate.");
    return;
  }

  const mode = source === "plain" ? "translate" : "decode";
  const gen = source === "plain" ? target : source;

  output.hidden = true;
  error.hidden = true;
  setLoading(true);

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        sourceGeneration: source,
        targetGeneration: target,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong.");
      trackEvent("translation_error", { mode, generation: gen, error: data.error });
      return;
    }

    console.log("[GenSpeak]", { source, target, _debug: data._debug });
    outputText.textContent = data.translated;
    output.hidden = false;

    addToHistory({ mode, generation: gen, input: text, output: data.translated });

    trackEvent("translation", {
      mode,
      generation: gen,
      input_length: text.length,
    });
  } catch (err) {
    showError("Failed to connect to server.");
    trackEvent("translation_error", { mode, generation: gen, error: "network" });
  } finally {
    setLoading(false);
  }
}

translateBtn.addEventListener("click", () => {
  doTranslate("plain", generation.value);
});

decodeBtn.addEventListener("click", () => {
  doTranslate(generation.value, "plain");
});

function showError(message) {
  errorText.textContent = message;
  error.hidden = false;
  output.hidden = true;
}

const loadingPhrases = [
  "Translating...",
  "Vibing with the algorithm...",
  "Consulting the elders...",
  "Decoding the slang...",
  "Channeling the generation...",
  "Adjusting the tone...",
  "Almost there...",
];

let loadingInterval = null;
let phraseIndex = 0;
let activeBtn = null;

function setLoading(on) {
  if (on) {
    translateBtn.disabled = true;
    decodeBtn.disabled = true;
    activeBtn = document.activeElement === decodeBtn ? decodeBtn : translateBtn;
    activeBtn.classList.add("loading");
    startLoadingAnimation();
  } else {
    stopLoadingAnimation();
    translateBtn.disabled = false;
    decodeBtn.disabled = false;
    if (activeBtn) activeBtn.classList.remove("loading");
    activeBtn = null;
  }
}

function startLoadingAnimation() {
  phraseIndex = 0;
  if (activeBtn) activeBtn.textContent = loadingPhrases[0];
  loadingInterval = setInterval(() => {
    phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
    if (activeBtn) activeBtn.textContent = loadingPhrases[phraseIndex];
  }, 1500);
}

function stopLoadingAnimation() {
  clearInterval(loadingInterval);
  loadingInterval = null;
  translateBtn.textContent = "Translate →";
  decodeBtn.textContent = "← Decode";
}

// ── History ──

const HISTORY_KEY = "genspeak_history";
const MAX_HISTORY = 20;
const historySection = document.getElementById("history-section");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

const GENERATION_LABELS = {
  "gen-alpha": "Gen Alpha",
  "gen-z": "Gen Z",
  "millennial": "Millennial",
  "gen-x": "Gen X",
  "boomer": "Boomer",
  "corporate": "Corporate",
  "plain": "Plain English",
};

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(entry) {
  const history = getHistory();
  history.unshift({
    ...entry,
    timestamp: Date.now(),
  });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  saveHistory(history);
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historySection.hidden = true;
    return;
  }

  historySection.hidden = false;
  historyList.innerHTML = "";

  history.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const label = entry.mode === "translate"
      ? `→ ${GENERATION_LABELS[entry.generation] || entry.generation}`
      : `${GENERATION_LABELS[entry.generation] || entry.generation} → Plain`;

    item.innerHTML = `
      <div class="history-meta">
        <span class="history-mode ${entry.mode}">${entry.mode === "translate" ? "Translate" : "Decode"}</span>
        <span class="history-gen">${label}</span>
      </div>
      <p class="history-input"></p>
      <p class="history-output"></p>
    `;

    item.querySelector(".history-input").textContent = entry.input;
    item.querySelector(".history-output").textContent = entry.output;

    historyList.appendChild(item);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

// Load history on page load
renderHistory();
