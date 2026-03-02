import type { VercelRequest, VercelResponse } from "@vercel/node";
import { translate } from "../src/translate";

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const ipRequests = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);

  if (!entry || now > entry.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many requests — try again in a minute" });
    return;
  }

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
}
