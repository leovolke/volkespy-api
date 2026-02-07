// api/validate.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const keyForEmail = (email) => `volkespy:user:${String(email || "").trim().toLowerCase()}`;

export default async function handler(req, res) {
  try {
    let email = "";

    if (req.method === "GET") {
      email = req.query?.email || "";
    } else if (req.method === "POST") {
      email = req.body?.email || "";
    } else {
      return res.status(405).json({ active: false, error: "Method not allowed" });
    }

    email = String(email).trim().toLowerCase();
    if (!email) return res.status(400).json({ active: false, error: "Missing email" });

    const key = keyForEmail(email);
    const record = await redis.get(key);

    // Se não tem nada no KV, considera inativo
    if (!record) {
      return res.status(200).json({ active: false });
    }

    // record pode ser objeto {active:true...} (como setamos no webhook)
    const active = record?.active === true;

    return res.status(200).json({
      active,
      source: record?.source || "kv",
      updated_at: record?.updated_at || null,
    });
  } catch (err) {
    console.error("[VALIDATE] ERROR:", err);
    return res.status(500).json({ active: false, error: "Internal error" });
  }
}
