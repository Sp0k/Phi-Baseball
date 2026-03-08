import { type Room } from "@/models/room";
import { useState } from "react";
import FactsForm from "@/components/JoinComponents/FactsForm";
import JoinGameForm from "@/components/JoinComponents/JoinGameForm";
import { submitFacts } from "@/services/player-service";
import { TEAM_KEYS } from "@/models/team";

function JoinPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  return (
    <main className="sm:fixed top-12 sm:top-14 w-full sm:h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-2xl my-5 py-10 sm:my-20 flex flex-col justify-center">
        <h2 className="text-7xl text-black mx-auto text-center my-10 sm:mb-20 font-bold">Join</h2>
        {
          room === null && <JoinGameForm roomCallback={(room) => setRoom(room)} />
        }
        {
          room !== null && !submitted &&
            <FactsForm
              roomId={room.id}
              factQuantity={room.factQuantity}
              teamMode={room.teamMode}
              onSubmit={async ({ name, team, facts }) => {
                await submitFacts(room, name, team, facts);
                setSubmitted(true);
              }}
              initialName=""
              initialTeam={TEAM_KEYS.A}
              initialFacts={[]}
            />
        }
        {
          room !== null && submitted && <h3 className="mx-auto font-semibold text-lg">Your facts were submitted!</h3>
        }
      </div>
    </main>
  );
}

export default JoinPage;
