import { useState } from "react";
import { createRoomWithUniqueCode } from "@/services/room-service";
import { db } from "@/firebase";
import { type Room } from "@/models/room";
import { GAMESTAGES } from "@/models/game-stage";
import { serverTimestamp } from "firebase/database";
import { rememberHostRoom } from "@/services/host-room-pointer-service";

interface NewGameFormProps {
  roomCallback: (room: Room) => void;
}

function NewGameForm({ roomCallback }: NewGameFormProps) {
  const [factQuantity, setFactQuantity] = useState(2);

  const createNewGame = async () => {
    const newGameId = await createRoomWithUniqueCode(db, factQuantity);
    rememberHostRoom(newGameId);

    const room: Room = {
      id: newGameId,
      factQuantity: factQuantity,
      createdAt: serverTimestamp(),
      gameStage: GAMESTAGES.LOBBY,
    }
    roomCallback(room);
  }

  return (
    <div>
      <h2>New Game</h2>
      <label htmlFor="numOfFacts">Number of facts per player</label><br />
      <input type="number" id="numOfFacts" defaultValue="3" min="2" max="6" onChange={(i) => setFactQuantity(parseInt(i.target.value))} /><br/>
      <button onClick={createNewGame}>Create Game</button><br/>
    </div>
  )
}

export default NewGameForm;
