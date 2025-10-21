import { type Room } from "@/models/room";
import { getRoomFromCode } from "@/services/room-lookup-service";
import { useState } from "react";

interface JoinGameProps {
  roomCallback: (room: Room) => void;
}

function JoinGameForm({ roomCallback }: JoinGameProps) {
  const [code, setCode] = useState<string>("");

  const getRoom = async () => {
    if (code === "") return;

    const room = await getRoomFromCode(code);
    if (room) roomCallback(room);
  }

  return (
    <div>
      <label htmlFor="codeInput">Enter game code</label><br/>
      <input type="text" pattern="[0-9]{5}" id="codeInput" onChange={(i) => setCode(i.target.value)} /><br />
      <button onClick={getRoom}>Join game</button>
    </div>
  )
}

export default JoinGameForm;
