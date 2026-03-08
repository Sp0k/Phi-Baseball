import { auth, db } from "@/firebase";
import { child, ref, get } from "firebase/database";
import { type Room, ROOMFIELDS } from "@/models/room";
import { getRememberedCode, forgetHostRoom } from "./host-room-pointer-service";
import { roomRefKey } from "@/models/keys";
import { GAMESTAGES } from "@/models/game-stage";

export async function restoreRoomFromStorage(): Promise<Room | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const code = getRememberedCode();
  if (!code) return null;

  const base = ref(db, `${roomRefKey}/${code}`);

  const [hostUidSnap] = await Promise.all([
    get(child(base, ROOMFIELDS.HOSTUID)),
  ]);

  if (!hostUidSnap.exists() || hostUidSnap.val() !== uid) {
    forgetHostRoom();
    return null;
  }

  return await fetchRoomData(code);
}

export async function getRoomFromCode(code: string): Promise<Room | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  return await fetchRoomData(code);
}

async function fetchRoomData(code: string): Promise<Room | null> {
  const base = ref(db, `${roomRefKey}/${code}`);
  const [stateSnap, fqSnap, createdSnap, tmSnap] = await Promise.all([
    get(child(base, ROOMFIELDS.STATE)),
    get(child(base, ROOMFIELDS.FACTQUANTITY)),
    get(child(base, ROOMFIELDS.CREATEDAT)),
    get(child(base, ROOMFIELDS.TEAMMODE)),
  ]);

  if (!stateSnap.exists() || stateSnap.val() === GAMESTAGES.DONE) return null;
  
  const room: Room = {
    id: code,
    factQuantity: fqSnap.val(),
    createdAt: createdSnap.val(),
    gameStage: stateSnap.val(),
    teamMode: tmSnap.val(),
  }

  return room;
}
