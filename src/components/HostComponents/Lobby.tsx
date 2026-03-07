import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { type Room } from "@/models/room";
import { ref, update } from "firebase/database";
import { roomRefKey } from "@/models/keys";
import { db } from "@/firebase";
import { useSubmittersCount } from "@/hooks/useSubmittersCount";

interface LobbyProps {
  room: Room;
  gameStateCallback: (gameStage: GameStage) => void;
}

function Lobby({ room, gameStateCallback }: LobbyProps) {
  const startGame = async () => {
    gameStateCallback(GAMESTAGES.ACTIVE);
    await update(ref(db, `${roomRefKey}/${room?.id}`), {
      state: GAMESTAGES.ACTIVE,
    });
  }

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
