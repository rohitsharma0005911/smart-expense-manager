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

const loadExpenses = () => {
  try {
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
      localStorage.setItem("expenses", JSON.stringify(state.items));
    },

    removeExpense: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (expense) => expense.id !== action.payload,
      );
      localStorage.setItem("expenses", JSON.stringify(state.items));
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.items.findIndex(
        (expense) => expense.id === action.payload.id,
      );

      if (index !== -1) {
        state.items[index] = action.payload;
        localStorage.setItem("expenses", JSON.stringify(state.items));
      }
    },
    deleteExpense: (state, action) => {
      state.items = state.items.filter(
        (expense) => expense.id !== action.payload,
      );
    },

    setEditingExpense: (state, action) => {
      state.editingExpense = action.payload;
    },

    setExpenseToDelete: (state, action) => {
      state.expenseToDelete = action.payload;
    },

    clearExpenseToDelete: (state) => {
      state.expenseToDelete = null;
    },
  },
});

/* ---------- SELECTORS ---------- */
export const {
  addExpense,
  updateExpense,
  deleteExpense, // 👈 MUST BE HERE
  setEditingExpense,
  setExpenseToDelete,
  clearExpenseToDelete,
  removeExpense,
} = expenseSlice.actions;
export const selectEditingExpense = (state: RootState) =>
  state.expenses.editingExpense;
export const selectExpenseToDelete = (state: any) =>
  state?.expenses?.expenseToDelete;
// Total (all)
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
              expense.category.toLowerCase() === category.toLowerCase(),
          );

    return filtered.reduce((total, expense) => total + expense.amount, 0);
  };

// Category count
export const selectExpenseCount = (category: string) => (state: RootState) => {
  const expenses = state.expenses.items;

  const filtered =
    category === "All"
      ? expenses
      : expenses.filter(
          (expense) =>
            expense.category.toLowerCase() === category.toLowerCase(),
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

// Monthly comparison (ONLY ONE VERSION)
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

export const selectSavings = (state: RootState) => {
  const totalExpense = state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  return state.income.amount - totalExpense;
};

export const selectBudgetUsage = (state: RootState) => {
  const totalExpense = state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const budget = Number(state.income.budget);

  if (!budget || budget <= 0) return 0;

  return (totalExpense / budget) * 100;
};

export const selectRemainingBudget = (state: RootState) => {
  const totalExpense = state.expenses.items.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const budget = Number(state.income.budget);

  if (!budget || budget <= 0) return 0;

  return budget - totalExpense;
};
