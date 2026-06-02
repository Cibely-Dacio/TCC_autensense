const { createPool } = require('@vercel/postgres');

module.exports = async (req, res) => {
    const pool = createPool({ connectionString: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL });
    const sql = pool.sql;
    const metodo = req.method;

    if (metodo === "GET") {
        const usuario_id = Number(req.query.usuario_id);
        if (!usuario_id) return res.status(200).json([]);

        try {
            const result = await sql`
                SELECT f.id, f.usuario_id, f.local_id, 
                       l.nome AS local_nome, l.categoria, l.endereco, l.imagem
                FROM favoritos f
                INNER JOIN locais l ON l.id = f.local_id
                WHERE f.usuario_id = ${usuario_id}
                ORDER BY f.criado_em DESC
            `;
            
            const favoritos = result.rows.map(row => ({
                ...row,
                id: Number(row.id),
                usuario_id: Number(row.usuario_id),
                local_id: Number(row.local_id)
            }));
            
            return res.status(200).json(favoritos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao buscar favoritos." });
        }
    }

    if (metodo === "POST") {
        const usuario_id = Number(req.body.usuario_id);
        const local_id = Number(req.body.local_id);

        if (!usuario_id || !local_id) {
            return res.status(400).json({ erro: true, mensagem: "Dados inválidos." });
        }

        try {
            const result = await sql`
                INSERT INTO favoritos (usuario_id, local_id) 
                VALUES (${usuario_id}, ${local_id})
                RETURNING id
            `;
            return res.status(200).json({ erro: false, mensagem: "Favorito salvo.", id: result.rows[0].id });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao salvar favorito." });
        }
    }

    if (metodo === "DELETE") {
        const usuario_id = Number(req.body.usuario_id);
        const local_id = Number(req.body.local_id);

        if (!usuario_id || !local_id) {
            return res.status(400).json({ erro: true, mensagem: "Dados inválidos." });
        }

        try {
            await sql`
                DELETE FROM favoritos 
                WHERE usuario_id = ${usuario_id} AND local_id = ${local_id}
            `;
            return res.status(200).json({ erro: false, mensagem: "Favorito removido." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao remover favorito." });
        }
    }

    res.status(405).json({ erro: true, mensagem: "Método não permitido." });
};
