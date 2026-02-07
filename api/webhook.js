// api/webhook.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Chave padronizada no KV
const keyForEmail = (email) => `volkespy:user:${String(email || "").trim().toLowerCase()}`;

// Quais eventos liberam acesso
const ACTIVATE_EVENTS = new Set([
  "Purchase_Confirmed",
  "Subscription_Active",
  "Recurrent_Payment",
  "Subscription_Renewal_Confirmed",
  "Subscription_Product_Access",
]);

// Quais eventos cortam acesso
const DEACTIVATE_EVENTS = new Set([
  "Refund_Requested",
  "Refund_Period_Over",
  "Purchase_Canceled",
  "Subscription_Canceled",
  "Subscription_Expired",
  "Purchase_Request_Expired",
]);

export default async function handler(req, res) {
  try {
    // Lastlink normalmente envia POST
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    // (Opcional, recomendado) Proteção por token:
    // 1) Crie uma ENV na Vercel: LASTLINK_WEBHOOK_TOKEN = (o token que aparece na Lastlink)
    // 2) Faça a Lastlink enviar esse token no header Authorization: Bearer <token>
    // Se você não conseguir configurar header na Lastlink agora, comente este bloco.
    const requiredToken = process.env.LASTLINK_WEBHOOK_TOKEN;
    if (requiredToken) {
      const auth = req.headers.authorization || "";
      const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (bearer !== requiredToken) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }
    }

    const payload = req.body || {};
    const event = payload.Event;
    const email = payload?.Data?.Buyer?.Email;

    console.log("[WEBHOOK] Received event:", event);
    console.log("[WEBHOOK] Buyer email:", email);

    if (!email) {
      console.log("[WEBHOOK] No email found");
      return res.status(400).json({ ok: false, error: "No email found" });
    }

    // Teste da Lastlink: você pode escolher ignorar ou processar
    // Eu recomendo PROCESSAR mesmo em teste, mas marcando isTest no log.
    const isTest = Boolean(payload.IsTest);
    if (isTest) console.log("[WEBHOOK] IsTest = true");

    const key = keyForEmail(email);

    if (ACTIVATE_EVENTS.has(event)) {
      // Guarda dados úteis (pode expandir depois)
      await redis.set(key, {
        active: true,
        source: "lastlink",
        event,
        updated_at: new Date().toISOString(),
      });
      console.log("[WEBHOOK] Activated:", email);
      return res.status(200).json({ ok: true, active: true });
    }

    if (DEACTIVATE_EVENTS.has(event)) {
      await redis.set(key, {
        active: false,
        source: "lastlink",
        event,
        updated_at: new Date().toISOString(),
      });
      console.log("[WEBHOOK] Deactivated:", email);
      return res.status(200).json({ ok: true, active: false });
    }

    // Evento não mapeado: não quebra, só loga.
    console.log("[WEBHOOK] Unhandled event:", event, "Email:", email);
    return res.status(200).json({ ok: true, ignored: true, event });
  } catch (err) {
    console.error("[WEBHOOK] ERROR:", err);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}
