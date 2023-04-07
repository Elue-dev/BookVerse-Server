const { createClient } = require("redis");

const redisClient = createClient();

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
