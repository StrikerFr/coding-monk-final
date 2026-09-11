import { useCallback, useEffect, useRef, useState } from "react";
import { encodeWav, peakLevel } from "./wav";

export type VoiceInputState = "idle" | "listening" | "understanding" | "done" | "error";

export type VoiceInputError = "permission" | "empty" | "failed";

interface Options {
  /** Preferred spoken language; omitted lets the service detect it. */
  language?: "hi" | "en";
  onTranscript?: (text: string) => void;
}

/**
 * Records the patient speaking, then streams the recognised text back.
 *
 * The whole recording is captured as a complete WAV file before it is sent, so
 * every browser (including iOS Safari) produces audio the service can read.
 */
export function useVoiceInput({ language, onTranscript }: Options = {}) {
  const [state, setState] = useState<VoiceInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<VoiceInputError | null>(null);
  const [level, setLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  const teardown = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      setError("permission");
      setState("error");
      return;
    }

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      const input = new Float32Array(event.inputBuffer.getChannelData(0));
      chunksRef.current.push(input);
      setLevel(peakLevel(input));
    };
    source.connect(processor);
    processor.connect(context.destination);

    streamRef.current = stream;
    contextRef.current = context;
    cleanupRef.current = () => {
      processor.onaudioprocess = null;
      processor.disconnect();
      source.disconnect();
    };
    setState("listening");
  }, []);

  const stop = useCallback(async () => {
    const context = contextRef.current;
    const sampleRate = context?.sampleRate ?? 48000;
    const chunks = chunksRef.current;
    teardown();

    if (chunks.length === 0) {
      setError("empty");
      setState("error");
      return;
    }

    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 4096) {
      setError("empty");
      setState("error");
      return;
    }

    setState("understanding");
    const body = new FormData();
    body.append("audio", blob, "recording.wav");
    if (language) body.append("language", language);

    let response: Response;
    try {
      response = await fetch("/api/public/voice/transcribe", { method: "POST", body });
    } catch {
      setError("failed");
      setState("error");
      return;
    }

    if (!response.ok || !response.body) {
      setError("failed");
      setState("error");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    const handleEvent = (payload: string) => {
      if (!payload || payload === "[DONE]") return;
      try {
        const event = JSON.parse(payload) as { type?: string; delta?: string; text?: string };
        if (event.type === "transcript.text.delta" && event.delta) {
          text += event.delta;
          setTranscript(text);
        } else if (event.type === "transcript.text.done" && typeof event.text === "string") {
          text = event.text;
          setTranscript(text);
        }
      } catch {
        // Ignore keep-alive or non-JSON lines.
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.startsWith("data:")) handleEvent(line.slice(5).trim());
      }
    }
    if (buffer.startsWith("data:")) handleEvent(buffer.slice(5).trim());

    const finalText = text.trim();
    if (!finalText) {
      setError("empty");
      setState("error");
      return;
    }
    setState("done");
    onTranscript?.(finalText);
  }, [language, onTranscript, teardown]);

  const reset = useCallback(() => {
    teardown();
    setTranscript("");
    setError(null);
    setState("idle");
  }, [teardown]);

  return { state, transcript, error, level, start, stop, reset };
}
