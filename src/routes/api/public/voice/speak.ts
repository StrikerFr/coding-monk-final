import { createFileRoute } from "@tanstack/react-router";

/**
 * Reads a short piece of patient-facing text aloud with the configured
 * ElevenLabs voice. Public because the walk-up kiosk has no sign-in, so the
 * request is strictly validated and length-capped.
 */

const MAX_CHARS = 600;

export const Route = createFileRoute("/api/public/voice/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["ELEVENLABS_API_KEY"];
        const voiceId = process.env["ELEVENLABS_VOICE_ID"];
        if (!apiKey || !voiceId) {
          return Response.json({ error: "Voice playback is not configured" }, { status: 503 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Expected a JSON body" }, { status: 400 });
        }

        const text = (body as { text?: unknown })?.text;
        if (typeof text !== "string" || text.trim().length === 0) {
          return Response.json({ error: "Text is required" }, { status: 400 });
        }
        if (text.length > MAX_CHARS) {
          return Response.json({ error: "Text is too long to read aloud" }, { status: 400 });
        }

        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              text: text.trim(),
              model_id: "eleven_multilingual_v2",
              voice_settings: { stability: 0.6, similarity_boost: 0.75, speed: 0.95 },
            }),
          },
        );

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error(`ElevenLabs speech failed [${upstream.status}]: ${detail}`);
          return Response.json(
            { error: "Voice playback failed", status: upstream.status, detail },
            { status: upstream.status === 401 ? 502 : upstream.status },
          );
        }

        return new Response(upstream.body, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
