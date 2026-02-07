// api/webhook.js
export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    // ✅ LastLink (payload que você mostrou)
    const email =
      body?.Data?.Buyer?.Email ||
      body?.data?.buyer?.email ||
      body?.buyer?.email ||
      body?.email;

    if (!email) {
      console.log("[WEBHOOK] Received:", JSON.stringify(body));
      console.log("[WEBHOOK] No email found");
      return res.status(400).json({ ok: false, error: "No email found" });
    }

    const event = body?.Event || body?.event || "";

    // Regra simples:
    // - eventos de aprovação/assinatura ativa = ativa
    // - eventos de reembolso/cancelamento/chargeback = desativa
    const deactivateEvents = new Set([
      "Refund_Period_Over",
      "Refunded",
      "Chargeback",
      "Chargeback_Started",
      "Subscription_Canceled",
      "Subscription_Expired",
      "Subscription_Suspended",
      "Subscription_Payment_Failed",
    ]);

    const activateEvents = new Set([
      "Purchase_Approved",
      "Subscription_Activated",
      "Subscription_Renewed",
      "Payment_Confirmed",
    ]);

    let active = null;

    if (deactivateEvents.has(event)) active = false;
    if (activateEvents.has(event)) active = true;

    // Se não reconhecer o evento, só loga e responde OK (pra não travar)
    if (active === null) {
      console.log("[WEBHOOK] Unhandled event:", event, "Email:", email);
      return res.status(200).json({ ok: true, received: true, email, event });
    }

    // ✅ Aqui é o ponto: você liga/desliga o usuário.
    // Como você está validando por email no /api/validate, o ideal é salvar em algum "banco".
    // (se estiver usando JSON/arquivo simples por enquanto, troca aqui).
    //
    // Por enquanto, só confirmando que chegou certo:
    console.log("[WEBHOOK] Email:", email, "Event:", event, "Set active:", active);

    return res.status(200).json({
      ok: true,
      email,
      event,
      active,
    });
  } catch (err) {
    console.error("[WEBHOOK] ERROR:", err);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}
