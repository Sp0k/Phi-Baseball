import { type TeamKey } from "./team";

export type TeamScore = {
  runs: number;
  bases: number;
};

export type Scoreboard = Record<TeamKey, TeamScore>;
