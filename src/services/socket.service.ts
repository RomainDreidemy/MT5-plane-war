import { Server, Socket } from "socket.io";
import { OnEventSocketEnum } from "../emums/sockets/OnEventSocketEnum";
import { EmitEventSocketEnum } from "../emums/sockets/EmitEventSocketEnum";
import { SocketId, UserId } from "socket.types";
import { GameService } from "./game.service";

export class SocketService {
  private io: Server
  private socket: Socket
  private gameService: GameService

  constructor(io: Server, socket: Socket) {
    this.io = io
    this.socket = socket
    this.gameService = new GameService()
  }

  initialize() {
    this.onJoinEvent()

    this.onStartPartyEvent()

    this.sendPlayersListInterval()

    this.onMoveEvent()

    this.onShootEvent()

    this.onDestroyEvent()
  }

  private onJoinEvent() {
    this.socket.on(OnEventSocketEnum.JOIN, (roomId: string) => {
      const members = this.getRoomMembers(roomId)

      const isMemberCanJoin = this.gameService.isMemberCanJoin(this.socket.id, roomId, members)

      if (!isMemberCanJoin.status) {
        this.socket.emit("join_error", isMemberCanJoin.message)
      } else {
        this.socket.join(roomId)
        this.socket.emit("join_successfully", roomId)
      }
    })
  }

  private onStartPartyEvent() {
    this.socket.on(OnEventSocketEnum.START_PARTY, () => {
      const members = this.getRoomMembers(this.socket.id)

      const canStart = this.gameService.canStart(members)

      if (!canStart.status) {
        console.error(`${this.socket.id} CANNOT START A PARTY - NOT ENOUGH PLAYER`)
      } else {
        this.io.to(this.socket.id).emit(EmitEventSocketEnum.START, Array.from(members))
      }
    })
  }

  private sendPlayersListInterval() {
    setInterval(() => {
      const room = this.io.sockets.adapter.rooms.get(this.socket.id)
      if (room) {
        this.socket.emit(EmitEventSocketEnum.GET_PLAYERS, Array.from(room))
      }
    }, 5000)
  }

  private onMoveEvent() {
    // Send the position to the other user
    this.socket.on(OnEventSocketEnum.MOVE, (to: UserId, x: number, y: number, rotation: number) => {
      const enemySocket = this.io.sockets.sockets.get(to)
      if (enemySocket) {
        enemySocket.emit(EmitEventSocketEnum.GET_ENEMY_POSITION, { position: {x, y}, rotation })
      }
    })
  }

  private onShootEvent() {
    this.socket.on(OnEventSocketEnum.SHOOT, (to: SocketId) => {
      const enemySocket = this.io.sockets.sockets.get(to)
      if (enemySocket) {
        enemySocket.emit(EmitEventSocketEnum.GET_SHOT)
        console.info(`${this.socket.id} SHOT ${to}`)
      }
    })
  }

  private onDestroyEvent() {
    this.socket.on(OnEventSocketEnum.DESTROY, (to: SocketId) => {
      const enemySocket = this.io.sockets.sockets.get(to)
      if (enemySocket) {
        enemySocket.emit(EmitEventSocketEnum.GET_DESTROY)
        this.socket.emit(EmitEventSocketEnum.ENEMY_DESTROY)
        console.info(`${this.socket.id} DESTROY ${to}`)
      }
    })
  }

  private getRoomMembers(id: string): Set<string> {
    return this.io.sockets.adapter.rooms.get(id)
  }
}
