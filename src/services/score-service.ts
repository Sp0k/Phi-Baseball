import { TEAM_KEYS, type TeamKey } from "@/models/team";
import { type Scoreboard } from "@/models/score";

export function createEmptyScoreboard(): Scoreboard {
  return {
    [TEAM_KEYS.A]: {
      runs: 0,
      bases: 0,
    },
    [TEAM_KEYS.B]: {
      runs: 0,
      bases: 0,
    },
  };
}

export function applyBasesToTeam(
  scoreboard: Scoreboard,
  team: TeamKey,
  basesWon: number,
  basesPerRun: number,
): Scoreboard {
  const current = scoreboard[team];
  const totalBases = current.bases + basesWon;

  const runsEarned = Math.floor(totalBases / basesPerRun);
  const remainingBases = totalBases % basesPerRun;

  return {
    ...scoreboard,
    [team]: {
      runs: current.runs + runsEarned,
      bases: remainingBases,
    },
  };
}
