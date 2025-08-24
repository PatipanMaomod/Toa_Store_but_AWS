// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');

const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();

// ---------- S3 Client ----------
const s3 = new S3Client({ region: process.env.AWS_REGION });

// ---------- Static ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- Pages ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'home.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'product.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'checkout.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'upload.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages','management', 'admin_login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'login.html'));
});



app.get('/admin/management', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages','management', 'management.html'));
});



// ---------- API Products ----------
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price,p.stock ,p.description, pi.image_url_main, pi.image_url_sub
      FROM products AS p
      LEFT JOIN product_image AS pi ON p.id = pi.product_id
    `);

    const products = [];
    const map = {};

    rows.forEach(row => {
      if (!map[row.id]) {
        map[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          stock: row.stock,
          image_main: [],
          image_sub: []
        };
        products.push(map[row.id]);
      }

      if (row.image_url_main) map[row.id].image_main.push(row.image_url_main);
      if (row.image_url_sub) map[row.id].image_sub.push(row.image_url_sub);
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});




// ---------- API Upload Image to S3 ----------
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload-to-s3', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const key = `pro_images_S3/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    await s3.send(command);

    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});


// ---------- API Upload Multiple Images to S3 ----------
const uploadMany = multer({ storage: multer.memoryStorage() });

app.post('/api/upload-multiple-to-s3', uploadMany.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const key = `pro_images_S3/${Date.now()}-${file.originalname}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(command);

      const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      uploadedFiles.push({ fileName: file.originalname, url: publicUrl });
    }

    res.json({ uploaded: uploadedFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Multiple upload failed' });
  }
});








// ---------- Error Handlers ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'error.html'));
});

// ---------- Start ----------
const port = Number(process.env.PORT || 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
