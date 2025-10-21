import { useEffect, useMemo, useState } from "react";

interface FactsFormProps {
  roomId: string,
  factQuantity: number,
  onSubmit: (data: { name: string; facts: FactModel[] }) => void | Promise<void>;
  initialName: string,
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
  initialFacts = []
}: FactsFormProps) {
  const [name, setName] = useState(initialName);
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
    onSubmit({
      name: name.trim(),
      facts: facts.map(({ level, fact }) => ({ level, fact: fact.trim() })),
    });
  }

  return (
    <div>
      <h2>{roomId}</h2>
      <form onSubmit={submit}>
        <label>
          <span>Name</span><br/>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            />
        </label><br/>

        {facts.map((value, i) => (
          <label key={i}>
            <span>Fact {i + 1}</span><br/>
            <input
              type="text"
              value={value.fact}
              onChange={e => handleChangeFact(i, e.target.value)}
              required
              /><br/>
          </label>
        ))}

        <button type="submit" disabled={!allFilled}>
          Submit facts
        </button>
      </form>
    </div>
  );
}

export default FactsForm;
