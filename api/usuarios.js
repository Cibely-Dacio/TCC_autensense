const { createPool } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    const pool = createPool({ connectionString: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL });
    const sql = pool.sql;
    const metodo = req.method;

    if (metodo === "POST") {
        const acao = req.query.acao || req.body.acao || "";
        const nome = req.body.nome?.trim() || "";
        const email = req.body.email?.trim() || "";
        const senha = req.body.senha?.trim() || "";

        if (acao === "registrar") {
            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: true, mensagem: "Preencha todos os campos." });
            }

            try {
                const senhaHash = await bcrypt.hash(senha, 10);
                
                const result = await sql`
                    INSERT INTO usuarios (nome, email, senha) 
                    VALUES (${nome}, ${email}, ${senhaHash})
                    RETURNING id
                `;
                
                return res.status(200).json({
                    erro: false,
                    mensagem: "Conta criada com sucesso.",
                    usuario: { id: result.rows[0].id, nome, email }
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ erro: true, mensagem: "Erro ao criar conta." });
            }
        }

        if (acao === "login") {
            if (!email || !senha) {
                return res.status(400).json({ erro: true, mensagem: "Informe e-mail e senha." });
            }

            try {
                const result = await sql`SELECT id, nome, email, senha FROM usuarios WHERE email = ${email} LIMIT 1`;
                const usuario = result.rows[0];

                if (usuario && await bcrypt.compare(senha, usuario.senha)) {
                    return res.status(200).json({
                        erro: false,
                        mensagem: "Login realizado com sucesso.",
                        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
                    });
                } else {
                    return res.status(401).json({ erro: true, mensagem: "Senha incorreta ou usuário não encontrado." });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ erro: true, mensagem: "Erro no login." });
            }
        }
        
        if (acao === "recuperar") {
            return res.status(200).json({ erro: false, mensagem: "Solicitação recebida." });
        }
    }

    res.status(405).json({ erro: true, mensagem: "Método não permitido." });
};
