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
        <div className="bg-white p-4 rounded-xl flex justify-between items-center border border-gray-400">

            <div>
                <h3 className="font-semibold">{expense.title}</h3>
                <p className="text-sm text-gray-500">
                    ₹ {expense.amount} • {expense.category}
                </p>
                <p className="text-gray-500"><b>Date</b>: {expense.date}</p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => {
                        dispatch(setEditingExpense(expense)); // set data
                        dispatch(openEditModal());            // open modal
                    }}
                    className="text-blue-500 text-sm"
                >
                    Edit
                </button>

                <button
                    // onClick={() => dispatch(removeExpense(expense.id))}
                    onClick={() => {
                        dispatch(setExpenseToDelete(expense));
                        dispatch(openDeleteModal());
                    }}
                    className="text-red-500 text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ExpenseItem;