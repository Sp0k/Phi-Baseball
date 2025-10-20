import { type Room } from "@/models/room";

interface LobbyProps {
  room: Room | null;
}

function Lobby({ room }: LobbyProps) {
  return (
    <h2>{room?.id}</h2>
  );
}

export default Lobby;
