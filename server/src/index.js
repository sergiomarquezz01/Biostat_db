const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { Worker } = require('worker_threads');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '100mb' }));

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'biostats_db',
    connectionLimit: 20
});

// --- API ENDPOINTS ---

// Ingesta de archivos FASTA
app.post('/api/upload-fasta', upload.single('file'), async (req, res) => {
    try {
        const content = req.file.buffer.toString();
        const lines = content.split('\n');
        const identifier = lines[0].replace('>', '').trim();
        const sequence = lines.slice(1).join('').replace(/\s/g, '').toUpperCase();

        const [result] = await pool.execute(
            'INSERT INTO sequences (identifier, organism, sequence_data) VALUES (?, ?, ?)',
            [identifier, 'Importación FASTA', sequence]
        );
        res.json({ id: result.insertId, identifier });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sequences', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM sequences ORDER BY id DESC');
    res.json(rows);
});

app.post('/api/analyze/compare', async (req, res) => {
    const { idA, idB } = req.body;
    const [rows] = await pool.query('SELECT * FROM sequences WHERE id IN (?, ?)', [idA, idB]);
    if (rows.length < 2) return res.status(400).send("Faltan secuencias");

    const worker = new Worker(path.join(__dirname, 'workers/alignmentWorker.js'), {
        workerData: { seqA: rows[0].sequence_data, seqB: rows[1].sequence_data }
    });

    worker.on('message', async (score) => {
        await pool.execute(
            'INSERT INTO alignment_results (seq_a_id, seq_b_id, score, alignment_type) VALUES (?, ?, ?, ?)',
            [idA, idB, score, 'NW-Parallel']
        );
        res.json({ 
            similarityScore: score, 
            seqA: rows[0].sequence_data, 
            seqB: rows[1].sequence_data,
            compare: `${rows[0].identifier} vs ${rows[1].identifier}` 
        });
    });
});

app.get('/api/analyze/matrix', async (req, res) => {
    const [rows] = await pool.query('SELECT seq_a_id, seq_b_id, score FROM alignment_results');
    res.json(rows);
});

app.get('/api/stats', async (req, res) => {
    const [count] = await pool.query('SELECT COUNT(*) as total FROM sequences');
    const [avg] = await pool.query('SELECT AVG(score) as average FROM alignment_results');
    res.json({ totalSequences: count[0].total, averageAlignmentScore: avg[0].average || 0 });
});

app.get('/api/analyze/clusters', async (req, res) => {
    try {
            const [results] = await pool.query('SELECT seq_a_id, seq_b_id, score FROM alignment_results');
        const [sequences] = await pool.query('SELECT id, identifier FROM sequences');

        
        const clusters = [];
        const visited = new Set();

        sequences.forEach(seq => {
            if (!visited.has(seq.id)) {
                const cluster = [seq.identifier];
                visited.add(seq.id);

                results.forEach(rel => {
                    if (rel.seq_a_id === seq.id && rel.score > 50) {
                        const target = sequences.find(s => s.id === rel.seq_b_id);
                        if (target && !visited.has(target.id)) {
                            cluster.push(target.identifier);
                            visited.add(target.id);
                        }
                    }
                });
                if (cluster.length > 0) clusters.push(cluster);
            }
        });

        res.json(clusters);
    } catch (err) {
        res.status(500).json({ error: "Fallo en el motor de clustering" });
    }
});

app.listen(3000, () => console.log('🚀 BioStats Engine en puerto 3000'));