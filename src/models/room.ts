import { serverTimestamp } from "firebase/database";
import { type GameStage } from "./game-stage";

export type ServerTimestamp = ReturnType<typeof serverTimestamp>;
export type RTDBTime = number | ServerTimestamp;

export type Room = {
  id: string,
  factQuantity: number,
  createdAt: RTDBTime,
  gameStage: GameStage,
};
