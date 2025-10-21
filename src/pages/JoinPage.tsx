import { type Room } from "@/models/room";
import { useState } from "react";
import FactsForm from "@/components/JoinComponents/FactsForm";
import JoinGameForm from "@/components/JoinComponents/JoinGameForm";
import { submitFacts } from "@/services/player-service";

function JoinPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  return (
    <div>
      <h1>Join</h1>
      {
        room === null && <JoinGameForm roomCallback={(room) => setRoom(room)} />
      }
      {
        room !== null && !submitted &&
          <FactsForm
            roomId={room.id}
            factQuantity={room.factQuantity}
            onSubmit={async ({ name, facts }) => {
              await submitFacts(room, name, facts);
              setSubmitted(true);
            }}
            initialName=""
            initialFacts={[]}
        />
      }
      {
        room !== null && submitted && <h2>Your facts were submitted!</h2>
      }
    </div>
  );
}

export default JoinPage;
