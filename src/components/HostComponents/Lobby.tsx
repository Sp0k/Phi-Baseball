import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { type Room } from "@/models/room";
import { ref, update } from "firebase/database";
import { roomRefKey } from "@/services/room-service";
import { db } from "@/firebase";

interface LobbyProps {
  room: Room | null;
  gameStateCallback: (gameStage: GameStage) => void;
}

function Lobby({ room, gameStateCallback }: LobbyProps) {
  const startGame = async () => {
    gameStateCallback(GAMESTAGES.ACTIVE);
    await update(ref(db, `${roomRefKey}/${room?.id}`), {
      state: GAMESTAGES.ACTIVE,
    });
  }

  return (
    <div>
      <h2>{room?.id}</h2>
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}

export default Lobby;
