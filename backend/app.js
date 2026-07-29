const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads/') });
const dbFile = process.env.DATABASE_URL || './backend/db.sqlite';
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(dbFile);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple helpers
function runAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err); else resolve(this);
    });
  });
}
function allAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}
function getAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

// APIs
app.post('/api/creations', upload.single('image'), async (req, res) => {
  try {
    const { title, description, type, creator_id } = req.body;
    let image_path = null;
    if (req.file) {
      const target = path.join(__dirname, 'uploads', req.file.filename + path.extname(req.file.originalname));
      fs.renameSync(req.file.path, target);
      image_path = '/uploads/' + path.basename(target);
    } else if (req.body.imageBase64) {
      const data = req.body.imageBase64.replace(/^data:image\/.+;base64,/, '');
      const filename = 'img_' + Date.now() + '.png';
      const target = path.join(__dirname, 'uploads', filename);
      fs.writeFileSync(target, data, 'base64');
      image_path = '/uploads/' + filename;
    }
    const result = await runAsync(
      'INSERT INTO creations (creator_id, title, description, type, image_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [creator_id || 1, title, description, type || 'weapon', image_path, 'draft']
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/creations', async (req, res) => {
  const status = req.query.status;
  let rows;
  if (status) rows = await allAsync('SELECT * FROM creations WHERE status = ? ORDER BY created_at DESC', [status]);
  else rows = await allAsync('SELECT * FROM creations ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/creations/:id/submit', async (req, res) => {
  const id = req.params.id;
  await runAsync('UPDATE creations SET status = ? WHERE id = ?', ['submitted', id]);
  res.json({ success: true });
});

app.get('/api/admin/review', async (req, res) => {
  const rows = await allAsync('SELECT * FROM creations WHERE status = ? ORDER BY created_at ASC', ['submitted']);
  res.json(rows);
});

app.post('/api/admin/review/:id', async (req, res) => {
  const id = req.params.id;
  const { action } = req.body;
  if (action === 'approve') {
    await runAsync('UPDATE creations SET status = ? WHERE id = ?', ['approved', id]);
    // create a listing record (fixed price demo)
    await runAsync('INSERT INTO listings (creation_id, seller_id, price, currency, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))', [id, 1, 100, 'CNY', 'active']);
    res.json({ success: true });
  } else if (action === 'reject') {
    await runAsync('UPDATE creations SET status = ? WHERE id = ?', ['rejected', id]);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'invalid action' });
  }
});

app.get('/api/listings', async (req, res) => {
  const rows = await allAsync('SELECT l.*, c.title, c.description, c.image_path, c.creator_id FROM listings l JOIN creations c ON l.creation_id = c.id WHERE l.status = "active"');
  res.json(rows);
});

app.post('/api/listings/:id/buy', async (req, res) => {
  const id = req.params.id;
  const { buyer_id } = req.body;
  const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [id]);
  if (!listing) return res.status(404).json({ error: 'listing not found' });
  // create order
  const order = await runAsync('INSERT INTO orders (listing_id, buyer_id, seller_id, amount, currency, fee, royalty, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))', [id, buyer_id || 2, listing.seller_id, listing.price, listing.currency, 25, 5, 'completed']);
  // credit creator (simulate)
  await runAsync('UPDATE creators SET total_earnings = total_earnings + ? WHERE user_id = ?', [listing.price - 25, listing.seller_id]);
  res.json({ success: true, orderId: order.lastID });
});

app.get('/api/creators/:id/balance', async (req, res) => {
  const id = req.params.id;
  const row = await getAsync('SELECT * FROM creators WHERE user_id = ?', [id]);
  if (!row) return res.status(404).json({ error: 'creator not found' });
  res.json({ balance: row.total_earnings });
});

app.post('/api/payouts/request', async (req, res) => {
  const { creator_id, amount } = req.body;
  await runAsync('INSERT INTO payouts (creator_id, amount, status, created_at) VALUES (?, ?, ?, datetime("now"))', [creator_id, amount, 'pending']);
  res.json({ success: true });
});

app.post('/api/reports', async (req, res) => {
  const { reporter_id, target_id, reason } = req.body;
  await runAsync('INSERT INTO reports (reporter_id, target_id, target_type, reason, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))', [reporter_id || 2, target_id, 'creation', reason || 'abuse', 'open']);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend demo running on port', PORT));
