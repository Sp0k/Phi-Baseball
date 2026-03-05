import { type Room } from "@/models/room";
import { getRoomFromCode } from "@/services/room-lookup-service";
import { useState } from "react";

interface JoinGameProps {
  roomCallback: (room: Room) => void;
}

function JoinGameForm({ roomCallback }: JoinGameProps) {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  const getRoom = async () => {
    if (code === "") {
      setError("Cannot leave code empty...");
      return;
    }

    if (code.length < 5) {
      setError("Code needs to be 5 digits...");
      return;
    }

    const room = await getRoomFromCode(code);
    if (room) roomCallback(room);
  }

  return (
    <div className="flex flex-col h-full max-w-50 mx-auto">
      <label 
        htmlFor="codeInput"
        className="text-lg font-semibold mb-1"
      >
        Enter game code
      </label>
      <input 
        type="text"
        pattern="[0-9]{5}"
        id="codeInput"
        placeholder="12345"
        onChange={(i) => setCode(i.target.value)}
        maxLength={5}
        className={`border-2 ${error === "" ? "border-phidelt-navy" : "border-phidelt-red"} bg-phidelt-navy/20 px-2 py-1 focus:outline-none rounded`}
      />
      {error !== "" && <p className="text-sm text-phidelt-red">{error}</p>}
      <button
        onClick={getRoom}
        className="rounded-md bg-phidelt-blue w-fit px-5 mt-4 mx-auto cursor-pointer py-2.5 text-sm
        font-semibold text-white shadow-xs hover:bg-phidelt-blue/70
        transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-phidelt-blue-gray"
      >
        Join game
      </button>
    </div>
  )
}

export default JoinGameForm;
