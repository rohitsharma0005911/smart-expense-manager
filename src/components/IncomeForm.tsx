import { useState } from "react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { setIncome } from "../features/income/incomeSlice";

const IncomeForm = () => {
    const [income, setIncomeValue] = useState("");
    const dispatch = useAppDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setIncome(Number(income)));
        setIncomeValue("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="number"
                placeholder="Enter Monthly Income"
                value={income}
                onChange={(e) => setIncomeValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
            <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-emerald-200"
            >
                Save Income
            </button>
        </form>
    );
};

export default IncomeForm;