import { createServerFn } from "@tanstack/react-start";

/**
 * Typed RPC boundary over the server-side document store. Feature `api.ts`
 * modules call these instead of importing demonstration data directly.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function validCollection(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new Error("A collection is required");
  return value;
}

function validId(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new Error("An id is required");
  return value;
}

async function store() {
  return await import("@/lib/store.server");
}

/** Reads every document in a collection. */
export const listCollection = createServerFn({ method: "GET" })
  .validator((input: { collection: string }) => ({
    collection: validCollection(input?.collection),
  }))
  .handler(async ({ data }) => {
    const { listDocs, isCollection } = await store();
    if (!isCollection(data.collection)) throw new Error("Unknown collection");
    return await listDocs<Json>(data.collection);
  });

/** Reads one document by id. */
export const getDocument = createServerFn({ method: "GET" })
  .validator((input: { collection: string; id: string }) => ({
    collection: validCollection(input?.collection),
    id: validId(input?.id),
  }))
  .handler(async ({ data }) => {
    const { getDoc, isCollection } = await store();
    if (!isCollection(data.collection)) throw new Error("Unknown collection");
    return await getDoc<Json>(data.collection, data.id);
  });

/** Shallow-merges changes into a document and returns the saved result. */
export const patchDocument = createServerFn({ method: "POST" })
  .validator((input: { collection: string; id: string; updates: Record<string, unknown> }) => {
    if (!input?.updates || typeof input.updates !== "object") {
      throw new Error("Updates are required");
    }
    return {
      collection: validCollection(input.collection),
      id: validId(input.id),
      updates: input.updates as Record<string, unknown>,
    };
  })
  .handler(async ({ data }) => {
    const { patchDoc, isCollection } = await store();
    if (!isCollection(data.collection)) throw new Error("Unknown collection");
    return (await patchDoc(data.collection, data.id, data.updates)) as Json;
  });

/** Creates or replaces a document. */
export const putDocument = createServerFn({ method: "POST" })
  .validator((input: { collection: string; id: string; data: unknown }) => ({
    collection: validCollection(input?.collection),
    id: validId(input?.id),
    data: input?.data ?? null,
  }))
  .handler(async ({ data }) => {
    const { putDoc, isCollection } = await store();
    if (!isCollection(data.collection)) throw new Error("Unknown collection");
    await putDoc(data.collection, data.id, data.data);
    return { ok: true as const };
  });
