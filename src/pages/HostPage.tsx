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

      // Validate ownership & state from RTDB
      const room = await restoreRoomFromStorage();
      if (room) setRoom(room);
    })();
  }, []);

  useEffect(() => {
    setGameStage((room === null) ? GAMESTAGES.PREGAME : room.gameStage);
  }, [room]);

  return (
    <main className="sm:fixed top-12 sm:top-14 w-full sm:h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-2xl my-5 py-10 sm:my-2 flex flex-col justify-center">
        <h2 className="text-7xl text-black mx-auto text-center my-10 sm:mb-20 font-bold backdrop-blur-xl bg-slate-100/30 rounded px-3 py-2">{room?.gameStage === GAMESTAGES.ACTIVE ? "Match" : "Host"}</h2>
        {
          (gameStage === GAMESTAGES.PREGAME) && <NewGameForm roomCallback={(room) => setRoom(room)} />
        }
        {
          (gameStage === GAMESTAGES.LOBBY) && room !== null && <Lobby room={room} gameStateCallback={(gameStage) => setGameStage(gameStage)} />
        }
        {
          (gameStage === GAMESTAGES.ACTIVE) && room !== null && <Game room={room} gameStateCallback={(gameStage) => setGameStage(gameStage)}  />
        }
        {
          (gameStage === GAMESTAGES.DONE) && room !== null && <p className="flex justify-center font-semibold text-2xl">Thank you for playing!!!</p>
        }
      </div>
    </main>
  );
}

export default HostPage;
