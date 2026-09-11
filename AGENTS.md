<!-- MediKiosk project guidelines -->

# MediKiosk

Multilingual healthcare intake suite for patients, care teams, facility staff, platform operators, and administrators.

## Key Guidelines

- **Clinical AI**: Clinical reasoning, extraction, and summaries use Google Gemini.
- **Patient Assistant & Voice**: Chat assistance and voice transcription (Whisper) are powered by Groq.
- **Audio Output**: Spoken kiosk prompts use ElevenLabs.
- **Database**: All persistence is managed via Turso (libSQL).
- **Deployment**: Vercel-ready with Nitro preset `vercel`.
