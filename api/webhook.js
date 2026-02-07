export default async function handler(req, res) {
  // LastLink vai chamar via POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    // DEBUG: veja o que chega (aparece em Vercel > Logs)
    console.log("[WEBHOOK] Received:", JSON.stringify(body));

    // Tenta achar email em campos comuns
    const email =
      body?.customer?.email ||
      body?.buyer?.email ||
      body?.user?.email ||
      body?.email ||
      body?.data?.customer?.email ||
      body?.data?.buyer?.email;

    if (!email) {
      console.log("[WEBHOOK] No email found");
      return res.status(400).json({ ok: false, error: "Email not found in payload" });
    }

    // Status do evento (vamos ajustar pra LastLink depois)
    // Por enquanto: qualquer evento recebido "marca ativo true"
    // (só pra testar o fluxo end-to-end)
    const active = true;

    // Aqui você faria: salvar em banco/kv/planilha
    // Por enquanto só loga:
    console.log(`[WEBHOOK] email=${email} -> active=${active}`);

    return res.status(200).json({ ok: true, email, active });
  } catch (err) {
    console.error("[WEBHOOK] ERROR:", err);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}
