CREATE TABLE users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         first_name VARCHAR(255) NOT NULL,
         last_name VARCHAR(255) NOT NULL,
         email VARCHAR(255) NOT NULL UNIQUE,
         password_hash VARCHAR(255) NOT NULL,
         created_at TEXT NOT NULL DEFAULT (datetime('now'))
     );