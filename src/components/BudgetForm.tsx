import { useState } from "react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { setBudget } from "../features/income/incomeSlice";

const BudgetForm = () => {
    const [budget, setBudgetValue] = useState("");
    const dispatch = useAppDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setBudget(Number(budget)));
        setBudgetValue("");
    };

    return (
        <form className="flex flex-col gap-3 rounded-[22px] border border-violet-200 bg-white/80 p-4 shadow-[0_12px_30px_rgba(109,40,217,0.08)] sm:flex-row sm:items-center" onSubmit={handleSubmit}>
            <input
                type="number"
                placeholder="Set Monthly Budget"
                value={budget}
                onChange={(e) => setBudgetValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
            <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-violet-200 whitespace-nowrap"
            >
                Save Budget
            </button>
        </form>
    );
};

export default BudgetForm;