import { useAppSelector } from "../hooks/reduxHooks";
import { selectSortBy } from "../features/ui/uiSlice";
import ExpenseItem from "./ExpenseItem";

interface Props {
    selectedCategory: string;
    selectedMonth: string;
    searchTerm: string;
}

const ExpenseList = ({ selectedCategory, selectedMonth, searchTerm }: Props) => {
    const expenses = useAppSelector((state) => state.expenses.items);
    const sortBy = useAppSelector(selectSortBy);

    // 1️⃣ Category Filter
    let filteredExpenses =
        selectedCategory === "All"
            ? expenses
            : expenses.filter(
                (expense) => expense.category === selectedCategory
            );

    // 2️⃣ Month Filter
    if (selectedMonth !== "All") {
        filteredExpenses = filteredExpenses.filter((expense) =>
            expense.date.startsWith(selectedMonth)
        );
    }
    // 3️⃣ Search Filter
    if (searchTerm.trim() !== "") {
        const normalizedSearch = searchTerm.toLowerCase();
        filteredExpenses = filteredExpenses.filter((expense) =>
            expense.title.toLowerCase().includes(normalizedSearch)
        );
    }
    // 2️⃣ Sorting Logic
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

    const totalAmount = sortedExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );
    return (
        <div className="mt-8 space-y-4 max-w-md">
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
                <h2 className="text-lg font-semibold">Total Spent</h2>
                <p className="text-2xl font-bold text-green-600">
                    ₹ {totalAmount}
                </p>
            </div>
            {sortedExpenses.map((expense) => (
                <ExpenseItem key={expense.id} expense={expense} />
            ))}
        </div>
    );
};

export default ExpenseList;