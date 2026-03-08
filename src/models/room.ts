import { serverTimestamp } from "firebase/database";
import { type GameStage } from "./game-stage";
import type { TeamMode } from "./team";

export type ServerTimestamp = ReturnType<typeof serverTimestamp>;
export type RTDBTime = number | ServerTimestamp;

export type Room = {
  id: string,
  factQuantity: number,
  createdAt: RTDBTime,
  gameStage: GameStage,
  teamMode: TeamMode;
};

export const ROOMFIELDS = {
  HOSTUID: "hostUid",
  FACTQUANTITY: "factQuantity",
  CREATEDAT: "createdAt",
  STATE: "state",
  TEAMMODE: "teamMode",
} as const;
