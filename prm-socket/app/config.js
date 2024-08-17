require('dotenv').config()
console.log(process.env.REDIS_URI)
const config = {
    redis: {
        pubsub: process.env.REDIS_URI
    },
    socketio: {
        pingInterval: 60000
    }
}

module.exports = config;
