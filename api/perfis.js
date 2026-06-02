const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    const metodo = req.method;

    if (metodo === "GET") {
        const usuario_id = Number(req.query.usuario_id) || 0;

        try {
            let result;
            if (usuario_id > 0) {
                result = await sql`SELECT * FROM perfis WHERE usuario_id = ${usuario_id} ORDER BY criado_em DESC`;
            } else {
                result = await sql`SELECT * FROM perfis ORDER BY criado_em DESC`;
            }
            
            const perfis = result.rows.map(row => ({
                ...row,
                id: Number(row.id),
                usuario_id: row.usuario_id ? Number(row.usuario_id) : null,
                idade: row.idade ? Number(row.idade) : null,
                sensibilidade_ruido: Number(row.sensibilidade_ruido),
                sensibilidade_luz: Number(row.sensibilidade_luz),
                sensibilidade_movimento: Number(row.sensibilidade_movimento)
            }));
            
            return res.status(200).json(perfis);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao buscar perfis." });
        }
    }

    if (metodo === "POST") {
        const usuario_id = req.body.usuario_id ? Number(req.body.usuario_id) : null;
        const nome = (req.body.nome || "").trim();
        const idade = req.body.idade ? Number(req.body.idade) : null;
        const nivel_suporte = (req.body.nivel_suporte || "").trim();
        const sensibilidade_ruido = Number(req.body.sensibilidade_ruido) || 3;
        const sensibilidade_luz = Number(req.body.sensibilidade_luz) || 3;
        const sensibilidade_movimento = Number(req.body.sensibilidade_movimento) || 3;
        const observacoes = (req.body.observacoes || "").trim();

        if (!nome) {
            return res.status(400).json({ erro: true, mensagem: "Informe o nome do perfil." });
        }

        try {
            const result = await sql`
                INSERT INTO perfis (usuario_id, nome, idade, nivel_suporte, sensibilidade_ruido, sensibilidade_luz, sensibilidade_movimento, observacoes)
                VALUES (${usuario_id}, ${nome}, ${idade}, ${nivel_suporte}, ${sensibilidade_ruido}, ${sensibilidade_luz}, ${sensibilidade_movimento}, ${observacoes})
                RETURNING id
            `;
            return res.status(200).json({ erro: false, mensagem: "Perfil salvo com sucesso.", id: result.rows[0].id });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: "Erro ao salvar perfil." });
        }
    }

    res.status(405).json({ erro: true, mensagem: "Método não permitido." });
};
