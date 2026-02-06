export default function handler(req, res) {
    // 1) Configuração de CORS (Estrita: apenas POST/OPTIONS, sem Credentials)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2) OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3) Rejeitar métodos diferentes de POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 4) Parse e Normalização
    // Garantimos que body existe; extraímos email
    const { email: rawEmail } = req.body || {};

    // Validação básica: string não vazia
    if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
        return res.status(200).json({ active: false, reason: "missing_email" });
    }

    // Normalizar entrada: trim + lowercase
    const email = rawEmail.trim().toLowerCase();

    // 5) Allowlist (Normalizada)
    const allowedEmails = [
        "teste@volke.com",
        "grupomercuryclub@gmail.com" // Substituído conforme solicitado
    ].map(e => e.toLowerCase());

    // Verificar presença na lista
    if (allowedEmails.includes(email)) {
        return res.status(200).json({ active: true, plan: "mensal", expires_at: "2026-12-31" });
    }

    // Caso contrário, inativo
    return res.status(200).json({ active: false, reason: "inactive" });
}
