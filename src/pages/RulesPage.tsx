function RulesPage() {
  return (
    <main className="top-12 px-4 sm:px-0 sm:mx-auto max-w-xl sm:top-14 w-full sm:h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-2xl overflow-scroll sm:my-20 flex flex-col justify-center">
        <h2 className="text-7xl mt-20 sm:mt-0 text-black mx-auto text-center mb-10 sm:mb-20 font-bold">
          Rules
        </h2>

        {/* Goal */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-black mb-3">Goal</h3>
          <p className="text-black text-base leading-relaxed">
            Guess <span className="font-semibold">which player</span> a mystery fact is describing.
            The host draws random facts from different difficulty levels, reads them out loud, and
            everyone tries to figure out <span className="font-semibold">who it’s about</span>.
          </p>
        </section>

        {/* What you need */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-black mb-3">What you need</h3>
          <ul className="list-disc pl-6 text-black leading-relaxed space-y-1">
            <li>3+ players (best with 4–12)</li>
            <li>1 device for the <span className="font-semibold">Host</span> (a bigger screen is nice but not required)</li>
            <li>Each player joins on their phone/laptop/tablet</li>
          </ul>
        </section>

        {/* Roles */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-black mb-3">Roles</h3>
          <ul className="list-disc pl-6 text-black leading-relaxed space-y-2">
            <li>
              <span className="font-semibold">Host:</span> creates the room, starts the game, draws facts, and reads them out loud.
            </li>
            <li>
              <span className="font-semibold">Players:</span> join the room, enter a name, and submit facts about themselves (sorted by difficulty).
            </li>
          </ul>
        </section>

        {/* Setup */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-black mb-3">Setup</h3>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black mb-2">1) Create a room (Host)</h4>
            <ol className="list-decimal pl-6 text-black leading-relaxed space-y-1">
              <li>Open the Host page.</li>
              <li>Create a new room → you’ll get a <span className="font-semibold">5-digit room code</span>.</li>
              <li>Choose how many facts each player should submit.</li>
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black mb-2">2) Join the room (Players)</h4>
            <ol className="list-decimal pl-6 text-black leading-relaxed space-y-1">
              <li>Open the Join page.</li>
              <li>Enter the <span className="font-semibold">5-digit room code</span>.</li>
              <li>Enter your display name.</li>
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black mb-2">3) Submit your facts (Players)</h4>
            <p className="text-black text-base leading-relaxed mb-3">
              Each player submits facts about <span className="font-semibold">themselves</span>, grouped by difficulty level.
              Once the host starts the game, facts can’t be edited or submitted anymore.
            </p>

            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-black font-semibold mb-2">Fact-writing guidelines</p>
              <ul className="list-disc pl-6 text-black leading-relaxed space-y-1">
                <li>Keep facts short (one sentence is perfect).</li>
                <li>Keep them true (or “true-ish” if you’re playing casually).</li>
                <li>Avoid facts that include your name directly.</li>
                <li>Keep it party-friendly: don’t share private info.</li>
              </ul>
            </div>

            <div className="mt-4">
              <p className="text-black font-semibold mb-2">Difficulty examples</p>
              <ul className="list-disc pl-6 text-black leading-relaxed space-y-2">
                <li>
                  <span className="font-semibold">Easy:</span> most people should get it quickly.{" "}
                  <span className="italic">“I have a twin.”</span>
                </li>
                <li>
                  <span className="font-semibold">Medium:</span> a few people might know.{" "}
                  <span className="italic">“I’ve broken a bone doing something dumb.”</span>
                </li>
                <li>
                  <span className="font-semibold">Hard:</span> only close friends would know.{" "}
                  <span className="italic">“I had a weird phase where I collected ___.”</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to play */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-black mb-3">How to play</h3>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black mb-2">Starting the game</h4>
            <p className="text-black leading-relaxed">
              When everyone’s ready, the Host presses <span className="font-semibold">Start</span>. The room is now active.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black mb-2">A round (one fact)</h4>
            <ol className="list-decimal pl-6 text-black leading-relaxed space-y-1">
              <li>The player who's turn it is chooses the difficulty of fact they want</li>
              <li>The fact is read to them and they take a guess as to who in the room submitted it.</li>
              <li>If they guess correctly, they add the level of the fact to their score. If they don't, no points.</li>
            </ol>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-black mb-2">Confirming the answer</h4>
            <p className="text-black leading-relaxed">
              After people guess, the group confirms who it was about (usually the described player confirms).
              That fact is marked as used and won’t repeat.
            </p>
          </div>
        </section>

        {/* Ending */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-black mb-3">Ending the game</h3>
          <p className="text-black leading-relaxed mb-3">
            Play until you run out of facts, the host ends the room, or you decide to stop.
            Phi-Baseball is designed to be fun even without “winning.”
          </p>
        </section>

        {/* Good to know */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-black mb-3">Good to know</h3>
          <ul className="list-disc pl-6 text-black leading-relaxed space-y-2">
            <li>
              <span className="font-semibold">Host session restore:</span> if the host refreshes, the room can often be restored (as long as it hasn’t ended).
            </li>
            <li>
              Facts are drawn randomly and removed from future draws once used.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

export default RulesPage;
