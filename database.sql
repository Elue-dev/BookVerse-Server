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
  date DATE DEFAULT now(),
  FOREIGN KEY (userid) REFERENCES users(id),
  FOREIGN KEY (bookid) REFERENCES books(id)
);