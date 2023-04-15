const express = require("express");
const postgres = require("./postgres");
const bookRoutes = require("./routes/book.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const commentRoutes = require("./routes/comment.routes");
const transactionRoutes = require("./routes/transaction.routes");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./controllers/error.controller");
const GlobalError = require("./helpers/error.handler");
const { connectToRedis } = require("./redis/redis");

connectToRedis();

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://bookverseapp.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/transactions", transactionRoutes);

app.use((req, res, next) => {
  next();
});

app.all("*", (req, res, next) => {
  next(
    new GlobalError(
      `Oops! Can't find ${req.method} ${req.originalUrl}  on this server`,
      404
    )
  );
});

app.use(errorHandler);

postgres.connect((err) => {
  if (err) {
    console.error("Postgres connection error", err.stack);
  } else {
    app.listen(PORT, () =>
      console.log(`Backend Server listening at port ${PORT}`)
    );
    console.log("Connected to Postgres Database");
  }
});
