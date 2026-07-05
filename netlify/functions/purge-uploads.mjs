// Scheduled daily: delete uploaded photos older than 30 days (your "discard after 1 month" rule).
import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("uploads");
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  let removed = 0, kept = 0;
  try {
    const { blobs } = await store.list();
    for (const b of blobs) {
      try {
        const meta = await store.getMetadata(b.key);
        const d = meta && meta.metadata && meta.metadata.date ? Date.parse(meta.metadata.date) : null;
        if (d && d < cutoff) { await store.delete(b.key); removed++; } else { kept++; }
      } catch (e) { /* ignore individual */ }
    }
  } catch (e) { /* ignore */ }
  return new Response(`purged ${removed}, kept ${kept}`);
};

export const config = { schedule: "@daily" };
