import { useState } from "react";
import { useAppSelector } from "../hooks/reduxHooks";
import { selectSortBy } from "../features/ui/uiSlice";
import ExpenseItem from "./ExpenseItem";

type GroupBy = "month" | "year" | "none";

interface Props {
    selectedCategory: string;
    selectedMonth: string;
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
}

const ExpenseList = ({ selectedCategory, selectedMonth, dateFrom, dateTo, searchTerm }: Props) => {
    const [groupBy, setGroupBy] = useState<GroupBy>("month");
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
    const expenseGroups = new Map<string, typeof sortedExpenses>();

    sortedExpenses.forEach((expense) => {
        const groupKey =
            groupBy === "month"
                ? expense.date.slice(0, 7)
                : groupBy === "year"
                    ? expense.date.slice(0, 4)
                    : "all";
        const group = expenseGroups.get(groupKey) ?? [];
        group.push(expense);
        expenseGroups.set(groupKey, group);
    });

    const formatGroupLabel = (groupKey: string) => {
        if (groupBy === "year") return groupKey;
        if (groupBy === "none") return "All expenses";

        const [year, month] = groupKey.split("-");
        return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    };

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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="expense-grouping" className="text-sm font-semibold text-slate-600">
                    Group expenses by
                </label>
                <select
                    id="expense-grouping"
                    value={groupBy}
                    onChange={(event) => setGroupBy(event.target.value as GroupBy)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:w-48"
                >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="none">No grouping</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
            {sortedExpenses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    No matching expenses found.
                </div>
            ) : (
                Array.from(expenseGroups, ([groupKey, groupExpenses]) => {
                    const groupTotal = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);

                    return (
                        <section key={groupKey} className="space-y-3 border border-slate-200 rounded-2xl bg-white p-4 shadow-sm">
                            {groupBy !== "none" && (
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-3">
                                    <h3 className="font-semibold text-slate-700">
                                        {formatGroupLabel(groupKey)}
                                        <span className="ml-2 text-sm font-normal text-slate-500">
                                            ({groupExpenses.length} {groupExpenses.length === 1 ? "expense" : "expenses"})
                                        </span>
                                    </h3>
                                    <span className="text-sm font-semibold text-slate-600">₹ {groupTotal}</span>
                                </div>
                            )}
                            {groupExpenses.map((expense) => (
                                <ExpenseItem key={expense.id} expense={expense} />
                            ))}
                        </section>
                    );
                })
            )}
            </div>
        </div>
    );
};

export default ExpenseList;