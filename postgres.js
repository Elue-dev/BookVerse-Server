const { Pool } = require("pg");
require("dotenv").config();

let postgres;
if (process.env.NODE_ENV === "production") {
  postgres = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  postgres = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

module.exports = postgres;
