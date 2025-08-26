// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');

const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const bcrypt = require('bcrypt');

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());            
app.use(express.urlencoded({ extended: true }));

// ---------- S3 Client ----------
const s3 = new S3Client({ region: process.env.AWS_REGION });

// ---------- Static ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- Pages ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'home.html'));
});

// product list
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'products.html'));
});

app.get('/product/:id', (req, res) => {
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

app.get('/admin/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages','management', 'admin_register.html'));
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


// ---------- API Products:id----------
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock, p.description, pi.image_url_main, pi.image_url_sub
      FROM products AS p
      LEFT JOIN product_image AS pi ON p.id = pi.product_id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = {
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      price: rows[0].price,
      stock: rows[0].stock,
      image_main: [],
      image_sub: []
    };

    rows.forEach(row => {
      if (row.image_url_main) product.image_main.push(row.image_url_main);
      if (row.image_url_sub) product.image_sub.push(row.image_url_sub);
    });

    res.json(product);
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




// ---------- API Admin Login ----------
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body; ว

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    const [rows] = await pool.query(
      `SELECT id, username, password_hash
       FROM users
       WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'ไม่พบ admin หรือสิทธิ์ไม่ถูกต้อง' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      adminId: admin.id,
      username: admin.username,
      role: admin.role
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Database query failed' });
  }
});




// ---------- API Admin Register ----------
app.post('/api/admin/register', async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (f_name, l_name, username, password_hash) VALUES (?, ?, ?, ?)`,
      [f_name, l_name, username, hash]
    );

    res.json({ message: 'Admin register successful' });
  } catch (err) {
    console.error("Admin Register error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username นี้มีผู้ใช้แล้ว' });
    } else {
      res.status(500).json({ error: 'Database query failed' });
    }
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