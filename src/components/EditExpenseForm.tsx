import { useState } from "react";
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

    const [title, setTitle] = useState(() => editingExpense?.title ?? "");
    const [amount, setAmount] = useState(() => editingExpense?.amount.toString() ?? "");
    const [category, setCategory] = useState(() => editingExpense?.category ?? "Food");
    const [date, setDate] = useState(() => editingExpense?.date ?? "");

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
        <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Transaction details
                </p>
                <p className="mt-1 text-sm text-slate-600">
                    Make changes below and save when you’re done.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="edit-expense-title" className="mb-2 block text-sm font-semibold text-slate-700">
                        Expense name
                    </label>
                    <input
                        id="edit-expense-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Groceries"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                </div>

                <div>
                    <label htmlFor="edit-expense-amount" className="mb-2 block text-sm font-semibold text-slate-700">
                        Amount
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-semibold text-slate-500">
                            ₹
                        </span>
                        <input
                            id="edit-expense-amount"
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="edit-expense-category" className="mb-2 block text-sm font-semibold text-slate-700">
                            Category
                        </label>
                        <select
                            id="edit-expense-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        >
                            <option>Food</option>
                            <option>Travel</option>
                            <option>Shopping</option>
                            <option>Bills</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit-expense-date" className="mb-2 block text-sm font-semibold text-slate-700">
                            Date
                        </label>
                        <input
                            id="edit-expense-date"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="w-full rounded-xl bg-linear-to-r from-sky-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-200"
                >
                    Save changes
                </button>
            </div>
        </form>
    );
};

export default EditExpenseForm;