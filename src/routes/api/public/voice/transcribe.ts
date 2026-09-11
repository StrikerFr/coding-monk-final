import { createFileRoute } from "@tanstack/react-router";

/**
 * Turns a short recording of the patient speaking into text, streaming the
 * transcript back as Server-Sent Events so the kiosk can show words as they
 * are recognised. Public because the walk-up kiosk has no sign-in.
 */

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = ["audio/wav", "audio/wave", "audio/x-wav", "audio/webm", "audio/mp4", "audio/mpeg"];

export const Route = createFileRoute("/api/public/voice/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GROQ_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "Voice input is not configured. Please set GROQ_API_KEY." },
            { status: 503 },
          );
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Expected an audio upload" }, { status: 400 });
        }

        const audio = form.get("audio");
        if (!(audio instanceof File) || audio.size === 0) {
          return Response.json({ error: "An audio recording is required" }, { status: 400 });
        }
        if (audio.size > MAX_BYTES) {
          return Response.json({ error: "That recording is too long" }, { status: 413 });
        }
        const type = audio.type.split(";")[0] ?? "";
        if (!ALLOWED.includes(type)) {
          return Response.json({ error: "Unsupported audio format" }, { status: 400 });
        }

        const language = form.get("language");
        const upstreamForm = new FormData();
        upstreamForm.append("file", audio, "recording.wav");
        upstreamForm.append("model", "whisper-large-v3-turbo");
        upstreamForm.append("response_format", "json");
        if (language === "hi" || language === "en") {
          upstreamForm.append("language", language);
        }

        const upstream = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: upstreamForm,
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          console.error(`Transcription failed [${upstream.status}]: ${detail}`);
          return Response.json(
            { error: "Could not understand that recording", detail },
            { status: upstream.status },
          );
        }

        const data = (await upstream.json()) as { text?: string };
        const text = (data?.text ?? "").trim();

        const sse = `data: ${JSON.stringify({ type: "transcript.text.done", text })}\n\ndata: [DONE]\n\n`;

        return new Response(sse, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
