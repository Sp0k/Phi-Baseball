import { type Room } from "@/models/room";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FactsForm from "@/components/JoinComponents/FactsForm";
import JoinGameForm from "@/components/JoinComponents/JoinGameForm";
import { submitFacts } from "@/services/player-service";
import { TEAM_KEYS } from "@/models/team";
import { getRoomFromCode } from "@/services/room-lookup-service";
import { useLoading, BallTriangle } from "@agney/react-loading";

function JoinPage() {
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loadingRoom, setLoadingRoom] = useState<boolean>(true);

  useEffect(() => {
    const code = searchParams.get("room");

    if (!code) {
      setLoadingRoom(false);
      return;
    }

    (async () => {
      try {
        const foundRoom = await getRoomFromCode(code);
        setRoom(foundRoom);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingRoom(false);
      }
    })();
  }, [searchParams]);

  const { containerProps, indicatorEl } = useLoading({
    loading: true,
    indicator: <BallTriangle />,
  });

  return (
    <main className="sm:fixed top-12 sm:top-14 w-full sm:h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-2xl my-5 py-10 sm:my-20 flex flex-col justify-center">
        <h2 className="text-7xl text-black mx-auto text-center my-10 sm:mb-20 font-bold">Join</h2>
        {
          loadingRoom && 
            <section {...containerProps} className="w-20 h-20 my-auto mx-auto text-phidelt-navy">
              {indicatorEl}
            </section>
        }
        {
          room === null && !loadingRoom && <JoinGameForm roomCallback={(room) => setRoom(room)} />
        }
        {
          room !== null && !submitted && !loadingRoom &&
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
          room !== null && submitted && !loadingRoom && <h3 className="mx-auto font-semibold text-lg">Your facts were submitted!</h3>
        }
      </div>
    </main>
  );
}

export default JoinPage;
