import { type Team } from "./team";

export type TeamScore = {
  runs: number;
  bases: number;
};

export type Scoreboard = Record<Team, TeamScore>;
