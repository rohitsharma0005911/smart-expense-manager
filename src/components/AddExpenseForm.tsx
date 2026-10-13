import { useState } from "react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { addExpense } from "../features/expenses/expenseSlice";

const AddExpenseForm = () => {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    dispatch(
      addExpense({
        id: crypto.randomUUID(),
        title,
        amount: Number(amount),
        category,
        date,
        notes: "",
        createdAt: new Date().toISOString(),
      })
    );

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">Expense title</label>
        <input
          type="text"
          placeholder="Groceries, fuel, rent..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">Amount</label>
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-sky-200"
      >
        Add Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;