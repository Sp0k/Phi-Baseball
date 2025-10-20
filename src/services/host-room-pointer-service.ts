import { db } from "@/firebase";
import { roomRefKey } from "./room-service";
import { GAMESTAGES } from "@/models/game-stage";
import { ref, update, serverTimestamp } from "firebase/database";
import { lsDel, lsGet, lsSet } from "@/lib/storage";

const KEY = "host_room_code";

export function rememberHostRoom(code: string, hours = 12) {
  lsSet(KEY, code, hours * 60 * 60 * 1000);
}

export function getRememberedCode(): string | null {
  return lsGet<string>(KEY);
}

export async function endRoomAndForget(code: string) {
  await update(ref(db, `${roomRefKey}/${code}`), {
    state: GAMESTAGES.ENDED,
    endedAt: serverTimestamp(),
  });
  lsDel(KEY);
}

export function forgetHostRoom() {
  lsDel(KEY);
}
