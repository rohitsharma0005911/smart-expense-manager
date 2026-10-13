import { useAppSelector } from "../hooks/reduxHooks";
import { selectSortBy } from "../features/ui/uiSlice";
import ExpenseItem from "./ExpenseItem";

interface Props {
    selectedCategory: string;
    selectedMonth: string;
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
}

const ExpenseList = ({ selectedCategory, selectedMonth, dateFrom, dateTo, searchTerm }: Props) => {
    const expenses = useAppSelector((state) => state.expenses.items);
    const sortBy = useAppSelector(selectSortBy);

    let filteredExpenses =
        selectedCategory === "All"
            ? expenses
            : expenses.filter((expense) => expense.category === selectedCategory);

    if (selectedMonth !== "All") {
        filteredExpenses = filteredExpenses.filter((expense) =>
            expense.date.startsWith(selectedMonth)
        );
    }

    if (dateFrom) {
        filteredExpenses = filteredExpenses.filter((expense) => expense.date >= dateFrom);
    }

    if (dateTo) {
        filteredExpenses = filteredExpenses.filter((expense) => expense.date <= dateTo);
    }

    if (searchTerm.trim() !== "") {
        const normalizedSearch = searchTerm.toLowerCase();
        filteredExpenses = filteredExpenses.filter((expense) =>
            expense.title.toLowerCase().includes(normalizedSearch)
        );
    }

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        switch (sortBy) {
            case "date-desc":
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            case "date-asc":
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "amount-desc":
                return b.amount - a.amount;
            case "amount-asc":
                return a.amount - b.amount;
            default:
                return 0;
        }
    });

    const totalAmount = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-emerald-700">Total spent</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-emerald-600">₹ {totalAmount}</p>
                </div>
                <p className="text-sm font-medium text-emerald-800">
                    {sortedExpenses.length} {sortedExpenses.length === 1 ? "expense" : "expenses"} found
                </p>
            </div>

            {sortedExpenses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    No matching expenses found.
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedExpenses.map((expense) => (
                        <ExpenseItem key={expense.id} expense={expense} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpenseList;