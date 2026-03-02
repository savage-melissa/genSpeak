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

    outputText.textContent = data.translated;
    output.hidden = false;

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
