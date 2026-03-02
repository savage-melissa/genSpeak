# GenSpeak Design

## Overview

GenSpeak is a generational slang translator web app. Users input text, select a target generation, and receive the text rewritten in that generation's speaking style.

## Architecture

Simple single-page app with an Express backend.

- **Frontend:** Single `index.html` with vanilla HTML/CSS/JS, served by Express
- **Backend:** Express server with one API endpoint
- **AI:** Google Gemini API for translation

```
Browser (Frontend)
  │ POST /api/translate { text, targetGeneration }
  ▼
Express Server (Backend)
  │ Builds prompt, calls Gemini
  ▼
Google Gemini API
```

## Supported Generations

- Gen Alpha
- Gen Z
- Millennial
- Gen X
- Boomer
- Corporate

## API

**`POST /api/translate`**

Request: `{ text: string, targetGeneration: string }`

Response: `{ translated: string }`

## Prompt Strategy

System prompt instructs Gemini to act as a generational translator. Preserves original meaning while transforming vocabulary, tone, and phrasing. Each generation gets specific style guidance. Only the translated text is returned.

## Error Handling

- Empty input: client-side validation, no API call
- Gemini API error: friendly error message to user
- No rate limiting in v1

## Project Structure

```
genspeak/
├── src/
│   ├── server.ts          # Express server, serves frontend + API route
│   ├── translate.ts       # Gemini API call + prompt building logic
│   └── public/
│       ├── index.html     # Single page UI
│       ├── style.css      # Styling
│       └── script.js      # Frontend logic
├── package.json
├── tsconfig.json
├── .env                   # GEMINI_API_KEY
├── .gitignore
└── README.md
```

## Dependencies

- `express` — web server
- `@google/generative-ai` — Gemini SDK
- `dotenv` — env vars
- `typescript`, `ts-node` — dev tooling

## Dev Workflow

- `npm run dev` — start server with ts-node
- `npm run build` — compile TypeScript
- `npm start` — run compiled JS

## Constraints

No database, no auth, no sessions. Input → API → output.
