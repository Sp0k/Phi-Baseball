import { useEffect, useState } from "react";
import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { type Room } from "@/models/room";
import NewGameForm from "@/components/HostComponents/NewGameForm";

function HostPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameStage, setGameStage] = useState<GameStage>(GAMESTAGES.PREGAME);

  useEffect(() => {
    setGameStage((room === null) ? GAMESTAGES.PREGAME : GAMESTAGES.LOBBY);
  }, [room]);

  return (
    <div>
      <h1>Host</h1>
      {
        (gameStage === GAMESTAGES.PREGAME) && <NewGameForm roomCallback={(room) => setRoom(room)} />
      }
    </div>
  );
}

export default HostPage;
