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
import {
  closeEditModal,
  selectIsEditModalOpen,
  selectSortBy,
  setSortBy,
} from "./features/ui/uiSlice";

import AddExpenseForm from "./components/AddExpenseForm.tsx";
import EditExpenseForm from "./components/EditExpenseForm.tsx";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal.tsx";

const StatCard = ({
  title,
  value,
  tone,
}: {
  title: string;
  value: string | number;
  tone: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${tone}`} />
    </div>
    <h2 className="text-3xl font-bold tracking-tight text-slate-800">{value}</h2>
  </div>
);

const navigation = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "analytics", label: "Analytics", icon: "◔" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "add-expense", label: "Add expense", icon: "+" },
  { id: "finances", label: "Budget & income", icon: "▤" },
] as const;

type Section = (typeof navigation)[number]["id"];

function App() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const totalExpense = useAppSelector(selectTotalByCategory(selectedCategory));
  const expenseCount = useAppSelector(selectExpenseCount(selectedCategory));
  const income = useAppSelector(selectIncome);
  const savings = useAppSelector(selectSavings);
  const budget = useAppSelector(selectBudget);
  const budgetUsage = useAppSelector(selectBudgetUsage);
  const remainingBudget = useAppSelector(selectRemainingBudget);

  const dispatch = useAppDispatch();
  const isEditModalOpen = useAppSelector(selectIsEditModalOpen);
  const sortBy = useAppSelector(selectSortBy);
  const expenses = useAppSelector((state) => state.expenses.items);

  const uniqueMonths = Array.from(
    new Set(expenses.map((expense) => expense.date.slice(0, 7)))
  ).sort((a, b) => (a > b ? -1 : 1));

  const formatMonth = (month: string) => {
    const [year, monthIndex] = month.split("-");
    const date = new Date(Number(year), Number(monthIndex) - 1);

    return date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const budgetProgress = Math.min(budgetUsage, 100);
  const budgetTone =
    budgetUsage >= 100 ? "bg-red-500" : budgetUsage >= 80 ? "bg-amber-400" : "bg-emerald-500";
  const activePage = navigation.find((item) => item.id === activeSection);
  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedMonth !== "All" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    searchTerm !== "";

  const clearExpenseFilters = () => {
    setSelectedCategory("All");
    setSelectedMonth("All");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,#f8fafc_46%,#e2e8f0)] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-400 flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
          <div className="mb-5 flex items-center gap-3 lg:mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-sky-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-sky-200">
              S
            </div>
            <div>
              <p className="font-bold leading-tight text-slate-900">SmartSpend</p>
              <p className="mt-1 text-xs text-slate-500">Expense manager</p>
            </div>
          </div>

          <p className="mb-3 hidden px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 lg:block">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {navigation.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${
                    isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`} aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                  {item.id === "transactions" && (
                    <span className={`ml-auto hidden rounded-full px-2 py-0.5 text-xs lg:inline ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {expenses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-2xl bg-slate-50 p-4 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">This month</p>
            <p className="mt-2 text-lg font-bold text-slate-800">₹ {totalExpense}</p>
            <p className="mt-1 text-xs text-slate-500">Total expenses tracked</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Personal finance
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {activePage?.label}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Track, understand, and manage your money with clarity.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
              Track • Analyze • Improve
            </div>
          </header>

          {activeSection === "overview" && (
            <>
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Income" value={`₹ ${income}`} tone="bg-emerald-500" />
                <StatCard title="Total Expenses" value={`₹ ${totalExpense}`} tone="bg-red-500" />
                <StatCard title="Savings" value={`₹ ${savings}`} tone="bg-sky-500" />
                <StatCard title="Transactions" value={expenseCount} tone="bg-violet-500" />
              </section>
              <section className="mb-6 rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Budget status</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {budget > 0 ? `₹${budget} monthly budget` : "No budget set"}
                    </h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    {budget > 0 ? `${budgetUsage.toFixed(1)}% used` : "Setup your budget"}
                  </div>
                </div>
                <div className="mb-4 h-4 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${budgetTone}`} style={{ width: `${budgetProgress}%` }} />
                </div>
                <p className="text-sm text-slate-600">
                  {budget > 0 ? (
                    remainingBudget >= 0 ? (
                      <span className="font-semibold text-emerald-600">₹{remainingBudget} remaining</span>
                    ) : (
                      <span className="font-semibold text-red-600">₹{Math.abs(remainingBudget)} over budget</span>
                    )
                  ) : "Set a monthly limit to keep spending under control."}
                </p>
              </section>
              <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <CategoryChart />
                </div>
                <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <MonthlyComparison />
                </div>
              </section>
              <section className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <CategorySummary />
              </section>
            </>
          )}

          {activeSection === "analytics" && (
            <>
              {/* <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <CategoryChart />
                </div>
                <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <MonthlyComparison />
                </div>
              </section> */}
              <section className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <CategorySummary />
              </section>
            </>
          )}

          {activeSection === "transactions" && (
            <section className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Expense history</h2>
                    <p className="mt-1 text-sm text-slate-500">Search by expense name or narrow your list by date.</p>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearExpenseFilters}
                      className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:self-auto"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="expense-search" className="mb-2 block text-sm font-semibold text-slate-600">Search by expense name</label>
                  <input
                    id="expense-search"
                    type="text"
                    placeholder="e.g. Groceries, rent, coffee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <div>
                    <label htmlFor="expense-category" className="mb-2 block text-sm font-semibold text-slate-600">Category</label>
                    <select id="expense-category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                      <option value="All">All</option>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expense-sort" className="mb-2 block text-sm font-semibold text-slate-600">Sort by</label>
                    <select id="expense-sort" value={sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="amount-desc">High → Low</option>
                      <option value="amount-asc">Low → High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expense-month" className="mb-2 block text-sm font-semibold text-slate-600">Month</label>
                    <select id="expense-month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100">
                      <option value="All">All Months</option>
                      {uniqueMonths.map((month) => (
                        <option key={month} value={month}>{formatMonth(month)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expense-date-from" className="mb-2 block text-sm font-semibold text-slate-600">From date</label>
                    <input
                      id="expense-date-from"
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="expense-date-to" className="mb-2 block text-sm font-semibold text-slate-600">To date</label>
                    <input
                      id="expense-date-to"
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>
              <ExpenseList
                selectedCategory={selectedCategory}
                selectedMonth={selectedMonth}
                dateFrom={dateFrom}
                dateTo={dateTo}
                searchTerm={debouncedSearch}
              />
            </section>
          )}

          {activeSection === "add-expense" && (
            <section className="max-w-2xl rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <h2 className="mb-1 text-xl font-bold text-slate-800">Record a new expense</h2>
              <p className="mb-6 text-sm text-slate-500">Add the details below to keep your spending up to date.</p>
              <AddExpenseForm />
            </section>
          )}

          {activeSection === "finances" && (
            <div className="max-w-3xl space-y-6">
              <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h2 className="mb-1 text-xl font-bold text-slate-800">Monthly budget</h2>
                <p className="mb-5 text-sm text-slate-500">Set a spending limit and monitor how much remains.</p>
                <BudgetForm />
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-600">{budget > 0 ? `${budgetUsage.toFixed(1)}% used` : "No budget set"}</span>
                    <span className="font-semibold text-slate-800">{budget > 0 ? `₹${budget}` : "—"}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${budgetTone}`} style={{ width: `${budgetProgress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {budget > 0 ? (remainingBudget >= 0 ? `₹${remainingBudget} remaining` : `₹${Math.abs(remainingBudget)} over budget`) : "Your monthly budget progress will appear here."}
                  </p>
                </div>
              </section>
              <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h2 className="mb-1 text-xl font-bold text-slate-800">Monthly income</h2>
                <p className="mb-5 text-sm text-slate-500">Keep your income up to date for an accurate savings overview.</p>
                <IncomeForm />
              </section>
            </div>
          )}
        </main>
      </div>

      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => dispatch(closeEditModal())} title="Edit Expense">
          <EditExpenseForm />
        </Modal>
      )}
      <ConfirmDeleteModal />
    </div>
  );
}

export default App;