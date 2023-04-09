CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(255),
  password VARCHAR(400)
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  price VARCHAR(20),
  userid INT NOT NULL,
  FOREIGN KEY (userid) REFERENCES users(id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  comment TEXT,
  userid INT NOT NULL,
  bookid INT NOT NULL,
  date DATETIME DEFAULT now(),
  FOREIGN KEY (userid) REFERENCES users(id),
  FOREIGN KEY (bookid) REFERENCES books(id)
);

CREATE TABLE transactions (
   id SERIAL PRIMARY KEY,
   userId INT NOT NULL,
   bookId INT NOT NULL,
  transactionId INT NOT NULL,
   date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (userId) REFERENCES users(id),
   FOREIGN KEY (bookId) REFERENCES books(id)
)