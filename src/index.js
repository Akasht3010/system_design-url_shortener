const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const redis = require("./config/redis");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
// middleware
app.use(express.json());

// routes
const urlRoutes = require("./routes/urlRoutes");
// const RedisStore = require("rate-limit-redis").default;
// 🔥 Redis-based limiters

const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args)
  })
});

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args)
  })
});

// ✅ Apply BEFORE routes
app.use("/shorten", shortenLimiter);
app.use("/", redirectLimiter);

// routes AFTER limiter
app.use("/", urlRoutes);

// health check
app.get("/", (req, res) => {
  res.send("URL Shortener is running 🚀");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});