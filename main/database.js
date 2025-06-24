const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "mydb.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      salt TEXT,
      state TEXT
    )`
  );

  // Insert default admin user if not exists
  const defaultPassword = "admin";
  const crypto = require("crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHmac("sha256", salt)
    .update(defaultPassword)
    .digest("hex");

  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (username, password, salt, state) VALUES (?, ?, ?, 'admin')",
        ["admin", hash, salt]
      );
    }
  });

  // Create transactions table
  db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sandoghNo INTEGER NOT NULL,
        kind TEXT NOT NULL CHECK(kind IN ('pay', 'receive')),
        paymentprice REAL NOT NULL,
        customerpayment REAL NOT NULL,
        insurance TEXT ,
        insuranceCompany TEXT ,
        cash REAL NOT NULL,
        checkPrice REAL NOT NULL,
        checkDate TEXT,
        refund REAL NOT NULL,
        pose REAL NOT NULL,
        details TEXT, 
        receptionist TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('done', 'pending')),
        date_registered TEXT DEFAULT (datetime('now', 'localtime')),
        name TEXT 
    )`
  );
  // Create cashtran table
  db.run(
    `CREATE TABLE IF NOT EXISTS cashTran (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sandoghNo INTEGER NOT NULL,
        kind TEXT NOT NULL CHECK(kind IN ('pay', 'receive')),
        cash REAL NOT NULL,
        receptionist TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('done', 'pending')),
        date_registered TEXT DEFAULT (datetime('now', 'localtime'))
    )`
  );
  // Create sandoghTable table
  db.run(
    `CREATE TABLE IF NOT EXISTS sandoghTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sandoghNo INTEGER NOT NULL,
        receptionist TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('open', 'close')),
        date_registered TEXT DEFAULT (datetime('now', 'localtime'))
       
    )`
  );
  // Create bank table
  db.run(
    `CREATE TABLE IF NOT EXISTS banktable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sandoghNo INTEGER NOT NULL,
        cash REAL NOT NULL,
        receptionist TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('full', 'empty')),
        date_registered TEXT DEFAULT (datetime('now', 'localtime'))
       
    )`
  );
});

module.exports = db;
