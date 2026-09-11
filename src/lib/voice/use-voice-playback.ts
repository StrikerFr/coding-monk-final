import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Reads text aloud using the configured MediKiosk voice. One request plays at a
 * time — starting a new one stops the previous playback.
 */
export function useVoicePlayback() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setSpeakingId(null);
  }, [cleanup]);

  const speak = useCallback(
    async (text: string, id = text) => {
      cleanup();
      setFailed(false);
      setSpeakingId(id);
      try {
        const response = await fetch("/api/public/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => {
          setFailed(true);
          setSpeakingId(null);
        };
        await audio.play();
      } catch {
        cleanup();
        setFailed(true);
        setSpeakingId(null);
      }
    },
    [cleanup],
  );

  return { speak, stop, speakingId, failed, isSpeaking: speakingId !== null };
}
