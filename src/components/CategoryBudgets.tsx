import { useState } from "react";
import { useAppSelector } from "../hooks/reduxHooks";
import { usePersistentState } from "../hooks/usePersistentState";

const categories = ["Food", "Travel", "Shopping", "Bills"];
type BudgetLimits = Record<string, number>;

const isBudgetLimits = (value: unknown): value is BudgetLimits =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(
    (limit) => typeof limit === "number" && Number.isFinite(limit) && limit >= 0
  );

const getLocalMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const CategoryBudgets = () => {
  const expenses = useAppSelector((state) => state.expenses.items);
  const [limits, setLimits] = usePersistentState(
    "smart-expense-category-budgets",
    {},
    isBudgetLimits
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const currentMonth = getLocalMonth();

  const saveLimit = (category: string) => {
    const value = Number(drafts[category]);
    if (!Number.isFinite(value) || value < 0) return;
    setLimits((current) => ({ ...current, [category]: value }));
    setDrafts((current) => ({ ...current, [category]: "" }));
  };

  return (
    <section className="rounded-[26px] w-full border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <h2 className="text-xl font-bold text-slate-800">Category budgets</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">Set monthly spending limits for each category.</p>
      <div className="space-y-4">
        {categories.map((category) => {
          const spent = expenses
            .filter((expense) => expense.category === category && expense.date.startsWith(currentMonth))
            .reduce((total, expense) => total + expense.amount, 0);
          const limit = limits[category] ?? 0;
          const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const progressColor = spent > limit && limit > 0 ? "bg-red-500" : "bg-sky-500";

          return (
            <div key={category} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{category}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    ₹{spent} spent{limit > 0 ? ` of ₹${limit}` : ""}
                  </p>
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveLimit(category);
                  }}
                >
                  <label className="sr-only" htmlFor={`budget-${category}`}>{category} monthly limit</label>
                  <input
                    id={`budget-${category}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={drafts[category] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [category]: event.target.value }))
                    }
                    placeholder={limit > 0 ? String(limit) : "Monthly limit"}
                    className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                  <button type="submit" className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                    Save
                  </button>
                </form>
              </div>
              {limit > 0 ? (
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progress}%` }} />
                </div>
              ) : (
                <p className="text-xs text-slate-500">No limit set</p>
              )}
              {limit > 0 && spent > limit && (
                <p className="mt-2 text-xs font-medium text-red-600">Monthly limit exceeded by ₹{spent - limit}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBudgets;
