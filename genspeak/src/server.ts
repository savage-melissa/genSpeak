import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { translate } from "./translate";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"],
      imgSrc: ["'self'", "https://www.google-analytics.com", "https://*.googletagmanager.com"],
    },
  },
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const translateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests — try again in a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/translate", translateLimiter, async (req, res) => {
  const { text, sourceGeneration, targetGeneration } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  if (text.length > 500) {
    res.status(400).json({ error: "Text must be 500 characters or less" });
    return;
  }

  if (!targetGeneration || typeof targetGeneration !== "string") {
    res.status(400).json({ error: "Target generation is required" });
    return;
  }

  try {
    const translated = await translate(text.trim(), sourceGeneration || "plain", targetGeneration);
    res.json({ translated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`GenSpeak running at http://localhost:${PORT}`);
});
