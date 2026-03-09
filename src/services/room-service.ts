import { auth } from "@/firebase";
import { ref, get, set, serverTimestamp } from "firebase/database";
import { roomRefKey } from "@/models/keys";
import { GAMESTAGES } from "@/models/game-stage";
import { TEAM_KEYS, type TeamMode } from "@/models/team";
import { type Database } from "firebase/database";

function generateCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function createRoomWithUniqueCode(
  db: Database,
  factQuantity: number,
  teamMode: TeamMode,
): Promise<string> {
  let code = generateCode();

  while ((await get(ref(db, `${roomRefKey}/${code}`))).exists()) {
    code = generateCode();
  }

  await set(ref(db, `rooms/${code}`), {
    hostUid: auth.currentUser!.uid,
    state: GAMESTAGES.LOBBY,
    factQuantity,
    createdAt: serverTimestamp(),
    teamMode,
    startingTeam: TEAM_KEYS.B,
  });

  return code;
}
