const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbFile = './backend/db.sqlite';
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
const db = new sqlite3.Database(dbFile);

const schema = `
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  display_name TEXT
);

CREATE TABLE creators (
  user_id INTEGER PRIMARY KEY,
  is_verified INTEGER DEFAULT 0,
  bio TEXT,
  payout_account_id TEXT,
  total_earnings INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'not_required'
);

CREATE TABLE creations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  title TEXT,
  description TEXT,
  type TEXT,
  image_path TEXT,
  status TEXT,
  created_at TEXT
);

CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creation_id INTEGER,
  seller_id INTEGER,
  price INTEGER,
  currency TEXT,
  status TEXT,
  created_at TEXT
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER,
  buyer_id INTEGER,
  seller_id INTEGER,
  amount INTEGER,
  currency TEXT,
  fee INTEGER,
  royalty INTEGER,
  status TEXT,
  created_at TEXT
);

CREATE TABLE payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER,
  amount INTEGER,
  status TEXT,
  created_at TEXT
);

CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER,
  target_id INTEGER,
  target_type TEXT,
  reason TEXT,
  status TEXT,
  created_at TEXT
);
`;

db.exec(schema, err => {
  if (err) throw err;
  console.log('schema created');
  const seed = db.serialize(() => {
    db.run('INSERT INTO users (username, display_name) VALUES (?, ?)', ['alice', 'Alice the Maker']);
    db.run('INSERT INTO users (username, display_name) VALUES (?, ?)', ['bob', 'Bob the Buyer']);
    db.run('INSERT INTO creators (user_id, is_verified, bio, total_earnings) VALUES (?, ?, ?, ?)', [1, 1, 'Demo creator', 0]);
    db.run('INSERT INTO creations (creator_id, title, description, type, image_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))', [1, '玄铁剑', '一把沉重的玄铁剑', 'weapon', null, 'submitted']);
    db.run('INSERT INTO creations (creator_id, title, description, type, image_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))', [1, '天罡拳法', '粗糙的招式描述', 'skill', null, 'approved']);
    db.run('INSERT INTO listings (creation_id, seller_id, price, currency, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))', [2, 1, 120, 'CNY', 'active']);
    console.log('seed data inserted');
  });
});

db.close();
