import { ref, runTransaction, serverTimestamp, Database, update } from "firebase/database";
import { auth } from "@/firebase";
import { generateFiveDigitCode } from "@/lib/ids";

export const roomRefName = "rooms"

export async function createRoomWithUniqueCode(db: Database, factQuantity: number) {
  const hostUid = auth.currentUser?.uid;
  if (!hostUid) throw new Error("No user; call ensureAnon() before creating a room.");

  while (true) {
    const code = generateFiveDigitCode();

    const hostRef = ref(db, `${roomRefName}/${code}/hostUid`);
    const { committed } = await runTransaction(hostRef, (curr) => {
      if (curr === null) return hostUid;
      return;
    });

    if (!committed) continue;

    await update(ref(db, `${roomRefName}/${code}`), {
      factQuantity,
      createdAt: serverTimestamp(),
    });

    return code;
  }
}
