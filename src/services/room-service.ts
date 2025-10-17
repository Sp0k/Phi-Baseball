import { ref, runTransaction, serverTimestamp, Database } from "firebase/database";
import { generateFiveDigitCode } from "../lib/ids";

export const roomRefName = "rooms"

export async function createRoomWithUniqueCode(db: Database) {
  for (;;) {
    const code = generateFiveDigitCode();
    const roomRef = ref(db, `${roomRefName}/${code}`);

    const { committed } = await runTransaction(roomRef, (current) => {
      if (current === null) {
        return { createdAt: serverTimestamp() }; // Claim room code
      }
      return; // Abort (code taken)
    });

    if (committed) return code; // success
  }
}
