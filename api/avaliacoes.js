const { createPool } = require('@vercel/postgres');

module.exports = async (req, res) => {
    const pool = createPool({ connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL });
    const sql = pool.sql;
    const metodo = req.method;

    if (metodo === "GET") {
        const usuario_id = Number(req.query.usuario_id) || 0;

        try {
            let result;
            if (usuario_id > 0) {
                result = await sql`
                    SELECT a.id, a.usuario_id, a.local_id, l.nome AS local_nome,
                           a.ruido, a.iluminacao, a.movimento, a.comentario, a.criado_em
                    FROM avaliacoes a
                    INNER JOIN locais l ON l.id = a.local_id
                    WHERE a.usuario_id = ${usuario_id}
                    ORDER BY a.criado_em DESC
                `;
            } else {
                result = await sql`
                    SELECT a.id, a.usuario_id, a.local_id, l.nome AS local_nome,
                           a.ruido, a.iluminacao, a.movimento, a.comentario, a.criado_em
                    FROM avaliacoes a
                    INNER JOIN locais l ON l.id = a.local_id
                    ORDER BY a.criado_em DESC
                `;
            }
            
            const avaliacoes = result.rows.map(row => ({
                ...row,
                id: Number(row.id),
                usuario_id: row.usuario_id ? Number(row.usuario_id) : null,
                local_id: Number(row.local_id),
                ruido: Number(row.ruido),
                iluminacao: Number(row.iluminacao),
                movimento: Number(row.movimento)
            }));
            
            return res.status(200).json(avaliacoes);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao buscar avaliações." });
        }
    }

    if (metodo === "POST") {
        const usuario_id = req.body.usuario_id ? Number(req.body.usuario_id) : null;
        const local_id = Number(req.body.local_id) || 0;
        const ruido = Number(req.body.ruido) || 3;
        const iluminacao = Number(req.body.iluminacao) || 3;
        const movimento = Number(req.body.movimento) || 3;
        const comentario = (req.body.comentario || "").trim();

        if (local_id <= 0) {
            return res.status(400).json({ erro: true, mensagem: "Local inválido." });
        }

        try {
            const result = await sql`
                INSERT INTO avaliacoes (usuario_id, local_id, ruido, iluminacao, movimento, comentario)
                VALUES (${usuario_id}, ${local_id}, ${ruido}, ${iluminacao}, ${movimento}, ${comentario})
                RETURNING id
            `;
            return res.status(200).json({ erro: false, mensagem: "Avaliação salva com sucesso.", id: result.rows[0].id });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao salvar avaliação." });
        }
    }

    res.status(405).json({ erro: true, mensagem: "Método não permitido." });
};
