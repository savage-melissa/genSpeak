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
