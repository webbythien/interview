const redis = require("./redis");
// const Room = require("../models/rooms");
// const mongoose = require("mongoose");

async function connect(sck) {
  function sckJoin(...roomIds) {
    return new Promise((resolve) => {
      sck.join(roomIds, () => {
        // roomIds.forEach(r => rooms.add(r));
        console.debug("Joined rooms=%j", roomIds);
        console.log("OK");
        resolve();
      });
    });
  }

  function sckLeave(...roomIds) {
    return new Promise((resolve) => {
      sck.leave(roomIds, () => {
        // roomIds.forEach(r => rooms.delete(r));
        console.debug("Leaved rooms=%j", roomIds);
        resolve();
      });
    });
  }

  async function subscribe({ room_id }) {
    console.log(`subscribe ${room_id}`);

    // // Retrieve data from Redis based on the room_id key (100 newest)
    // const dataFromRedis = await redis.getDataFromRedis(room_id);

    // // Send history to client
    // sck.emit('history', {
    //     messages: dataFromRedis
    // })

    // // Join room
    // const payload = await sck.payload;
    // const room =  Room.findOne({ _id: room_id });
    // room.then( async(data)=>{
    //     const userObjectID = new mongoose.Types.ObjectId(payload.id);
    //     if (data.members_id.includes(userObjectID)) {
            console.log("join room: ",room_id);
            await sckJoin(room_id);
    //     } else {
    //     console.log("unauthenticated");
    //       sck.emit("error", { errorMessage: "unauthenticated" });
    //     }
    // }).catch((err)=>{
    //     console.log("not found room id", room_id);
    //     sck.emit("error", `Room with ID ${room_id} not found`);
    // })
  }

//   async function reaction({ room_id, payload }) {
//     console.log(`reaction ${room_id} ${payload}`);

//     try {
//       console.log(`reaction ${room_id}`);
//       sck.broadcast.to(room_id).emit("on_reaction", payload);
//     } catch (e) {
//       console.error(e);
//     }
//   }
  async function unsubscribe({ room_id }) {
    console.log(`unsubscribe ${room_id}`);
    await sckLeave(room_id);
  }

  console.log("Connected", sck.id);
  sck.on("subscribe", subscribe);
  sck.on("unsubscribe", unsubscribe);
//   sck.on("reaction", reaction);
}

module.exports = {
  connect,
};
