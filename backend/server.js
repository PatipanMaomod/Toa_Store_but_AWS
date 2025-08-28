// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();




// ---------- Session Middleware ----------
app.use(session({
  key: 'sessionId',
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true ถ้าใช้ https
    // maxAge: 1000 * 60 * 60 // 1 ชั่วโมง
    maxAge: 1000 * 60 // 1 นาที

  }
}));

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
function requireAdmin(req, res, next) {
  if (req.session && req.session.role === "admin") {
    next(); 
  } else {
    res.redirect("/admin/login");   // ไปหน้า login
  }
}
function requireLogin(req, res, next) {
  if (!req.session.customerId) {
    return res.status(440).json({ error: "Session expired" }); // 440: Login Timeout
  }
  next();
}

// ---------- S3 Client ----------
const s3 = new S3Client({ region: process.env.AWS_REGION });

// ---------- Static ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'home.html'));
});

app.get('/header', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'management', 'header.html'));
});
app.get('/admin/header', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'management', 'admin_header.html'));
});


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
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'management', 'admin_login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'login.html'));
});

app.get('/api/customers/me', (req, res) => {
  if (!req.session.customerId) return res.status(401).json({ error: "Not logged in" });
  res.json({
    customerId: req.session.customerId,
    email: req.session.email,
    firstName: req.session.firstName
  });
});

app.get('/api/admin/me', (req, res) => {
  if (!req.session.adminId || req.session.role !== "admin") {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({
    adminId: req.session.adminId,
    username: req.session.username,
    role: req.session.role
  });
});

app.post('/api/customers/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sessionId");
    res.json({ message: "Logout success" });
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sessionId");
    res.json({ message: "Logout success" });
  });
});

app.get('/admin/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'management', 'admin_register.html'));
});

app.get("/admin/management", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "pages", "management", "management.html"));
});

app.get('/admin/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'management', 'admin_product.html'));
});
app.get('/admin/products', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'management', 'admin_products.html'));
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

// ---------- API Create Product ----------
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock)
       VALUES (?, ?, ?, ?)`,
      [name, description, price, stock]
    );

    res.json({
      message: 'Product created successfully',
      id: result.insertId   //ส่ง id กลับไป
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
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


// ---------- API Update Product ----------
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?
       WHERE id = ?`,
      [name, description, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed' });
  }
});



// ---------- API Upload Product Images ----------
app.put('/api/products/img/upload/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url_main } = req.body; // รับ array ของ URL

    const insertPromises = image_url_main.map(url =>
      pool.query(
        `INSERT INTO product_image (product_id, image_url_main) VALUES (?, ?)`,
        [id, url]
      )
    );

    await Promise.all(insertPromises);

    res.json({ message: 'Product images updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed' });
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

// ---------- API Delete Product Image ----------
app.delete('/api/products/img/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { urls } = req.body; // array ของ url

    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "urls ต้องเป็น array" });
    }

    for (const url of urls) {
      await pool.query(
        `DELETE FROM product_image WHERE product_id = ? AND image_url_main = ?`,
        [id, url]
      );
    }

    res.json({ message: "Images deleted successfully", deleted: urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
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
  const { username, password } = req.body;

  const [rows] = await pool.query(
    `SELECT id, username, password_hash, role FROM users WHERE username = ?`,
    [username]
  );

  if (rows.length === 0) return res.status(401).json({ error: "ไม่พบ admin" });

  const admin = rows[0];
  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });

  // เก็บ session
  req.session.adminId = admin.id;
  req.session.username = admin.username;
  req.session.role = admin.role || "admin";

  res.json({
    message: "เข้าสู่ระบบสำเร็จ",
    adminId: admin.id,
    username: admin.username,
    role: admin.role || "admin"
  });
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


// ---------- API Login (Customer) ----------
app.post('/api/customers/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query(
    "SELECT id, first_name, last_name, email, password FROM customers WHERE email = ?",
    [username]
  );
  if (rows.length === 0) return res.status(401).json({ error: "ไม่พบลูกค้า" });

  const customer = rows[0];
  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });

  // สร้าง session
  req.session.customerId = customer.id;
  req.session.email = customer.email;
  req.session.firstName = customer.first_name;

  res.json({
    message: "เข้าสู่ระบบสำเร็จ",
    customerId: customer.id,
    email: customer.email,
    firstName: customer.first_name,
    lastName: customer.last_name
  });
});

// ---------- API Register (Customer) ----------
app.post('/api/customers/register', async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO customers (first_name, last_name, email, password) 
       VALUES (?, ?, ?, ?)`,
      [f_name, l_name, username, hash]
    );

    res.json({ message: 'Customer register successful' });
  } catch (err) {
    console.error("Customer Register error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username นี้มีผู้ใช้แล้ว' });
    } else {
      res.status(500).json({ error: 'Database query failed' });
    }
  }
});





// ---------- API Add to Cart ----------
app.post('/api/cart', async (req, res) => {
  if (!req.session.customerId) {
    return res.status(401).json({ error: 'Please login to add items to cart' });
  }

  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid product ID or quantity' });
  }

  try {
    // Check if product exists and has enough stock
    const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE customer_id = ? AND product_id = ?',
      [req.session.customerId, product_id]
    );

    if (existing.length > 0) {
      // Update quantity if item exists
      const newQuantity = existing[0].quantity + quantity;
      if (product[0].stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for updated quantity' });
      }
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.session.customerId, product_id, quantity]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// ---------- API Get Cart Items ----------
app.get('/api/cart', async (req, res) => {
  if (!req.session.customerId) {
    return res.status(401).json({ error: 'Please login to view cart' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.stock, pi.image_url_main
      FROM cart c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_image pi ON p.id = pi.product_id
      WHERE c.customer_id = ?
    `, [req.session.customerId]);

    const cartItems = [];
    const map = {};

    rows.forEach(row => {
      if (!map[row.id]) {
        map[row.id] = {
          cart_id: row.id,
          product_id: row.product_id,
          name: row.name,
          price: row.price,
          stock: row.stock,
          quantity: row.quantity,
          image_main: []
        };
        cartItems.push(map[row.id]);
      }

      if (row.image_url_main) map[row.id].image_main.push(row.image_url_main);
    });

    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve cart' });
  }
});

// ---------- API Update Cart Item Quantity ----------
app.put('/api/cart/:cart_id', async (req, res) => {
  if (!req.session.customerId) {
    return res.status(401).json({ error: 'Please login to update cart' });
  }

  const { cart_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  try {
    // Check if cart item exists and belongs to the user
    const [cartItem] = await pool.query(
      'SELECT product_id FROM cart WHERE id = ? AND customer_id = ?',
      [cart_id, req.session.customerId]
    );

    if (cartItem.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check stock availability
    const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [cartItem[0].product_id]);
    if (product[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, cart_id]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// ---------- API Remove Item from Cart ----------
app.delete('/api/cart/:cart_id', async (req, res) => {
  if (!req.session.customerId) {
    return res.status(401).json({ error: 'Please login to remove items from cart' });
  }

  const { cart_id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM cart WHERE id = ? AND customer_id = ?',
      [cart_id, req.session.customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// ---------- API Clear Cart ----------
app.delete('/api/cart', async (req, res) => {
  if (!req.session.customerId) {
    return res.status(401).json({ error: 'Please login to clear cart' });
  }

  try {
    await pool.query('DELETE FROM cart WHERE customer_id = ?', [req.session.customerId]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear cart' });
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