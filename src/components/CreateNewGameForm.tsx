import { useState } from "react";
import { roomRefName,  createRoomWithUniqueCode } from "../services/room-service";
import { ref, update } from "firebase/database";
import { db } from "../firebase";
import { type Room } from "../models/room";

interface NewGameFormProps {
  roomCallback: (room: Room) => void;
}

function CreateNewGameForm({ roomCallback }: NewGameFormProps) {
  const [factQuantity, setFactQuantity] = useState(2);

  const createNewGame = async () => {
    const newGameId = await createRoomWithUniqueCode(db);
    const newGameRef = ref(db, `${roomRefName}/${newGameId}`);
    const room: Room = {
      id: newGameId,
      factQuantity: factQuantity,
    }
    update(newGameRef, {
      factQuantity: factQuantity,
    }).then(() => {
        alert("Game created successfully!");
        roomCallback(room);
      }).catch((error: Error) => {
        alert("error: " + error.message);
      })
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

export default CreateNewGameForm;
