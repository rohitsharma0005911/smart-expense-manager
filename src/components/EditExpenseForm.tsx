import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import {
    updateExpense,
    setEditingExpense,
    selectEditingExpense,
} from "../features/expenses/expenseSlice";
import { closeEditModal } from "../features/ui/uiSlice";

const EditExpenseForm = () => {
    const dispatch = useAppDispatch();
    const editingExpense = useAppSelector(selectEditingExpense);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [date, setDate] = useState("");

    useEffect(() => {
        if (editingExpense) {
            setTitle(editingExpense.title);
            setAmount(editingExpense.amount.toString());
            setCategory(editingExpense.category);
            setDate(editingExpense.date);
        }
    }, [editingExpense]);

    if (!editingExpense) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        dispatch(
            updateExpense({
                ...editingExpense,
                title,
                amount: Number(amount),
                category,
                date,
            })
        );

        dispatch(setEditingExpense(null));
        dispatch(closeEditModal());
    };

    const handleCancel = () => {
        dispatch(setEditingExpense(null));
        dispatch(closeEditModal());
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl space-y-4 w-full"
        >
            <h2 className="text-lg font-semibold">Edit Expense</h2>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
            />

            <input
                type="number"
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

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                    Update
                </button>

                <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 px-4 py-2 rounded w-full"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditExpenseForm;