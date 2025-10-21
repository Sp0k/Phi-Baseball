import { ref, runTransaction, serverTimestamp, Database, update } from "firebase/database";
import { auth } from "@/firebase";
import { generateFiveDigitCode } from "@/lib/ids";
import { GAMESTAGES } from "@/models/game-stage";
import { roomRefKey } from "@/models/keys";


export async function createRoomWithUniqueCode(db: Database, factQuantity: number) {
  const hostUid = auth.currentUser?.uid;
  if (!hostUid) throw new Error("No user; call ensureAnon() before creating a room.");

  while (true) {
    const code = generateFiveDigitCode();

    const hostRef = ref(db, `${roomRefKey}/${code}/hostUid`);
    const { committed } = await runTransaction(hostRef, (curr) => {
      if (curr === null) return hostUid;
      return;
    });

    if (!committed) continue;

    await update(ref(db, `${roomRefKey}/${code}`), {
      factQuantity,
      createdAt: serverTimestamp(),
      state: GAMESTAGES.LOBBY,
    });

    return code;
  }
}
