import { Socket } from "socket.io";

export class GameService {
  private socket: Socket

  constructor() {
  }

  isMemberCanJoin(id: string ,roomId: string, members: Set<string>): { status: boolean, message: string } {
    if (!members) {
      return { status: false, message: `${id} n'existe pas.`}
    }

    if (members.size === 2) {
      return { status: false, message: `${id} est complète.`}
    }

    if (id === roomId) {
      return { status: false, message: `Vous ne pouvez pas rejoindre votre propre party.`}
    }

    return { status: true, message: `Vous pouvez rejoindre la party.`}
  }

  canStart(members: Set<string>): { status: boolean, message: string } {
    if (members.size < 2) {
      return { status: false, message: "Il n'y a pas suffisament de joueurs"}
    }

    return { status: true, message: "La partie peut commencer"}
  }
}
