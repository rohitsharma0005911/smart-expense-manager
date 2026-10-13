import { useAppDispatch } from "../hooks/reduxHooks";
import {
    setEditingExpense,
    setExpenseToDelete,
} from "../features/expenses/expenseSlice";
import type { Expense } from "../features/expenses/types";
import { openDeleteModal, openEditModal } from "../features/ui/uiSlice";

interface Props {
    expense: Expense;
}

const ExpenseItem = ({ expense }: Props) => {
    const dispatch = useAppDispatch();

    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-sky-200 hover:bg-white">
            <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-slate-800">{expense.title}</h3>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                        {expense.category}
                    </span>
                </div>
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">₹ {expense.amount}</span> • {expense.date}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => {
                        dispatch(setEditingExpense(expense));
                        dispatch(openEditModal());
                    }}
                    className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                >
                    Edit
                </button>

                <button
                    onClick={() => {
                        dispatch(setExpenseToDelete(expense));
                        dispatch(openDeleteModal());
                    }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ExpenseItem;