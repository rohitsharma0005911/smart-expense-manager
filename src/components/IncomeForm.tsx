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
        <form onSubmit={handleSubmit} className="mb-6 max-w-md">
            <input
                type="number"
                placeholder="Enter Monthly Income"
                value={income}
                onChange={(e) => setIncomeValue(e.target.value)}
                className="border p-2 rounded w-full"
            />
            <button
                type="submit"
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
                Save Income
            </button>
        </form>
    );
};

export default IncomeForm;