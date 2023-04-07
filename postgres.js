const { Pool } = require("pg");
require("dotenv").config();

const postgres = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// const postgres = new Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DB,
//   password: process.env.PG_PASS,
//   port: process.env.PG_PORT,
// });

module.exports = postgres;
