import { useState } from "react";
import { createRoomWithUniqueCode } from "@/services/room-service";
import { db } from "@/firebase";
import { type Room } from "@/models/room";
import { GAMESTAGES } from "@/models/game-stage";
import { serverTimestamp } from "firebase/database";
import { rememberHostRoom } from "@/services/host-room-pointer-service";
import { type TeamMode, TEAM_MODES, DEFAULT_TEAM_MODE, getTeamLabel, TEAM_KEYS } from "@/models/team";

interface NewGameFormProps {
  roomCallback: (room: Room) => void;
}

function NewGameForm({ roomCallback }: NewGameFormProps) {
  const [factQuantity, setFactQuantity] = useState(3);
  const [teamMode, setTeamMode] = useState(DEFAULT_TEAM_MODE);

  const createNewGame = async () => {
    const newGameId = await createRoomWithUniqueCode(db, factQuantity, teamMode);
    rememberHostRoom(newGameId);

    const room: Room = {
      id: newGameId,
      factQuantity: factQuantity,
      createdAt: serverTimestamp(),
      gameStage: GAMESTAGES.LOBBY,
      teamMode,
    }
    roomCallback(room);
  }

  return (
    <div className="flex flex-col mt-30 max-w-72 mx-auto">
      <h3 className="mx-auto text-3xl text-center -mt-3 mb-4 sm:mb-6 font-semibold">New Game</h3>
      <label 
        htmlFor="numOfFacts"
        className="flex flex-col text-lg font-semibold mb-1"
      >
        Number of facts per player
        <input
          type="number"
          name="numOfFacts"
          id="numOfFacts"
          defaultValue="3"
          min="2"
          max="6"
          onChange={(i) => setFactQuantity(parseInt(i.target.value))}
          className="border-2 w-fit mx-auto font-semibold text-base border-phidelt-navy bg-phidelt-navy/20 px-2 py-1 focus:outline-none rounded"
        />
      </label>
      <label className="text-lg font-semibold mb-4 flex flex-col">
        Team Mode
        <select
          value={teamMode}
          onChange={(e) => setTeamMode(e.target.value as TeamMode)}
          className="border-2 border-phidelt-navy cursor-pointer rounded bg-phidelt-navy/20 font-normal text-base px-2 py-1 focus:outline-none"
        >
          <option value={TEAM_MODES.PHI} className="cursor-pointer">
            {getTeamLabel(TEAM_MODES.PHI, TEAM_KEYS.A)} / {getTeamLabel(TEAM_MODES.PHI, TEAM_KEYS.B)}
          </option>
          <option value={TEAM_MODES.OE} className="cursor-pointer">
            {getTeamLabel(TEAM_MODES.OE, TEAM_KEYS.A)} / {getTeamLabel(TEAM_MODES.OE, TEAM_KEYS.B)}
          </option>
        </select>
      </label>
      <button 
        onClick={createNewGame}
        className="rounded-md bg-phidelt-blue w-fit px-5 mt-4 mx-auto cursor-pointer py-2.5 text-sm
        font-semibold text-white shadow-xs hover:bg-phidelt-blue/70
        transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-phidelt-blue-gray"
      >
        Create Game
      </button>
    </div>
  )
}

export default NewGameForm;
