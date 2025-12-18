const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'biostats_db'
});

const BASE_SEQ = "ATGCGATCGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG"; // Secuencia real sería mucho más larga

function mutate(sequence, rate = 0.1) {
    const bases = ['A', 'T', 'C', 'G'];
    return sequence.split('').map(b => {
        return Math.random() < rate ? bases[Math.floor(Math.random() * 4)] : b;
    }).join('');
}

async function seed() {
    console.log("🚀 Iniciando ingesta masiva de datos...");
    try {
        const variants = [
            { name: 'Alpha-Variant', org: 'Virus' },
            { name: 'Beta-Variant', org: 'Virus' },
            { name: 'Delta-Variant', org: 'Virus' },
            { name: 'Omicron-UX', org: 'Virus' },
            { name: 'Gamma-Prime', org: 'Bacteria' },
            { name: 'Zeta-Cluster', org: 'Bacteria' },
            { name: 'Sigma-9', org: 'Virus' },
            { name: 'Mu-Variant', org: 'Virus' },
            { name: 'Lambda-Tech', org: 'Virus' },
            { name: 'Epsilon-X', org: 'Bacteria' }
        ];

        for (const v of variants) {
            const mutatedSeq = mutate(BASE_SEQ, 0.15); // 15% de mutación aleatoria
            await pool.execute(
                'INSERT INTO sequences (identifier, organism, sequence_data) VALUES (?, ?, ?)',
                [v.name, v.org, mutatedSeq]
            );
            console.log(`✅ Insertada: ${v.name}`);
        }

        console.log("⭐ Ingesta completada. Tu base de datos ahora tiene volumen.");
        process.exit();
    } catch (err) {
        console.error("❌ Error en seeding:", err);
        process.exit(1);
    }
}

seed();