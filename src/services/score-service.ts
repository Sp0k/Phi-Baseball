import { TEAMS, type Team } from "@/models/team";
import { type Scoreboard } from "@/models/score";

export function createEmptyScoreboard(): Scoreboard {
  return {
    [TEAMS.BROTHERS]: {
      runs: 0,
      bases: 0,
    },
    [TEAMS.PHIKEIAS]: {
      runs: 0,
      bases: 0,
    },
  };
}

export function applyBasesToTeam(
  scoreboard: Scoreboard,
  team: Team,
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
