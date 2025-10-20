import { type Room } from "@/models/room";
import { getRoomFromCode } from "@/services/room-lookup-service";
import { useState } from "react";

function JoinPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [code, setCode] = useState<string>("");
  
  const getRoom = async () => {
    if (code === "") return;

    const room = await getRoomFromCode(code);
    if (room) setRoom(room);
  }

  return (
    <div>
      <h1>Join</h1>
      {
        room === null && (
          <div>
            <label htmlFor="codeInput">Enter game code</label><br/>
            <input type="text" maxLength={5} minLength={5} id="codeInput" onChange={(i) => setCode(i.target.value)} /><br/>
            <button onClick={getRoom}>Join game</button>
          </div>
        )
      }
      {
        room !== null && (
          <div>
            <h2>{room?.id}</h2>
            <h3>FQ: {room?.factQuantity}</h3>
          </div>
        )
      }
    </div>
  );
}

export default JoinPage;
