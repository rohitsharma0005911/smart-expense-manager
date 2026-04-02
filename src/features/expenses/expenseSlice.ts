import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { Expense } from "./types";

interface ExpenseState {
  items: Expense[];
  loading: boolean;
  error: string | null;
  editingExpense: Expense | null;
  expenseToDelete: Expense | null;
}

// ✅ SSR safe load
const loadExpenses = (): Expense[] => {
  try {
    if (typeof window === "undefined") return [];

    const data = localStorage.getItem("expenses");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const initialState: ExpenseState = {
  items: loadExpenses(),
  loading: false,
  error: null,
  editingExpense: null,
  expenseToDelete: null,
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.items.push(action.payload);
    },

    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.items.findIndex(
        (expense) => expense.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // ✅ single delete (remove duplicate)
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (expense) => expense.id !== action.payload
      );
    },

    setEditingExpense: (
      state,
      action: PayloadAction<Expense | null>
    ) => {
      state.editingExpense = action.payload;
    },

    setExpenseToDelete: (
      state,
      action: PayloadAction<Expense | null>
    ) => {
      state.expenseToDelete = action.payload;
    },

    clearExpenseToDelete: (state) => {
      state.expenseToDelete = null;
    },
  },
});

/* ---------- ACTIONS ---------- */
export const {
  addExpense,
  updateExpense,
  deleteExpense,
  setEditingExpense,
  setExpenseToDelete,
  clearExpenseToDelete,
} = expenseSlice.actions;

/* ---------- SELECTORS ---------- */
export const selectEditingExpense = (state: RootState) =>
  state.expenses.editingExpense;

export const selectExpenseToDelete = (state: RootState) =>
  state.expenses.expenseToDelete;

// Total expense
export const selectTotalExpense = (state: RootState) =>
  state.expenses.items.reduce((total, expense) => total + expense.amount, 0);

// Category total
export const selectTotalByCategory =
  (category: string) => (state: RootState) => {
    const expenses = state.expenses.items;

    const filtered =
      category === "All"
        ? expenses
        : expenses.filter(
            (expense) =>
              expense.category.toLowerCase() === category.toLowerCase()
          );

    return filtered.reduce((total, expense) => total + expense.amount, 0);
  };

// Category count
export const selectExpenseCount =
  (category: string) => (state: RootState) => {
    const expenses = state.expenses.items;

    const filtered =
      category === "All"
        ? expenses
        : expenses.filter(
            (expense) =>
              expense.category.toLowerCase() === category.toLowerCase()
          );

    return filtered.length;
  };

// Category summary
export const selectCategorySummary = (state: RootState) => {
  const summary: Record<string, number> = {};

  state.expenses.items.forEach((expense) => {
    if (!summary[expense.category]) {
      summary[expense.category] = 0;
    }
    summary[expense.category] += expense.amount;
  });

  return summary;
};

// Monthly comparison
export const selectMonthlyComparison = (state: RootState) => {
  const expenses = state.expenses.items;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentTotal = 0;
  let previousTotal = 0;

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    ) {
      currentTotal += expense.amount;
    }

    if (
      date.getMonth() === previousMonth &&
      date.getFullYear() === previousYear
    ) {
      previousTotal += expense.amount;
    }
  });

  return {
    currentTotal,
    previousTotal,
    difference: currentTotal - previousTotal,
  };
};

export default expenseSlice.reducer;

/* ---------- EXTRA SELECTORS ---------- */

// Savings
export const selectSavings = (state: RootState) => {
  const totalExpense = state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  return state.income.amount - totalExpense;
};

// Budget usage %
export const selectBudgetUsage = (state: RootState) => {
  const totalExpense = state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const budget = Number(state.income.budget);

  if (!budget || budget <= 0) return 0;

  return (totalExpense / budget) * 100;
};

// Remaining budget
export const selectRemainingBudget = (state: RootState) => {
  const totalExpense = state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const budget = Number(state.income.budget);

  if (!budget || budget <= 0) return 0;

  return budget - totalExpense;
  
};