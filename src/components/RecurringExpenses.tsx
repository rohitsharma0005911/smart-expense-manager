import { useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { addExpense } from "../features/expenses/expenseSlice";
import { usePersistentState } from "../hooks/usePersistentState";

type Frequency = "weekly" | "monthly" | "yearly";

interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: Frequency;
  nextDate: string;
}

const isRecurringList = (value: unknown): value is RecurringExpense[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      typeof item.id === "string" &&
      "title" in item &&
      typeof item.title === "string" &&
      "amount" in item &&
      typeof item.amount === "number" &&
      Number.isFinite(item.amount) &&
      "category" in item &&
      typeof item.category === "string" &&
      "frequency" in item &&
      (item.frequency === "weekly" || item.frequency === "monthly" || item.frequency === "yearly") &&
      "nextDate" in item &&
      typeof item.nextDate === "string"
  );

const moveDate = (dateString: string, frequency: Frequency) => {
  const [year, month, day] = dateString.split("-").map(Number);
  if (frequency === "weekly") {
    const date = new Date(year, month - 1, day + 7);
    return formatDate(date);
  }

  const targetMonth = frequency === "monthly" ? month : month + 12;
  const targetYear = year + Math.floor((targetMonth - 1) / 12);
  const normalizedMonth = ((targetMonth - 1) % 12) + 1;
  const lastDay = new Date(targetYear, normalizedMonth, 0).getDate();
  return `${targetYear}-${String(normalizedMonth).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
};

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const RecurringExpenses = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.items);
  const [schedules, setSchedules] = usePersistentState<RecurringExpense[]>(
    "smart-expense-recurring",
    [],
    isRecurringList
  );
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Bills");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [nextDate, setNextDate] = useState("");
  const today = formatDate(new Date());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || !nextDate || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    setSchedules((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount: parsedAmount,
        category,
        frequency,
        nextDate,
      },
    ]);
    setTitle("");
    setAmount("");
    setNextDate("");
  };

  const recordPayment = (schedule: RecurringExpense) => {
    dispatch(
      addExpense({
        id: crypto.randomUUID(),
        title: schedule.title,
        amount: schedule.amount,
        category: schedule.category,
        date: schedule.nextDate,
        notes: `Recurring schedule ${schedule.id}`,
        createdAt: new Date().toISOString(),
      })
    );
    setSchedules((current) =>
      current.map((item) =>
        item.id === schedule.id
          ? { ...item, nextDate: moveDate(item.nextDate, item.frequency) }
          : item
      )
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="text-xl font-bold text-slate-800">Add recurring expense</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">Create a schedule for regular expenses like rent or subscriptions.</p>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-slate-600">
            Expense name
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Rent, subscription..." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Amount
            <input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
              <option>Food</option><option>Travel</option><option>Shopping</option><option>Bills</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Repeat
            <select value={frequency} onChange={(event) => setFrequency(event.target.value as Frequency)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
              <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Next payment date
            <input required type="date" min={today} value={nextDate} onChange={(event) => setNextDate(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <button type="submit" className="self-end rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700">Save schedule</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Your schedules</h2>
        {schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">No recurring expenses set up yet.</div>
        ) : (
          [...schedules].sort((a, b) => a.nextDate.localeCompare(b.nextDate)).map((schedule) => {
            const alreadyRecorded = expenses.some(
              (expense) =>
                expense.title === schedule.title &&
                expense.date === schedule.nextDate &&
                expense.notes === `Recurring schedule ${schedule.id}`
            );
            return (
              <article key={schedule.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{schedule.title}</h3>
                  <p className="mt-1 text-sm capitalize text-slate-500">₹{schedule.amount} · {schedule.category} · {schedule.frequency} · Next: {schedule.nextDate}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={alreadyRecorded || schedule.nextDate > today} onClick={() => recordPayment(schedule)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
                    {alreadyRecorded ? "Payment recorded" : schedule.nextDate > today ? "Not due yet" : "Record payment"}
                  </button>
                  <button type="button" onClick={() => setSchedules((current) => current.filter((item) => item.id !== schedule.id))} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                    Remove
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};

export default RecurringExpenses;
