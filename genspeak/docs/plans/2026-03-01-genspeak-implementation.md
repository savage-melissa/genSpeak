# GenSpeak Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app that translates text into generational speaking styles (Gen Alpha, Gen Z, Millennial, Gen X, Boomer, Corporate) using Google Gemini.

**Architecture:** Express server serves a static frontend and exposes a single `POST /api/translate` endpoint. The endpoint builds a generation-specific prompt, sends it to Gemini, and returns the translated text.

**Tech Stack:** TypeScript, Node.js, Express, Google Generative AI SDK (`@google/generative-ai`), vanilla HTML/CSS/JS frontend.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

**Step 1: Initialize the project**

Run: `npm init -y`

**Step 2: Install dependencies**

Run: `npm install express @google/generative-ai dotenv`
Run: `npm install -D typescript ts-node @types/express @types/node`

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Add scripts to package.json**

Add these to the `"scripts"` section:

```json
{
  "dev": "ts-node src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

**Step 5: Create .env file**

```
GEMINI_API_KEY=your-api-key-here
```

**Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json .env
git commit -m "feat: scaffold project with dependencies and config"
```

Note: Do NOT commit `.env` — it's in `.gitignore`. Add a `.env.example` instead with placeholder value.

---

### Task 2: Translation Module

**Files:**
- Create: `src/translate.ts`

**Step 1: Create the translate module**

This module exports a single function `translate(text: string, targetGeneration: string): Promise<string>`.

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const GENERATIONS: Record<string, string> = {
  "gen-alpha": "Gen Alpha (born 2013+). Use slang like 'skibidi', 'rizz', 'no cap', 'bussin', 'sigma', 'gyatt', 'fanum tax', 'ohio'. Very informal, meme-heavy, chaotic energy.",
  "gen-z": "Gen Z (born 1997-2012). Use slang like 'slay', 'bestie', 'it's giving', 'understood the assignment', 'rent free', 'main character', 'no thoughts just vibes'. Casual, ironic, self-aware humor.",
  "millennial": "Millennial (born 1981-1996). Use phrases like 'adulting', 'I can't even', 'it me', 'living my best life', 'this is everything', 'dead', 'I'm screaming'. Self-deprecating humor, pop culture references.",
  "gen-x": "Gen X (born 1965-1980). Use a sarcastic, independent, low-key tone. References to 'whatever', 'as if', pragmatic and understated. Not trying too hard.",
  "boomer": "Baby Boomer (born 1946-1964). Use formal, straightforward language. Proper grammar, complete sentences. May include phrases like 'back in my day', 'kids these days'. Earnest and direct.",
  "corporate": "Corporate/business speak. Use jargon like 'synergy', 'circle back', 'align on', 'move the needle', 'low-hanging fruit', 'deep dive', 'leverage', 'touch base', 'action items'. Buzzword-heavy, sounds important but says little.",
};

export async function translate(
  text: string,
  targetGeneration: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const generationStyle = GENERATIONS[targetGeneration];
  if (!generationStyle) {
    throw new Error(`Unknown generation: ${targetGeneration}`);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a translator that converts text into a specific generational speaking style.

Target style: ${generationStyle}

Rules:
- Preserve the original meaning of the text
- Transform vocabulary, tone, and phrasing to match the target generation
- Only return the translated text, nothing else — no quotes, no explanation
- Keep roughly the same length as the original

Text to translate:
${text}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text().trim();
  return response;
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/translate.ts
git commit -m "feat: add Gemini-powered translation module"
```

---

### Task 3: Express Server

**Files:**
- Create: `src/server.ts`

**Step 1: Create the server**

```typescript
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { translate } from "./translate";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/translate", async (req, res) => {
  const { text, targetGeneration } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  if (!targetGeneration || typeof targetGeneration !== "string") {
    res.status(400).json({ error: "Target generation is required" });
    return;
  }

  try {
    const translated = await translate(text.trim(), targetGeneration);
    res.json({ translated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`GenSpeak running at http://localhost:${PORT}`);
});
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/server.ts
git commit -m "feat: add Express server with /api/translate endpoint"
```

---

### Task 4: Frontend — HTML

**Files:**
- Create: `src/public/index.html`

**Step 1: Create the HTML page**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GenSpeak</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <h1>GenSpeak</h1>
    <p class="subtitle">Translate anything into generational speak</p>

    <div class="translator">
      <textarea id="input" placeholder="Type something to translate..." rows="4"></textarea>

      <div class="controls">
        <select id="generation">
          <option value="gen-alpha">Gen Alpha</option>
          <option value="gen-z">Gen Z</option>
          <option value="millennial">Millennial</option>
          <option value="gen-x">Gen X</option>
          <option value="boomer">Boomer</option>
          <option value="corporate">Corporate</option>
        </select>
        <button id="translate-btn">Translate</button>
      </div>

      <div id="output" class="output" hidden>
        <p id="output-text"></p>
      </div>

      <div id="error" class="error" hidden>
        <p id="error-text"></p>
      </div>
    </div>
  </main>

  <script src="script.js"></script>
</body>
</html>
```

**Step 2: Commit**

```bash
git add src/public/index.html
git commit -m "feat: add frontend HTML structure"
```

---

### Task 5: Frontend — CSS

**Files:**
- Create: `src/public/style.css`

**Step 1: Create the stylesheet**

Clean, minimal styling. Centered layout, readable fonts, clear visual hierarchy. Style the textarea, dropdown, button, and output area. Use a simple color palette. Make it responsive.

Key elements to style:
- `main` — centered, max-width ~600px
- `h1` — large, bold title
- `.subtitle` — muted description
- `textarea` — full width, decent padding
- `.controls` — flex row with select + button
- `select` and `button` — matching height, clear styling
- `.output` — styled box for translated result
- `.error` — red-tinted error message
- Loading state on button during API call

**Step 2: Commit**

```bash
git add src/public/style.css
git commit -m "feat: add frontend styling"
```

---

### Task 6: Frontend — JavaScript

**Files:**
- Create: `src/public/script.js`

**Step 1: Create the client-side logic**

```javascript
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
```

**Step 2: Commit**

```bash
git add src/public/script.js
git commit -m "feat: add frontend translation logic"
```

---

### Task 7: End-to-End Test & Polish

**Step 1: Create .env.example**

```
GEMINI_API_KEY=your-api-key-here
```

**Step 2: Verify the app runs**

Run: `npm run dev`
Expected: `GenSpeak running at http://localhost:3000`

**Step 3: Test in browser**

- Open `http://localhost:3000`
- Type a sentence
- Select a generation
- Click Translate
- Verify output appears

**Step 4: Update README.md**

Update the README with setup instructions:
- Clone the repo
- `npm install`
- Copy `.env.example` to `.env` and add your Gemini API key
- `npm run dev`
- Open `http://localhost:3000`

**Step 5: Final commit and push**

```bash
git add .env.example README.md
git commit -m "docs: add setup instructions and env example"
git push origin main
```
