/**
 * Mark an element as readable by the Read Aloud layer.
 *
 * Only elements marked this way ever speak — this is what prevents the speech
 * engine from reading every nested span, icon or decorative container.
 *
 * <button {...speakable("Start assisted intake")}>Start intake →</button>
 */
export function speakable(text?: string, id?: string) {
  return {
    "data-speak": "",
    ...(text ? { "data-speak-text": text } : {}),
    ...(id ? { "data-speak-id": id } : {}),
  } as const;
}

/** Explicitly exclude a subtree from Read Aloud (raw IDs, logs, JSON payloads). */
export const notSpeakable = { "data-speak": "off" } as const;
