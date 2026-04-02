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
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-md"
        >
            <h2 className="text-lg font-semibold">Add Expense</h2>

            <input
                type="text"
                placeholder="Expense Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
            />

            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border p-2 rounded"
            />

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border p-2 rounded"
            >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
            </select>

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border p-2 rounded"
            />

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
                Add Expense
            </button>
        </form>
    );
};

export default AddExpenseForm;