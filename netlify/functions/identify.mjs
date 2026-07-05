// Photo -> plant identification -> match against the guide -> notify maintainer of misses.
// Env vars (set in Netlify > Site settings > Environment variables):
//   PLANTNET_API_KEY  (required)  get a free key at https://my.plantnet.org
//   RESEND_API_KEY    (optional, for the "missing plant" email) https://resend.com
//   NOTIFY_EMAIL      (optional, default mabroukbilel@gmail.com)
//   NOTIFY_FROM       (optional, default onboarding@resend.dev)
// URL is provided automatically by Netlify (your deployed site origin).
import { getStore } from "@netlify/blobs";

const PLANTNET = "https://my-api.plantnet.org/v2/identify/all";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
function norm(s) {
  return (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
function genusSpecies(sci) {
  return norm(sci).split(/\s+/).slice(0, 2).join(" ");
}

async function findInGuide(origin, sci) {
  try {
    const r = await fetch(`${origin}/search-index.json`);
    const list = await r.json();
    const target = genusSpecies(sci);
    for (const p of list) {
      if (genusSpecies(p.sci) === target) {
        return { name: p.en, sci: p.sci, slug: p.s };
      }
    }
  } catch (e) { /* ignore */ }
  return null;
}

async function notify(sci, common, score, file) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL || "mabroukbilel@gmail.com";
  const from = process.env.NOTIFY_FROM || "Flora of Tunisia <onboarding@resend.dev>";
  if (!apiKey) return;
  let attachments = [];
  try {
    const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    attachments = [{ filename: "uploaded.jpg", content: b64 }];
  } catch (e) { /* ignore */ }
  const html = `<h2>Missing plant reported</h2>
    <p>A visitor uploaded a photo that is <b>not yet in the guide</b>.</p>
    <ul>
      <li><b>Best match:</b> ${common ? common + " — " : ""}<i>${sci}</i></li>
      <li><b>Confidence:</b> ${(score * 100).toFixed(0)}%</li>
      <li><b>When:</b> ${new Date().toISOString()}</li>
    </ul>
    <p>Consider adding it: create a new build/plants/pNNN.json, run fetch_photos, and rebuild.</p>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, subject: `Missing plant: ${sci}`, html, attachments }),
    });
  } catch (e) { /* ignore */ }
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const key = process.env.PLANTNET_API_KEY;
  if (!key) return json({ error: "server not configured (PLANTNET_API_KEY missing)" }, 500);

  let form;
  try { form = await req.formData(); } catch (e) { return json({ error: "bad form" }, 400); }
  const file = form.get("image");
  const lang = (form.get("lang") || "en").toString();
  if (!file || typeof file === "string") return json({ error: "no image" }, 400);

  // 1) identify with Pl@ntNet
  let sci = null, common = null, score = 0;
  try {
    const pn = new FormData();
    pn.append("images", file, "photo.jpg");
    pn.append("organs", "auto");
    const r = await fetch(`${PLANTNET}?api-key=${encodeURIComponent(key)}&lang=${encodeURIComponent(lang)}&nb-results=5`, { method: "POST", body: pn });
    const d = await r.json();
    if (d && Array.isArray(d.results) && d.results.length) {
      const top = d.results[0];
      sci = top.species && top.species.scientificNameWithoutAuthor;
      common = top.species && top.species.commonNames && top.species.commonNames[0];
      score = top.score || 0;
    }
  } catch (e) { return json({ error: "identification failed" }, 502); }
  if (!sci) return json({ error: "no identification" });

  const origin = process.env.URL || new URL(req.url).origin;

  // 2) store the upload (auto-purged after ~1 month by purge-uploads.mjs)
  try {
    const store = getStore("uploads");
    const buf = new Uint8Array(await file.arrayBuffer());
    await store.set(`${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`, buf,
      { metadata: { date: new Date().toISOString(), sci, score } });
  } catch (e) { /* blobs optional */ }

  // 3) match against the guide
  const match = await findInGuide(origin, sci);
  if (match) return json({ match });

  // 4) not in the guide -> email the maintainer
  await notify(sci, common, score, file);
  return json({ online: { name: common || sci, sci } });
};
