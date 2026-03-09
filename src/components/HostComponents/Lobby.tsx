import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { type Room } from "@/models/room";
import { ref, update } from "firebase/database";
import { roomRefKey } from "@/models/keys";
import { db } from "@/firebase";
import { useSubmittersCount } from "@/hooks/useSubmittersCount";
import QRCode from "react-qr-code";
import { TEAM_KEYS, type TeamKey, getTeamLabel } from "@/models/team";
import { useState } from "react";
import { ROOMFIELDS } from "@/models/room";

interface LobbyProps {
  room: Room;
  gameStateCallback: (gameStage: GameStage) => void;
}

function Lobby({ room, gameStateCallback }: LobbyProps) {
  const [startingTeam, setStartingTeam] = useState<TeamKey>(room.startingTeam ?? TEAM_KEYS.B);
  const teamLabel = (team: TeamKey) => getTeamLabel(room.teamMode, team);

  const updateStartingTeam = async (team: TeamKey) => {
    setStartingTeam(team);

    await update(ref(db, `${roomRefKey}/${room.id}`), {
      [ROOMFIELDS.STARTINGTEAM]: team,
    });
  };

  const startGame = async () => {
    gameStateCallback(GAMESTAGES.ACTIVE);
    await update(ref(db, `${roomRefKey}/${room?.id}`), {
      state: GAMESTAGES.ACTIVE,
    });
  }

  const joinUrl = `${window.location.origin}/join?room=${room.id}`;

  const playersReady = useSubmittersCount(room?.id);

  return (
    <div className="max-w-xl flex justify-center mx-auto mt-30">
      <div>
        <h3 
          className="mx-auto text-3xl text-phidelt-navy/70 text-center -mt-5 mb-4 sm:mb-6 font-semibold"
        >
          {room?.id}
        </h3>
        <p className="mx-auto font-semibold text-lg">
          There is <strong className="text-phidelt-blue underline">{playersReady}</strong> players ready
        </p>

        <div className="bg-white mt-4 mb-1 sm:mt-6 sm:mb-2 flex justify-center p-4 rounded-xl shadow-sm">
          <QRCode value={joinUrl} size={180} />
        </div>

        <p className="text-center text-base mb-2 sm:mb-4 text-slate-600 max-w-xs">
          Scan to join this game directly.
        </p>

        <label className="text-lg font-semibold mb-4 flex flex-col text-center">
          Starting Team
          <select
            value={startingTeam}
            onChange={(e) => void updateStartingTeam(e.target.value as TeamKey)}
            className="border-2 border-phidelt-navy cursor-pointer rounded bg-phidelt-navy/20 font-normal text-base px-2 py-1 focus:outline-none mt-2"
          >
            <option value={TEAM_KEYS.A}>{teamLabel(TEAM_KEYS.A)}</option>
            <option value={TEAM_KEYS.B}>{teamLabel(TEAM_KEYS.B)}</option>
          </select>
        </label>

        <div className="w-full flex justify-center">
          <button 
            onClick={startGame}
            className={`rounded-md bg-phidelt-blue w-fit px-5 mt-4 mx-auto cursor-pointer py-2.5 text-sm
font-semibold text-white shadow-xs hover:bg-phidelt-blue/70
transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-phidelt-blue-gray
disabled:bg-phidelt-blue-gray disabled:text-slate-400`}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
