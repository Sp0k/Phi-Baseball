import { useEffect, useState } from "react";
import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { type Room } from "@/models/room";
import NewGameForm from "@/components/HostComponents/NewGameForm";
import Lobby from "@/components/HostComponents/Lobby";
import { getRememberedCode } from "@/services/host-room-pointer-service";
import { restoreRoomFromStorage } from "@/services/room-lookup-service";
import Game from "@/components/HostComponents/Game";

function HostPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameStage, setGameStage] = useState<GameStage>(GAMESTAGES.PREGAME);

  useEffect(() => {
    (async () => {
      const code = getRememberedCode();
      if (!code) return;

      const room = await restoreRoomFromStorage();
      if (room) setRoom(room);
    })();
  }, []);

  useEffect(() => {
    setGameStage((room === null) ? GAMESTAGES.PREGAME : room.gameStage);
  }, [room]);

  return (
    <main className="sm:fixed top-12 sm:top-14 w-full sm:h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-5xl my-5 py-10 sm:my-2 flex flex-col justify-center">
        {gameStage === GAMESTAGES.PREGAME || gameStage === GAMESTAGES.LOBBY && <h2 className="text-7xl text-black mx-auto text-center my-10 sm:my-0 font-bold">Host</h2>}
        {
          (gameStage === GAMESTAGES.PREGAME) && <NewGameForm roomCallback={(room) => setRoom(room)} />
        }
        {
          (gameStage === GAMESTAGES.LOBBY) && room !== null && <Lobby room={room} gameStateCallback={(gameStage) => setGameStage(gameStage)} />
        }
        {
          (gameStage === GAMESTAGES.ACTIVE || gameStage === GAMESTAGES.DONE) && room !== null && <Game room={room} gameStateCallback={(gameStage) => setGameStage(gameStage)}  />
        }
      </div>
    </main>
  );
}

export default HostPage;
