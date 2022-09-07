import { Player } from "./player.interfaces";

type GameStatus = "created" | "started" | "done"

export interface Game {
  status: GameStatus,
  player1: Player,
  player2: Player
}
