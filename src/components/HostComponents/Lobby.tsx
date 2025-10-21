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
    <div>
      <h2>{room?.id}</h2>
      <p>There is {playersReady} players ready</p>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}

export default Lobby;
