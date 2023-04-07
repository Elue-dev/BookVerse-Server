const { createClient } = require("redis");

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

const redisClient = createClient({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
});

const connectToRedis = () => {
  redisClient.connect();

  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.on("connect", () => console.log("Connected to Redis Server"));
};

const retrieveRedisCache = async (cacheKey) => {
  const cachedData = await redisClient.get(cacheKey);
  const parsedCachedRedisData = JSON.parse(cachedData);

  return parsedCachedRedisData;
};

module.exports = {
  redisClient,
  connectToRedis,
  retrieveRedisCache,
};
