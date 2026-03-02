import { GoogleGenerativeAI } from "@google/generative-ai";

const GENERATIONS: Record<string, string> = {
  "gen-alpha": "Gen Alpha (born 2013+). Very online, meme-heavy, chaotic energy. Speak like a kid who grew up on TikTok and YouTube shorts.",
  "gen-z": "Gen Z (born 1997-2012). Casual, ironic, self-aware humor. Internet-native tone with a mix of sincerity and absurdism.",
  "millennial": "Millennial (born 1981-1996). Self-deprecating humor, pop culture references, earnest but anxious energy.",
  "gen-x": "Gen X (born 1965-1980). Sarcastic, independent, low-key. Pragmatic and understated — not trying too hard.",
  "boomer": "Baby Boomer (born 1946-1964). Formal, straightforward, proper grammar. Earnest and direct, values respect and tradition.",
  "corporate": "Corporate/business speak. Buzzword-heavy, sounds important but says very little. The tone of an email from middle management.",
};

export async function translate(
  text: string,
  sourceGeneration: string,
  targetGeneration: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  if (sourceGeneration === targetGeneration) {
    throw new Error("Source and target generation must be different");
  }

  const isDecoding = targetGeneration === "plain";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let prompt: string;

  if (isDecoding) {
    const sourceStyle = GENERATIONS[sourceGeneration];
    if (!sourceStyle) {
      throw new Error(`Unknown generation: ${sourceGeneration}`);
    }

    prompt = `You are a translator that converts generational slang into plain, clear English.

The following text was written by someone who speaks in the style of: ${sourceStyle}

Your job is to DECODE this text. Replace all slang, generational expressions, and informal language with plain, standard English equivalents. The result should be something a parent or grandparent would easily understand.

IMPORTANT: Do NOT add any slang. Do NOT rewrite it in any generational style. Output plain, clear, everyday English ONLY.

Return ONLY the decoded text. No quotes, no explanation, no commentary.

Text to decode: ${text}`;
  } else {
    const targetStyle = GENERATIONS[targetGeneration];
    if (!targetStyle) {
      throw new Error(`Unknown generation: ${targetGeneration}`);
    }

    prompt = `Rewrite the following text as if it were said by someone from this generation:

${targetStyle}

The rewrite should sound natural — like something a real person from that generation would actually say. Capture the tone, attitude, and vocabulary authentically. Don't force slang where it doesn't fit. Preserve the original meaning.

Return ONLY the rewritten text. No quotes, no explanation, no commentary.

Text: ${text}`;
  }

  const result = await model.generateContent(prompt);
  const response = result.response.text().trim();
  return response;
}
