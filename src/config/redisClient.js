import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config({quiet: true});

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redis.on("connect", ()=> {
    console.log(`Redis connected successfully..`);
});

redis.on("error", (err)=> {
    console.error(`Something err while connecting with redis ${err.message}`);
});

export default redis;