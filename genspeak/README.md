# GenSpeak

A generational slang translator. Input a phrase or sentence and translate it to a target generation's speaking style (Gen Alpha, Millennial, Boomer, etc.) — or vice versa.

## Supported Generations

- **Gen Alpha** — skibidi, rizz, no cap
- **Gen Z** — slay, bestie, it's giving
- **Millennial** — adulting, I can't even, living my best life
- **Gen X** — whatever, as if, pragmatic and understated
- **Boomer** — formal, straightforward, back in my day
- **Corporate** — synergy, circle back, move the needle

## Tech Stack

- TypeScript / Node.js / Express
- Google Gemini API (gemini-2.0-flash)

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/savage-melissa/genSpeak.git
   cd genSpeak
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up your API key**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your [Google Gemini API key](https://aistudio.google.com/apikey).

4. **Run the app**

   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)
