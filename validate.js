export default function handler(req, res) {
    // 1) Configuração de CORS (Atualizado para permitir GET)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2) OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3) Extração do email conforme o método
    let rawEmail;

    if (req.method === 'GET') {
        rawEmail = req.query.email;
    } else if (req.method === 'POST') {
        const { email } = req.body || {};
        rawEmail = email;
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 4) Validação comum
    // Validação básica: string não vazia
    if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
        return res.status(200).json({ active: false, reason: "missing_email" });
    }

    // Normalizar entrada: trim + lowercase
    const email = rawEmail.trim().toLowerCase();

    // 5) Allowlist (Normalizada)
    const allowedEmails = [
        "teste@volke.com",
        "grupomercuryclub@gmail.com"
    ].map(e => e.toLowerCase());

    // Verificar presença na lista
    if (allowedEmails.includes(email)) {
        return res.status(200).json({ active: true, plan: "mensal", expires_at: "2026-12-31" });
    }

    // Caso contrário, inativo
    return res.status(200).json({ active: false, reason: "inactive" });
}
