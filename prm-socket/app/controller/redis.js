const ioredis = require('ioredis');

// Define the function to retrieve data from Redis
async function getDataFromRedis(key) {
    const redisNodes = [
        process.env.REDIS_NODE_1,
        process.env.REDIS_NODE_2,
        process.env.REDIS_NODE_3
    ];

    const redisClient = new ioredis.Cluster(redisNodes, {
        redisOptions: {
            password: process.env.REDIS_PASSWORD
        }
    });

    try {
        const list = await redisClient.lrange(key, -100, -1);
        return list.map(item => JSON.parse(item));
    } catch (error) {
        console.error('Error retrieving data from Redis:', error);
        return null;
    } finally {
        redisClient.quit();
    }
}

module.exports = {
    getDataFromRedis
};
