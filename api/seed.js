process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { Pool } = require('pg');

const pool = new Pool({ 
    connectionString: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

function sql(strings, ...values) {
    const text = strings.reduce((prev, curr, i) => prev + '$' + i + curr);
    return pool.query(text, values);
}

// Map strings to the database values
const catMap = {
    'Mercado /': 'mercado',
    'Shopping': 'shopping',
    'Cultural /': 'cultural',
    'Parque': 'parque',
    'Infantil /': 'infantil',
    'Natureza /': 'natureza',
    'Gastronomia': 'gastronomia',
    'Especializ': 'especializado'
};

const sensMap = {
    'Tranquilo': { level: 'baixo', val: 1 },
    'Moderado': { level: 'medio', val: 2 },
    'Alerta': { level: 'alto', val: 3 }
};

const places = [
  ['Mercado /', 'Carrefour Ponta Negra', 'Alerta', -3.09229, -60.0499],
  ['Mercado /', 'Carrefour Flores', 'Alerta', -3.10413, -60.0114],
  ['Mercado /', 'Assai- Atacadista', 'Alerta', -3.05458, -60.0233],
  ['Mercado /', 'Atack Hipermercado', 'Alerta', -3.0421, -60.0088],
  ['Mercado /', 'Nova Era Flores', 'Moderado', -3.08985, -60.0556],
  ['Mercado /', 'Nova Era Grande Circular', 'Moderado', -3.06588, -59.9905],
  ['Mercado /', 'DB Supermercados', 'Moderado', -3.08888, -60.0056],
  ['Mercado /', 'DB Supermercados Nova Cidade', 'Moderado', -3.05042, -59.9901],
  ['Mercado /', 'Vitoria Supermercados', 'Moderado', -3.0832, -59.9779],
  ['Shopping', 'Manauara Shopping', 'Alerta', -3.10413, -60.0114],
  ['Shopping', 'Amazonas Shopping', 'Alerta', -3.09434, -60.0225],
  ['Shopping', 'Shopping Ponta Negra', 'Moderado', -3.08459, -60.0724],
  ['Shopping', 'Sumauma Park Shopping', 'Moderado', -3.03019, -59.9781],
  ['Shopping', 'Millennium Shopping', 'Moderado', -3.09954, -60.0265],
  ['Shopping', 'Studio 5 Shopping', 'Moderado', -3.12482, -59.9831],
  ['Shopping', 'Via Norte Shopping', 'Moderado', -2.99998, -60.002],
  ['Cultural /', 'Teatro Amazonas', 'Moderado', -3.13028, -60.0234],
  ['Cultural /', 'Palácio da Justiça', 'Tranquilo', -3.13024, -60.0244],
  ['Cultural /', 'Palacete Provincial', 'Tranquilo', -3.13555, -60.021],
  ['Cultural /', 'Centro Cultural dos Povos da Amazônia', 'Tranquilo', -3.133, -59.9875],
  ['Cultural /', 'Largo São Sebastião', 'Moderado', -3.13033, -60.0225],
  ['Cultural /', 'Mercado Municipal Adolpho Lisboa', 'Alerta', -3.13995, -60.0236],
  ['Cultural /', 'Porto de Manaus', 'Alerta', -5.65322, -62.226],
  ['Cultural /', 'Centro Histórico de Manaus', 'Moderado', -3.13384, -60.0297],
  ['Parque', 'Parque do Mindu', 'Moderado', -3.10233, -60.0254],
  ['Parque', 'Praça da Saudade', 'Tranquilo', -3.12751, -60.0259],
  ['Parque', 'Praça Heliodoro Balbi', 'Tranquilo', -3.13513, -60.0215],
  ['Parque', 'Praça do Congresso', 'Tranquilo', -3.12852, -60.0241],
  ['Parque', 'Parque Rio Negro', 'Moderado', -3.12913, -60.0359],
  ['Parque', 'Parque Gigantes da Floresta', 'Alerta', -3.04856, -59.9474],
  ['Infantil /', 'Parque da Criança', 'Moderado', -3.10388, -60.0016],
  ['Infantil /', 'Magic Games (Manauara Shopping)', 'Alerta', -3.10413, -60.0114],
  ['Infantil /', 'Cinemark', 'Alerta', -3.10413, -60.0114],
  ['Infantil /', 'Cinepolis', 'Moderado', -3.0846, -60.0724],
  ['Natureza /', 'Bosque da Ciência', 'Tranquilo', -3.09743, -59.9877],
  ['Natureza /', 'MUSA (Museu da Amazônia)', 'Tranquilo', -3.0072, -59.9399],
  ['Natureza /', 'Reserva Florestal Adolpho Ducke', 'Tranquilo', -2.96255, -59.9229],
  ['Natureza /', 'Zoologico do CIGS', 'Moderado', -3.10178, -60.0451],
  ['Natureza /', 'Museu da Amazonia', 'Tranquilo', -3.00719, -59.9399],
  ['Natureza /', 'Museu do Seringal Vila Paraíso', 'Tranquilo', -3.13308, -59.9873],
  ['Natureza /', 'Encontro das Águas', 'Moderado', -3.11885, -59.8927],
  ['Gastronomia', 'Café Regional Priscila', 'Tranquilo', -3.05559, -60.0825],
  ['Gastronomia', 'Café do Pina', 'Tranquilo', -3.13479, -60.0222],
  ['Gastronomia', 'Cucina Borges', 'Tranquilo', -3.10481, -60.0171],
  ['Gastronomia', 'Recanto do Sabor', 'Tranquilo', -3.05695, -60.0268],
  ['Gastronomia', 'Coco Bambu', 'Moderado', -3.08198, -60.0691],
  ['Gastronomia', 'Choupana Restaurante', 'Moderado', -3.10862, -60.013],
  ['Gastronomia', 'Banzeiro', 'Moderado', -3.11227, -60.0169],
  ['Gastronomia', 'Caxiri', 'Moderado', -3.12989, -60.0225],
  ['Gastronomia', 'Loppiano', 'Moderado', -3.11755, -60.0168],
  ['Gastronomia', 'Praça de Alimentação Manauara Shopping', 'Alerta', -3.10413, -60.0114],
  ['Gastronomia', 'Praça de Alimentação Amazonas Shopping', 'Alerta', -3.09434, -60.0225],
  ['Gastronomia', 'Bar do Armando', 'Alerta', -3.1299, -60.0222],
  ['Especializ', 'EAMAAR - Espaço de Atendimento Multidisciplinar', 'Tranquilo', -3.07249, -60.0482],
  ['Especializ', 'Centro de Reabilitação Integral', 'Tranquilo', -3.08219, -60.0186],
  ['Especializ', 'Instituto Autismo no Amazonas', 'Tranquilo', -3.08245, -60.0171],
  ['Especializ', 'AMUA associação das mães unidas pelo autismo', 'Tranquilo', -3.01734, -60.0416],
  ['Especializ', 'Casa Azul', 'Tranquilo', -3.09402, -60.0392]
];

module.exports = async (req, res) => {
    try {
        let count = 0;
        for (const [catRaw, nome, sensRaw, lat, lng] of places) {
            const cat = catMap[catRaw] || 'mercado';
            const sens = sensMap[sensRaw];
            
            // Check if place already exists
            const existing = await sql\`SELECT id FROM locais WHERE nome = \${nome}\`;
            if (existing.rowCount === 0) {
                await sql\`
                  INSERT INTO locais (
                    nome, categoria, cidade, endereco, 
                    imagem, ruido, iluminacao, movimento, 
                    nivel_sensorial, latitude, longitude
                  ) VALUES (
                    \${nome}, \${cat}, 'Manaus', '', 
                    '', \${sens.val}, \${sens.val}, \${sens.val}, 
                    \${sens.level}, \${lat}, \${lng}
                  )
                \`;
                count++;
            }
        }
        return res.status(200).json({ sucesso: true, inseridos: count, mensagem: "Seed completo!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: true, mensagem: error.message });
    }
};
