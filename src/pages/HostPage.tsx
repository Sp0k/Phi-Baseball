import { type Room } from "../models/room";
import { useEffect, useState } from "react";
import CreateNewGameForm from "../components/CreateNewGameForm";

type GameStage = "pregame" | "waiting" | "active" | "ended";

function HostPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameStage, setGameStage] = useState<GameStage>("pregame");

  useEffect(() => {
    setGameStage((room === null) ? "pregame" : "waiting");
  }, [room]);

  return (
    <div>
      <h1>Host</h1>
      {
        (gameStage === "pregame") && <CreateNewGameForm roomCallback={(room) => setRoom(room)} />
      }
    </div>
  );
}

export default HostPage;
