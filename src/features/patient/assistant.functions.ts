import { createServerFn } from "@tanstack/react-start";

/** Pages the assistant is allowed to send a patient to. */
export const ASSISTANT_DESTINATIONS = {
  "/patient": "Home overview of the patient's care",
  "/patient/timeline": "Their health journey, visit by visit",
  "/patient/reports": "Reports a doctor has signed",
  "/patient/documents": "Files and photos they brought to the clinic",
  "/patient/intakes": "Answers they gave during check-in",
  "/patient/consents": "Consent and privacy choices",
  "/patient/profile": "Their details and preferences",
  "/patient/notifications": "Messages from the clinic",
  "/patient-kiosk": "Start a new check-in before seeing the doctor",
} as const;

export type AssistantDestination = keyof typeof ASSISTANT_DESTINATIONS;

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantReply {
  reply: string;
  goTo: AssistantDestination | null;
  goToLabel: string | null;
}

const SYSTEM = `You are the MediKiosk helper inside a patient's own health portal in an Indian clinic.
Help the patient find things, understand how the portal works, and wait comfortably for the doctor.
Rules:
- You MAY give basic, safe self-care guidance a nurse would give while waiting: rest, sip water, sit in a cool airy place, breathe slowly, eat light, avoid strain, use a clean cloth compress. Keep it general and safe.
- You MUST NOT diagnose, name or dose any medicine (not even common ones), or say how serious something is. Always add that the doctor will check them soon.
- If symptoms sound urgent (chest pain, trouble breathing, fainting, heavy bleeding, seizures, sudden severe pain), tell them calmly to alert the clinic staff right now instead of waiting.
- If they ask when the doctor will see them, say the staff at the front desk knows the exact timing and the doctor will attend to them as soon as possible. Do not invent times.
- Reply in the same language the patient used (English or Hindi). Keep it under 60 words, warm and simple.
- When a page in the portal answers their need, set goTo to that exact path. If they describe new symptoms, offer /patient-kiosk to record them at check-in.
Pages:
${Object.entries(ASSISTANT_DESTINATIONS)
  .map(([path, what]) => `${path} — ${what}`)
  .join("\n")}
Answer as JSON: {"reply": string, "goTo": string|null, "goToLabel": string|null}. goToLabel is a short button label like "Open my reports" in the patient's language.`;

export const askPatientAssistant = createServerFn({ method: "POST" })
  .validator((input: { message: string; history?: AssistantTurn[] }) => {
    const message = String(input?.message ?? "")
      .trim()
      .slice(0, 1000);
    if (!message) throw new Error("Please type or say something first.");
    const history = Array.isArray(input.history) ? input.history.slice(-8) : [];
    return { message, history };
  })
  .handler(async ({ data }): Promise<AssistantReply> => {
    const key = process.env["GROQ_API_KEY"];
    if (!key) throw new Error("The helper is not available right now. Please configure GROQ_API_KEY.");

    const models = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
    let response: Response | null = null;
    for (const model of models) {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            ...data.history.map((turn) => ({ role: turn.role, content: turn.content })),
            { role: "user", content: data.message },
          ],
        }),
      });
      if (response.ok) break;
      if (response.status !== 404 && response.status !== 429) break;
    }

    if (!response || !response.ok) {
      if (response?.status === 429)
        throw new Error("The helper is busy. Please try again in a moment.");
      throw new Error("The helper could not answer just now.");
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    let parsed: Partial<AssistantReply> = {};
    try {
      parsed = JSON.parse(raw) as Partial<AssistantReply>;
    } catch {
      parsed = { reply: raw };
    }

    const goTo =
      typeof parsed.goTo === "string" && parsed.goTo in ASSISTANT_DESTINATIONS
        ? (parsed.goTo as AssistantDestination)
        : null;

    return {
      reply:
        (parsed.reply ?? "").trim() ||
        "I am not sure about that one. You can ask the front desk for help.",
      goTo,
      goToLabel: goTo ? parsed.goToLabel?.trim() || "Open this page" : null,
    };
  });
