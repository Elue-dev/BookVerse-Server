const { createClient } = require("redis");
const url = require("url");

const redisUrl = url.parse(process.env.REDIS_URL);

let redisClient;

if (process.env.NODE_ENV === "development") {
  redisClient = createClient();
} else {
  redisClient = createClient({
    host: redisUrl.hostname,
    port: redisUrl.port,
    password: redisUrl.auth.split(":")[1],
  });
}

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
