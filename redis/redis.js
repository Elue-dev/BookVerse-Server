const { createClient } = require("redis");

let redisClient;

if (process.env.NODE_ENV === "development") {
  redisClient = createClient();
} else {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });
}

const connectToRedis = () => {
  redisClient.connect();

  redisClient.on("error", (error) => console.log("Redis Client Error", error));
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
