const input = document.getElementById("input");
const generation = document.getElementById("generation");
const translateBtn = document.getElementById("translate-btn");
const output = document.getElementById("output");
const outputText = document.getElementById("output-text");
const error = document.getElementById("error");
const errorText = document.getElementById("error-text");

translateBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) {
    showError("Please enter some text to translate.");
    return;
  }

  output.hidden = true;
  error.hidden = true;
  translateBtn.disabled = true;
  translateBtn.textContent = "Translating...";

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        targetGeneration: generation.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong.");
      return;
    }

    outputText.textContent = data.translated;
    output.hidden = false;
  } catch (err) {
    showError("Failed to connect to server.");
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
  }
});

function showError(message) {
  errorText.textContent = message;
  error.hidden = false;
  output.hidden = true;
}
