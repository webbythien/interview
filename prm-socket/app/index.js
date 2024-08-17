const config = require("./config");
const servers = require("./bin/servers");
const http = require("http");
const router = require("./router");
const express = require("express");
const fns = require("./bin/functions");
const socketio = require("socket.io");
const ioredis = require("ioredis");
const bodyParser = require("body-parser");
const socketController = require("./controller/socket");
const _ = require("lodash");
const { createAdapter } = require("@socket.io/redis-adapter");
// const mongoose = require("mongoose");
// const paseto = require("paseto");
// const { V1 } = paseto;

function startExpress() {
  servers.express = express();

  servers.express.use(
    bodyParser.json({ type: "application/json", limit: "1mb" })
  );

  if (config.debug) {
    servers.express.use("/test", express.static(process.cwd() + "/test"));
  }

  servers.express.use(router);
  // servers.express.use(swStats.getMiddleware());
}

function startHttp() {
  servers.http = http.Server(servers.express);
  servers.http.on("request", (req, res) => (res.request = req));
  console.log(`Start HTTP !!! ${JSON.stringify(servers)}`);
}

// async function isValidToken(token) {
//   const payload = await V1.decrypt(token, "12345678901234567890123456789012");
//   if (payload) {
//     return payload;
//   }
//   return false;
// }

async function startSocketIo() {
  servers.socketio = socketio(servers.http, _.merge({}, config.socketio));

  // Create Redis Cluster instances for pub/sub
  // const redisNodes = [
  //     process.env.REDIS_NODE_1,
  //     process.env.REDIS_NODE_2,
  //     process.env.REDIS_NODE_3
  // ];

  // // Connect to Redis Cluster
  // const pubClient = new ioredis.Cluster(redisNodes, {
  //     redisOptions: {
  //         password: process.env.REDIS_PASSWORD
  //     }
  // });

  // const subClient = new ioredis.Cluster(redisNodes, {
  //     redisOptions: {
  //         password: process.env.REDIS_PASSWORD
  //     }
  // });

  // servers.socketio.use((socket, next) => {
  //   const err = new Error("not authorized");
  //   const token = socket.handshake.headers?.access_token;
  //   if (token) {
  //     const payload = isValidToken(token);
  //     if (!payload) {
  //       // Set additional details
  //       err.data = { content: "Please retry later" };
  //       return next(err);
  //     }
  //     socket.payload = payload;
  //     // Continue with the connection if the token is valid
  //     next();
  //   } else {
  //     next(err);
  //   }
  // });

  const pubClient = new ioredis(process.env.REDIS_URI);

  console.debug("REDIS_URI", process.env.REDIS_URI);

  const subClient = pubClient.duplicate();

  servers.socketio.adapter(createAdapter(pubClient, subClient));

  servers.socketio.on("connection", socketController.connect);
}

function startListener() {
  // var unixPath = unixModel.getPath(process.id);

  // if (fs.existsSync(unixPath)) {
  //     fs.unlinkSync(unixPath);
  // }

  servers.srv.listen(process.env.PORT, () => {
    // if(unixPath!==8000) {
    // fs.chmodSync(unixPath, '777');
    // }
    console.log(
      "The unix server %s has been started, port: %s",
      process.id,
      process.env.PORT
    );
  });

  servers.srv.on("connection", (sck) => servers.http.emit("connection", sck));
}

async function main() {
  // mongoose.connect("mongodb://root:myMongoHuyen@127.0.0.1/?retryWrites=true&w=majority");
  // const db = mongoose.connection;
  // db.on("error", (error) => console.error(error.message));
  // db.once("open", () => console.log("Connected database successfull..."));

  startExpress();
  startHttp();
  startSocketIo();
  startListener();
}

module.exports = main;
