import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("REDIS_URL is not defined in environment variables");
  process.exit(1);
}

const redis = new Redis(redisUrl);

redis.on("connect", () => {
  console.log(`Redis connected successfully..`);
});

redis.on("error", (err) => {
  console.error(`Something went wrong while connecting to Redis: ${err.message}`);
  process.exit(1);
});

export default redis;