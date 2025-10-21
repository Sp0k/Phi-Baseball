import { db } from "@/firebase";
import { roomRefKey } from "@/models/keys";
import { GAMESTAGES } from "@/models/game-stage";
import { ref, update } from "firebase/database";
import { lsDel, lsGet, lsSet } from "@/lib/storage";

const HOST_KEY = "host_room_code";

export function rememberHostRoom(code: string, hours = 12) {
  lsSet(HOST_KEY, code, hours * 60 * 60 * 1000);
}

export function getRememberedCode(): string | null {
  return lsGet<string>(HOST_KEY);
}

export async function endRoomAndForget(code: string) {
  await update(ref(db, `${roomRefKey}/${code}`), {
    state: GAMESTAGES.DONE,
  });
  lsDel(HOST_KEY);
}

export function forgetHostRoom() {
  lsDel(HOST_KEY);
}
