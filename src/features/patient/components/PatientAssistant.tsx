import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, Mic, Send, Sparkles, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVoiceInput } from "@/lib/voice/use-voice-input";
import {
  askPatientAssistant,
  type AssistantDestination,
  type AssistantTurn,
} from "@/features/patient/assistant.functions";

interface Bubble extends AssistantTurn {
  id: string;
  goTo?: AssistantDestination | null;
  goToLabel?: string | null;
}

const SUGGESTIONS = [
  "Show my reports",
  "I have a headache, what can I do till the doctor comes?",
  "When will the doctor see me?",
  "Start a new check-in",
];

const GREETING: Bubble = {
  id: "greeting",
  role: "assistant",
  content:
    "Hi! I can open your reports, documents or check-in, and share simple tips to stay comfortable while you wait for the doctor. Type or tap the mic.",
};

export function PatientAssistant() {
  const navigate = useNavigate();
  const ask = useServerFn(askPatientAssistant);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const voice = useVoiceInput({
    onTranscript: (text) => {
      if (text.trim()) void send(text.trim());
    },
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(text: string) {
    setError(null);
    setDraft("");
    const history = messages
      .filter((m) => m.id !== "greeting")
      .map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
    setBusy(true);
    try {
      const reply = await ask({ data: { message: text, history } });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply.reply,
          goTo: reply.goTo,
          goToLabel: reply.goToLabel,
        },
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The helper could not answer just now.");
    } finally {
      setBusy(false);
    }
  }

  const listening = voice.state === "listening";
  const understanding = voice.state === "understanding";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-lg transition hover:opacity-90 md:bottom-6 md:right-6"
        >
          <Sparkles className="size-5" />
          <span className="text-sm font-semibold">Need help?</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-20 z-50 flex max-h-[78vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:w-[26rem]">
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">MediKiosk helper</p>
                <p className="text-xs text-muted-foreground">Finds pages &amp; basic care tips. Not a doctor.</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close helper" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-sunken text-foreground"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.goTo && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2.5 gap-1"
                      onClick={() => {
                        setOpen(false);
                        void navigate({ to: message.goTo as string });
                      }}
                    >
                      {message.goToLabel ?? "Open this page"}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {(busy || understanding) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {understanding ? "Listening to what you said…" : "Thinking…"}
              </div>
            )}
            {listening && (
              <p className="text-sm text-muted-foreground">Recording… tap the stop button when you finish.</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-surface-sunken"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-border px-3 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (draft.trim() && !busy) void send(draft.trim());
            }}
          >
            <Button
              type="button"
              size="icon"
              variant={listening ? "destructive" : "outline"}
              aria-label={listening ? "Stop recording" : "Speak"}
              disabled={busy || understanding}
              onClick={() => (listening ? void voice.stop() : void voice.start())}
            >
              {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
            </Button>
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask anything about your care…"
              disabled={busy}
            />
            <Button type="submit" size="icon" aria-label="Send" disabled={busy || !draft.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
