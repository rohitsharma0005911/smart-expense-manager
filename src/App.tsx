import { useEffect, useState } from "react";

import ExpenseList from "./components/ExpenseList";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import {
  selectTotalByCategory,
  selectExpenseCount,
} from "./features/expenses/expenseSlice";
import CategorySummary from "./components/CategorySummary";
import CategoryChart from "./components/CategoryChart";
import MonthlyComparison from "./components/MonthlyComparison";
import IncomeForm from "./components/IncomeForm";
import { selectIncome } from "./features/income/incomeSlice";
import { selectSavings } from "./features/expenses/expenseSlice";
import BudgetForm from "./components/BudgetForm";
import { selectBudget } from "./features/income/incomeSlice";
import { selectBudgetUsage } from "./features/expenses/expenseSlice";
import { selectRemainingBudget } from "./features/expenses/expenseSlice";
import Modal from "./components/ui/Modal";
import { closeEditModal, selectIsEditModalOpen, selectSortBy, setSortBy } from "./features/ui/uiSlice";
import { selectEditingExpense, setEditingExpense } from "./features/expenses/expenseSlice";
import AddExpenseForm from "./components/AddExpenseForm.tsx";
import EditExpenseForm from "./components/EditExpenseForm.tsx";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal.tsx";
function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  // const totalExpense = useAppSelector(
  //   selectTotalByCategory(selectedCategory)
  // );

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const totalExpense = useAppSelector(
    selectTotalByCategory(selectedCategory)
  );

  const expenseCount = useAppSelector(
    selectExpenseCount(selectedCategory)
  );

  const income = useAppSelector(selectIncome);
  const savings = useAppSelector(selectSavings);

  const budget = useAppSelector(selectBudget);
  const budgetUsage = useAppSelector(selectBudgetUsage);
  const remainingBudget = useAppSelector(selectRemainingBudget);
  const editingExpense = useAppSelector(selectEditingExpense);
  const dispatch = useAppDispatch();
  const isEditModalOpen = useAppSelector(selectIsEditModalOpen);

  const sortBy = useAppSelector(selectSortBy);
  const expenses = useAppSelector((state) => state.expenses.items);
  const uniqueMonths = Array.from(
    new Set(
      expenses.map((expense) => expense.date.slice(0, 7)) // "YYYY-MM"
    )
  ).sort((a, b) => (a > b ? -1 : 1)); // newest first


  const formatMonth = (month: string) => {
    const [year, monthIndex] = month.split("-");
    const date = new Date(Number(year), Number(monthIndex) - 1);

    return date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-6">





        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Smart Expense Manager
          </h1>
          <p className="text-sm text-slate-500">
            Track • Analyze • Improve
          </p>
        </div>
        <div className="mb-10">
          <BudgetForm />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border mb-10">
          <h2 className="text-lg font-semibold mb-4">Budget Status</h2>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full ${budgetUsage >= 100
                ? "bg-red-500"
                : budgetUsage >= 80
                  ? "bg-yellow-500"
                  : "bg-green-500"
                }`}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {budget > 0 ? (
              <>
                {budgetUsage.toFixed(1)}% used •
                {remainingBudget >= 0 ? (
                  <span className="text-green-600 font-medium">
                    ₹{remainingBudget} remaining
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    ₹{Math.abs(remainingBudget)} over budget
                  </span>
                )}
              </>
            ) : (
              "No budget set"
            )}
          </p>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-sm text-slate-500">Income</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              ₹ {income}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <h2 className="text-3xl font-bold text-red-500 mt-2">
              ₹ {totalExpense}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-sm text-slate-500">Savings</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              ₹ {savings}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <p className="text-sm text-slate-500">Transactions</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {expenseCount}
            </h2>
          </div>

        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <CategoryChart />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <MonthlyComparison />
          </div>
        </div>

        {/* CATEGORY SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-12">
          <CategorySummary />
        </div>

        {/* FORMS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">
              Set Monthly Income
            </h2>
            <IncomeForm />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">
              Add Expense
            </h2>



            <AddExpenseForm />
          </div>

        </div>

        {/* EXPENSE LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">

          <div>
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
          </div>

          <h4 className="font-bold text-lg mb-2">Filter by Category</h4>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border p-2 rounded mb-4 w-50"
          >
            <option value="All">All</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
            className="border p-2 rounded mb-4 ml-4"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount High → Low</option>
            <option value="amount-asc">Amount Low → High</option>
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-2 rounded mb-4"
          >
            <option value="All">All Months</option>

            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
          <ExpenseList selectedCategory={selectedCategory} selectedMonth={selectedMonth} searchTerm={debouncedSearch} />
        </div>

      </div>

      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen}
          onClose={() => dispatch(closeEditModal())}
          title="Edit Expense">
          <EditExpenseForm />
        </Modal>
      )}
      <ConfirmDeleteModal />
    </div >
  );
}

export default App;