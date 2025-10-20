import { useEffect, useState } from "react";
import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { type Room } from "@/models/room";
import NewGameForm from "@/components/HostComponents/NewGameForm";
import Lobby from "@/components/HostComponents/Lobby";
import { endRoomAndForget, getRememberedCode } from "@/services/host-room-pointer-service";
import { restoreRoomFromStorage } from "@/services/room-lookup-service";

function HostPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameStage, setGameStage] = useState<GameStage>(GAMESTAGES.PREGAME);

  useEffect(() => {
    (async () => {
      const code = getRememberedCode();
      if (!code) return;

      // Validate ownership & state from RTDB
      const room = await restoreRoomFromStorage();
      if (room) setRoom(room);
    })();
  }, []);

  useEffect(() => {
    setGameStage((room === null) ? GAMESTAGES.PREGAME : room.gameStage);
  }, [room]);

  const tmpEndGame = async () => {
    room !== null && await endRoomAndForget(room.id);
    setRoom(null);
  }

  return (
    <div>
      <h1>Host</h1>
      {
        (gameStage === GAMESTAGES.PREGAME) && <NewGameForm roomCallback={(room) => setRoom(room)} />
      }
      {
        (gameStage === GAMESTAGES.LOBBY) && <Lobby room={room} gameStateCallback={(gameStage) => setGameStage(gameStage)} />
      }
      {
        (gameStage === GAMESTAGES.ACTIVE) && <button onClick={tmpEndGame}>End Game</button>
      }
    </div>
  );
}

export default HostPage;
