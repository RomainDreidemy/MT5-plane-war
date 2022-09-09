import { Server } from "socket.io";
import * as express from "express";
import { createServer } from "http";
import { OnEventSocketEnum } from "./emums/sockets/OnEventSocketEnum";
import { SocketService } from "./services/socket.service";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOW_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on(OnEventSocketEnum.CONNEXION, (socket) => {
  console.info(`SOCKET_ID: ${socket.id}`)

  const socketService = new SocketService(io, socket)

  socketService.initialize()
});

httpServer.listen(+process.env.PORT || 3000);
