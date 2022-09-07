import { Server } from "socket.io";
import {SocketId, UserId} from "socket.types";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.info(`SOCKET_ID: ${socket.id}`)

  // Second player can join the room with this event
  socket.on("join", (roomId: string) => {
    const room = io.sockets.adapter.rooms.get(roomId)

    if (room) {
      if (room.size !== 1) {
        socket.emit("join_error", `${roomId} est complète.`)
        console.error(`${socket.id} WAS UNABLE TO JOIN ROOM ${roomId} - NOT FOUND`)
      } else {
        socket.join(roomId)
        socket.emit("join_successfully", roomId)
        console.info(`${socket.id} JOIN ROOM ${roomId}`)
      }
    } else {
      socket.emit("join_error", `${roomId} n'existe pas.`)
      console.error(`${socket.id} WAS UNABLE TO JOIN ROOM ${roomId} - NOT FOUND`)
    }
  })

  // Send the position to the other user
  socket.on("start_party", () => {
    const room = io.sockets.adapter.rooms.get(socket.id)

    if (room.size < 2) {
      console.error(`${socket.id} CANNOT START A PART - NOT ENOUGH PLAYER`)
    } else {
      io.to(socket.id).emit("start", Array.from(room))
    }
  })

  setInterval(() => {
    const room = io.sockets.adapter.rooms.get(socket.id)
    if (room) {
      socket.emit("get_players", Array.from(room))
    }
  }, 5000)

  // Send the position to the other user
  socket.on("move", (to: UserId, x, y, rotation) => {
    const enemySocket = io.sockets.sockets.get(to)
    if (enemySocket) {
      enemySocket.emit("get_enemy_position", { position: {x, y}, rotation })
      console.info(`${socket.id} send position to ${to}`)

    }
    console.info(`${socket.id} move to ${x} ${y} position`)
  })

  // When a user shoot, check if the other user is in the range.
  // If he is, emit the event "get_shot"
  // In both case send a status to the shooter
  socket.on("shoot", (shooter: UserId, to: UserId, x: number, y: number) => {
    // const shooterSocketId: SocketId = users.get(to)
    // const toSocketId: SocketId = users.get(to)
    //
    // if (hasShotOnUser(x, y)) {
    //   socket.to(toSocketId).emit("get_shot")
    //   socket.to(shooterSocketId).emit("shoot_result", { touch: true })
    // } else {
    //   socket.to(shooterSocketId).emit("shoot_result", { touch: false })
    // }
  })

  // When a user disconnect, remove his key in the list of user
  socket.on("disconnect", () => {
    deleteUserBySocketId(socket.id)
  })
});

const hasShotOnUser = (x: number, y:number) => {
  const otherUserPosition = {x: 10, y: 20}
  return otherUserPosition.x === x && otherUserPosition.y === y
}

const deleteUserBySocketId = (socketId: SocketId) => {
  // users.forEach((value, key) => {
  //   if (value === socketId) {
  //     users.delete(key)
  //   }
  // })
}

io.listen(3000);
