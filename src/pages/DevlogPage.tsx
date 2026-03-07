function DevlogPage() {
  const updates = [
    {
      version: "v0.1.0",
      date: "March 2026",
      title: "Initial playable version",
      changes: [
        "Created the base room system for hosting and joining games.",
        "Added player fact submission.",
        "Set up the host game flow for drawing facts by level.",
      ],
    },
    {
      version: "v0.2.0",
      date: "March 2026",
      title: "Teams update",
      changes: [
        "Added team selection when players join the game.",
        "Players can now choose between Brothers and Phikeias.",
        "Fact selection now only draws from players on the opposite team.",
      ],
    },
    {
      version: "v0.3.0",
      date: "March 2026",
      title: "Baseball scoring system",
      changes: [
        "Added baseball-inspired scoring.",
        "Facts now give bases equal to their level.",
        "Teams score a run whenever they collect enough bases for a full homerun.",
        "Remaining extra bases carry over toward the next run.",
      ],
    },
    {
      version: "v0.4.0",
      date: "March 2026",
      title: "Turn system overhaul",
      changes: [
        "The game now starts with the Phikeia team.",
        "Added rotating player turns within each team.",
        "Implemented the 3-strike system before switching teams.",
        "Added final chance logic when one team finishes all available facts first.",
      ],
    },
    {
      version: "v0.5.0",
      date: "March 2026",
      title: "Game host UI improvements",
      changes: [
        "Reworked the host layout into separate game info and gameplay sections.",
        "Added a live scoreboard panel.",
        "Added a game over screen showing the winning team and final score.",
      ],
    },
  ];

  return (
    <main className="top-12 sm:top-14 w-full sm:h-full sm:left-10 lg:left-18 bg-slate-300">
      <div className="mx-auto max-w-4xl overflow-y-auto sm:my-20 px-6 py-10 flex flex-col justify-center">
        <h2 className="text-7xl text-black mx-auto text-center mb-10 sm:mb-16 font-bold">
          Devlog
        </h2>

        <div className="flex flex-col gap-6">
          {updates.map((update) => (
            <section
              key={update.version}
              className="bg-white rounded-2xl shadow-sm px-6 py-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-black">
                    {update.version} — {update.title}
                  </h3>
                  <p className="text-sm text-slate-500">{update.date}</p>
                </div>
              </div>

              <ul className="list-disc pl-5 space-y-2 text-base text-slate-700">
                {update.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default DevlogPage;
