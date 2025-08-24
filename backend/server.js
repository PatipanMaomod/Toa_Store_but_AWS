// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '..', 'frontend')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'index.html'));
// });
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'management', 'management.html'));
});



// API products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.description, pi.image_url_main
      FROM products AS p
      JOIN product_image AS pi ON p.id = pi.product_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


// middleware error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// middleware 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'error.html'));
});

/* ---------- START ---------- */
const port = Number(process.env.PORT || 4000);
app.listen(4000, "0.0.0.0", () => {
  console.log("Server running");
});