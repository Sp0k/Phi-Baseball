import { useEffect, useMemo, useState } from "react";
import { TEAMS, type Team } from "@/models/team";

interface FactsFormProps {
  roomId: string,
  factQuantity: number,
  onSubmit: (data: { name: string; team: Team; facts: FactModel[] }) => void | Promise<void>;
  initialName: string,
  initialTeam?: Team,
  initialFacts: FactModel[],
}

type FactModel = {
  level: number,
  fact: string,
}

function padOrSlice(arr: FactModel[], len: number): FactModel[] {
  return Array.from({ length: len }, (_, i) => arr[i] ?? { level: i + 1, fact: "" });
}

function FactsForm({ 
  roomId,
  factQuantity,
  onSubmit,
  initialName = "",
  initialTeam = TEAMS.BROTHERS,
  initialFacts = []
}: FactsFormProps) {
  const [name, setName] = useState(initialName);
  const [team, setTeam] = useState<Team>(initialTeam);
  const [facts, setFacts] = useState<FactModel[]>(padOrSlice(initialFacts, factQuantity));

  useEffect(() => {
    setFacts(prev => padOrSlice(prev, factQuantity));
  }, [factQuantity]);

  const allFilled = useMemo(
    () => name.trim() !== "" && 
      facts.length === factQuantity &&
      facts.every(({ fact }) => fact.trim() !== ""),
    [name, facts]
  );

  const handleChangeFact = (i: number, value: string) => {
    setFacts(prev => {
      const next = prev.slice();
      next[i].level = i + 1;
      next[i].fact = value;
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) return;

    void onSubmit({
      name: name.trim(),
      team,
      facts: facts.map(({ level, fact }) => ({ level, fact: fact.trim() })),
    });
  };

  return (
    <div className="max-w-xl flex justify-center mx-auto">
      <div>
        <h3 className="mx-auto text-3xl text-phidelt-navy/70 text-center -mt-3 mb-4 sm:mb-6 font-semibold">
          {roomId}
        </h3>

        <form className="w-full" onSubmit={submit}>
          <label
            htmlFor="nameInput"
            className="text-lg font-semibold mb-3 flex flex-col"
          >
            Name
            <input
              type="text"
              name="nameInput"
              id="nameInput"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="border-2 border-phidelt-navy rounded bg-phidelt-navy/20 font-normal text-base px-2 py-1 focus:outline-none"
            />
          </label>

          <label
            htmlFor="teamSelect"
            className="text-lg font-semibold mb-4 flex flex-col"
          >
            Team
            <select
              id="teamSelect"
              name="teamSelect"
              value={team}
              onChange={(e) => setTeam(e.target.value as Team)}
              className="border-2 border-phidelt-navy rounded bg-phidelt-navy/20 font-normal text-base px-2 py-1 focus:outline-none"
            >
              <option value={TEAMS.BROTHERS}>{TEAMS.BROTHERS}</option>
              <option value={TEAMS.PHIKEIAS}>{TEAMS.PHIKEIAS}</option>
            </select>
          </label>

          {facts.map((value, i) => (
            <label 
              key={i}
              htmlFor={"fact_" + (i + 1)}
              className="text-lg font-semibold mv-1 flex flex-col"
            >
              Fact {i + 1}
              <input
                type="text"
                name={"fact_" + (i + 1)}
                id={"fact_" + (i + 1)}
                value={value.fact}
                onChange={e => handleChangeFact(i, e.target.value)}
                required
                className="border-2 border-phidelt-navy rounded font-normal text-base bg-phidelt-navy/20 px-2 py-1 focus:outline-none"
              />
              <br />
            </label>
          ))}

          <div className="w-full flex justify-center">
            <button 
              type="submit"
              disabled={!allFilled}
              className={`rounded-md bg-phidelt-blue w-fit px-5 mt-4 mx-auto cursor-pointer py-2.5 text-sm
font-semibold text-white shadow-xs hover:bg-phidelt-blue/70
transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-phidelt-blue-gray
disabled:bg-phidelt-blue-gray disabled:text-slate-400`}
            >
              Submit facts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FactsForm;
