
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS operaciones (
                id SERIAL PRIMARY KEY,
                num1 REAL,
                num2 REAL,
                resultado REAL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tabla lista');
    } catch (error) {
        console.error('Error inicializando DB:', error);
        process.exit(1);
    }
}

app.post('/sumar', async (req, res) => {
    const { num1, num2 } = req.body;
    const resultado = num1 + num2;

    try {
        await pool.query(
            'INSERT INTO operaciones (num1, num2, resultado) VALUES ($1, $2, $3)',
            [num1, num2, resultado]
        );
        res.json({ resultado });
    } catch (error) {
        res.status(500).json({ error: 'Error guardando operación' });
    }
});

const PORT = process.env.PORT || 3000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
});
