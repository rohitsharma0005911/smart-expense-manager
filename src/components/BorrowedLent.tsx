import { useState, type FormEvent } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type Direction = "borrowed" | "lent";

interface Loan {
  id: string;
  person: string;
  amount: number;
  direction: Direction;
  date: string;
  settled: boolean;
}

const isLoanList = (value: unknown): value is Loan[] =>
  Array.isArray(value) &&
  value.every(
    (loan) =>
      typeof loan === "object" &&
      loan !== null &&
      "id" in loan &&
      typeof loan.id === "string" &&
      "person" in loan &&
      typeof loan.person === "string" &&
      "amount" in loan &&
      typeof loan.amount === "number" &&
      Number.isFinite(loan.amount) &&
      "direction" in loan &&
      (loan.direction === "borrowed" || loan.direction === "lent") &&
      "date" in loan &&
      typeof loan.date === "string" &&
      "settled" in loan &&
      typeof loan.settled === "boolean"
  );

const BorrowedLent = () => {
  const [loans, setLoans] = usePersistentState<Loan[]>(
    "smart-expense-borrowed-lent",
    [],
    isLoanList
  );
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("lent");
  const [date, setDate] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!person.trim() || !date || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    setLoans((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        person: person.trim(),
        amount: parsedAmount,
        direction,
        date,
        settled: false,
      },
    ]);
    setPerson("");
    setAmount("");
    setDate("");
  };

  const openLoans = loans.filter((loan) => !loan.settled);
  const lentTotal = openLoans
    .filter((loan) => loan.direction === "lent")
    .reduce((total, loan) => total + loan.amount, 0);
  const borrowedTotal = openLoans
    .filter((loan) => loan.direction === "borrowed")
    .reduce((total, loan) => total + loan.amount, 0);

  return (
    <div className="max-w-4xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[26px] border border-sky-200 bg-sky-50 p-5">
          <p className="text-sm font-semibold text-sky-800">Still owed to you</p>
          <p className="mt-1 text-3xl font-black text-sky-900">₹ {lentTotal}</p>
        </div>
        <div className="rounded-[26px] border border-violet-200 bg-violet-50 p-5">
          <p className="text-sm font-semibold text-violet-800">You still owe</p>
          <p className="mt-1 text-3xl font-black text-violet-900">₹ {borrowedTotal}</p>
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="text-xl font-bold text-slate-800">Record money borrowed or lent</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">Keep track of personal loans and mark them settled when repaid.</p>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <label className="text-sm font-medium text-slate-600">
            Person
            <input
              required
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              placeholder="Name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Amount
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Type
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as Direction)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option value="lent">I lent</option>
              <option value="borrowed">I borrowed</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Date
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
          >
            Add record
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Loan history</h2>
        {loans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
            No borrowed or lent money recorded yet.
          </div>
        ) : (
          [...loans].sort((a, b) => b.date.localeCompare(a.date)).map((loan) => (
            <article key={loan.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{loan.person}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {loan.direction === "lent" ? "You lent" : "You borrowed"} · {loan.date} · {loan.settled ? "Settled" : "Outstanding"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="font-bold text-slate-800">₹ {loan.amount}</span>
                <button
                  type="button"
                  onClick={() =>
                    setLoans((current) =>
                      current.map((item) =>
                        item.id === loan.id ? { ...item, settled: !item.settled } : item
                      )
                    )
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {loan.settled ? "Reopen" : "Mark settled"}
                </button>
                <button
                  type="button"
                  aria-label={`Delete loan record for ${loan.person}`}
                  onClick={() => setLoans((current) => current.filter((item) => item.id !== loan.id))}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default BorrowedLent;
