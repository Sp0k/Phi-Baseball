import { db } from "@/firebase";
import { ref, get, set, update } from "firebase/database";
import { roomRefKey } from "@/models/keys";
import { TEAM_KEYS, type TeamKey } from "@/models/team";
import { createEmptyScoreboard } from "@/services/score-service";
import { type Scoreboard } from "@/models/score";

export type PersistedGamePhase = "normal" | "finalChance" | "done";

export type PersistedGameData = {
  strikes: number;
  turnTeam: TeamKey;
  phase: PersistedGamePhase;
  turnIndex: Record<TeamKey, number>;
  scoreboard: Scoreboard;
};

export function createDefaultGameData(startingTeam: TeamKey = TEAM_KEYS.B): PersistedGameData {
  return {
    strikes: 0,
    turnTeam: startingTeam,
    phase: "normal",
    turnIndex: {
      [TEAM_KEYS.A]: 0,
      [TEAM_KEYS.B]: 0,
    },
    scoreboard: createEmptyScoreboard(),
  };
}

export async function getGameData(roomId: string): Promise<PersistedGameData | null> {
  const snap = await get(ref(db, `${roomRefKey}/${roomId}/gameData`));

  if (!snap.exists()) return null;

  const data = snap.val();

  return {
    strikes: typeof data.strikes === "number" ? data.strikes : 0,
    turnTeam: data.turnTeam === TEAM_KEYS.A || data.turnTeam === TEAM_KEYS.B
      ? data.turnTeam
      : TEAM_KEYS.B,
    phase:
      data.phase === "normal" || data.phase === "finalChance" || data.phase === "done"
        ? data.phase
        : "normal",
    turnIndex: {
      [TEAM_KEYS.A]: typeof data.turnIndex?.A === "number" ? data.turnIndex.A : 0,
      [TEAM_KEYS.B]: typeof data.turnIndex?.B === "number" ? data.turnIndex.B : 0,
    },
    scoreboard: {
      [TEAM_KEYS.A]: {
        runs: typeof data.scoreboard?.A?.runs === "number" ? data.scoreboard.A.runs : 0,
        bases: typeof data.scoreboard?.A?.bases === "number" ? data.scoreboard.A.bases : 0,
      },
      [TEAM_KEYS.B]: {
        runs: typeof data.scoreboard?.B?.runs === "number" ? data.scoreboard.B.runs : 0,
        bases: typeof data.scoreboard?.B?.bases === "number" ? data.scoreboard.B.bases : 0,
      },
    },
  };
}

export async function setGameData(roomId: string, gameData: PersistedGameData): Promise<void> {
  await set(ref(db, `${roomRefKey}/${roomId}/gameData`), gameData);
}

export async function patchGameData(
  roomId: string,
  partial: Partial<PersistedGameData>
): Promise<void> {
  await update(ref(db, `${roomRefKey}/${roomId}/gameData`), partial);
}
