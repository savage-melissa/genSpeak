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
