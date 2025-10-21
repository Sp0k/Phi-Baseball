import { auth, db } from "@/firebase";
import { push, ref, set, update} from "firebase/database";
import { type Room } from "@/models/room";
import { factsKey, playersKey, roomRefKey } from "@/models/keys";

export type FactModel = {
  level: number,
  fact: string,
}

export async function submitFacts(room: Room, name: string, facts: FactModel[]) {
  if (!room) return
  const uid = auth.currentUser!.uid;
  const base = `${roomRefKey}/${room.id}`;

  await set(ref(db, `${base}/${playersKey}/${uid}`), {name});

  const updates: Record<string, any> = {};
  for (const f of facts) {
    const factId = push(ref(db, `${base}/${factsKey}/${uid}/${f.level}`)).key!;
    updates[`${base}/${factsKey}/${uid}/${f.level}/${factId}`] = { text: f.fact.trim() };
  }
  await update(ref(db), updates);
}
