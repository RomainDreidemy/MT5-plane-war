import { Server } from "socket.io";
import {SocketId, UserId} from "socket.types";
import { OnEventSocketEnum } from "./emums/sockets/OnEventSocketEnum";
import { EmitEventSocketEnum } from "./emums/sockets/EmitEventSocketEnum";

const io = new Server({
  cors: {
    origin: process.env.ALLOW_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on(OnEventSocketEnum.CONNEXION, (socket) => {
  console.info(`SOCKET_ID: ${socket.id}`)

  // Second player can join the room with this event
  socket.on(OnEventSocketEnum.JOIN, (roomId: string) => {
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
  socket.on(OnEventSocketEnum.START_PARTY, () => {
    const room = io.sockets.adapter.rooms.get(socket.id)

    if (room.size < 2) {
      console.error(`${socket.id} CANNOT START A PART - NOT ENOUGH PLAYER`)
    } else {
      io.to(socket.id).emit(EmitEventSocketEnum.START, Array.from(room))
    }
  })

  setInterval(() => {
    const room = io.sockets.adapter.rooms.get(socket.id)
    if (room) {
      socket.emit(EmitEventSocketEnum.GET_PLAYERS, Array.from(room))
    }
  }, 5000)

  // Send the position to the other user
  socket.on(OnEventSocketEnum.MOVE, (to: UserId, x: number, y: number, rotation: number) => {
    const enemySocket = io.sockets.sockets.get(to)
    if (enemySocket) {
      enemySocket.emit(EmitEventSocketEnum.GET_ENEMY_POSITION, { position: {x, y}, rotation })
      // console.info(`${socket.id} send position to ${to}`)

    }
    // console.info(`${socket.id} move to ${x} ${y} position`)
  })

  socket.on(OnEventSocketEnum.SHOOT, (to: SocketId) => {
    const enemySocket = io.sockets.sockets.get(to)
    if (enemySocket) {
      enemySocket.emit(EmitEventSocketEnum.GET_SHOT)
      console.info(`${socket.id} SHOT ${to}`)
    }
  })

  socket.on(OnEventSocketEnum.DESTROY, (to: SocketId) => {
    const enemySocket = io.sockets.sockets.get(to)
    if (enemySocket) {
      enemySocket.emit(EmitEventSocketEnum.GET_DESTROY)
      socket.emit(EmitEventSocketEnum.ENEMY_DESTROY)
      console.info(`${socket.id} DESTROY ${to}`)
    }
  })
});

io.listen(3000);
