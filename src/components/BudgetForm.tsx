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
        <form className="flex gap-2" onSubmit={handleSubmit}>
            <input
                type="number"
                placeholder="Set Monthly Budget"
                value={budget}
                onChange={(e) => setBudgetValue(e.target.value)}
                className="border flex-1 px-4 py-2rounded w-full "
            />
            <button
                type="submit"
                className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded"
            >
                Save Budget
            </button>
        </form>
    );
};

export default BudgetForm;