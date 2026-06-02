const { Pool } = require('pg');

const pool = new Pool({ 
    connectionString: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
});

function sql(strings, ...values) {
    const text = strings.reduce((prev, curr, i) => prev + '$' + i + curr);
    return pool.query(text, values);
}

module.exports = async (req, res) => {
    const metodo = req.method;

    if (metodo === "GET") {
        try {
            const result = await sql`
                SELECT 
                    id, nome AS name, categoria AS cat, cidade AS city, 
                    endereco AS address, imagem AS image, ruido AS noise, 
                    iluminacao AS light, movimento AS flow, nivel_sensorial AS sensory, 
                    latitude AS lat, longitude AS lng
                FROM locais
                ORDER BY nome ASC
            `;
            
            const locais = result.rows.map(row => ({
                ...row,
                id: Number(row.id),
                noise: Number(row.noise),
                light: Number(row.light),
                flow: Number(row.flow),
                lat: parseFloat(row.lat),
                lng: parseFloat(row.lng)
            }));

            return res.status(200).json(locais);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: true, mensagem: 'Erro ao buscar locais: ' + error.message });
        }
    }
    
    res.status(405).json({ erro: true, mensagem: "Método não permitido." });
};
