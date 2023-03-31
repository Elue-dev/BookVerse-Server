const { createClient } = require("redis");

const redisClient = createClient({ port: 6379, host: "localhost" });

const connectToRedis = () => {
  redisClient.connect();

  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.on("connect", () => console.log("Connected to Redis Server"));
};

module.exports = { redisClient, connectToRedis };
