import { serverTimestamp } from "firebase/database";
import { type GameStage } from "./game-stage";
import type { TeamMode, TeamKey } from "./team";

export type ServerTimestamp = ReturnType<typeof serverTimestamp>;
export type RTDBTime = number | ServerTimestamp;

export type Room = {
  id: string,
  factQuantity: number,
  createdAt: RTDBTime,
  gameStage: GameStage,
  teamMode: TeamMode;
  startingTeam?: TeamKey;
};

export const ROOMFIELDS = {
  HOSTUID: "hostUid",
  FACTQUANTITY: "factQuantity",
  CREATEDAT: "createdAt",
  STATE: "state",
  TEAMMODE: "teamMode",
  STARTINGTEAM: "startingTeam",
} as const;
