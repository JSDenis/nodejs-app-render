require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table initialized');
};
initDB();

app.get('/', (req, res) => {
  res.send('Hello from Render + PostgreSQL!');
});

app.post('/items', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query(
    'INSERT INTO items(name) VALUES($1) RETURNING *',
    [name]
  );
  res.json(result.rows[0]);
});

app.get('/items', async (req, res) => {
  const result = await pool.query('SELECT * FROM items ORDER BY id DESC');
  res.json(result.rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));