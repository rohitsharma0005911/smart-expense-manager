import { combineReducers, configureStore } from "@reduxjs/toolkit";
import expenseReducer from "../features/expenses/expenseSlice";
import type { Expense } from "../features/expenses/types";
import incomeReducer from "../features/income/incomeSlice";
import uiReducer from "../features/ui/uiSlice";

const rootReducer = combineReducers({
  expenses: expenseReducer,
  income: incomeReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isExpense = (value: unknown): value is Expense => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    typeof value.category === "string" &&
    typeof value.date === "string" &&
    typeof value.createdAt === "string" &&
    (value.notes === undefined || typeof value.notes === "string")
  );
};

const readStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Unable to read saved app data ("${key}").`, error);
    return null;
  }
};

const readJson = (key: string): unknown => {
  const serialized = readStorage(key);
  if (serialized === null) return undefined;

  try {
    return JSON.parse(serialized) as unknown;
  } catch (error) {
    console.warn(`Saved app data ("${key}") is invalid JSON.`, error);
    return undefined;
  }
};

const isSortOrder = (
  value: unknown
): value is RootState["ui"]["sortBy"] =>
  value === "date-desc" ||
  value === "date-asc" ||
  value === "amount-desc" ||
  value === "amount-asc";

const loadState = (): Partial<RootState> | undefined => {
  const savedState = readJson("expensesState");
  if (isRecord(savedState)) {
    const savedExpenses = isRecord(savedState.expenses)
      ? savedState.expenses
      : undefined;
    const savedIncome = isRecord(savedState.income)
      ? savedState.income
      : undefined;
    const savedUi = isRecord(savedState.ui) ? savedState.ui : undefined;

    return {
      expenses: {
        ...expenseReducer(undefined, { type: "persistence/init" }),
        items:
          Array.isArray(savedExpenses?.items) &&
          savedExpenses.items.every(isExpense)
            ? savedExpenses.items
            : [],
      },
      income: {
        ...incomeReducer(undefined, { type: "persistence/init" }),
        amount:
          typeof savedIncome?.amount === "number" &&
          Number.isFinite(savedIncome.amount)
            ? savedIncome.amount
            : 0,
        budget:
          typeof savedIncome?.budget === "number" &&
          Number.isFinite(savedIncome.budget)
            ? savedIncome.budget
            : 0,
      },
      ui: {
        ...uiReducer(undefined, { type: "persistence/init" }),
        sortBy: isSortOrder(savedUi?.sortBy)
          ? savedUi.sortBy
          : "date-desc",
        isEditModalOpen: false,
        isDeleteModalOpen: false,
      },
    };
  }

  const legacyExpenses = readJson("expenses");
  const legacyIncome = readJson("income");
  const legacyBudget = readJson("budget");

  if (
    legacyExpenses === undefined &&
    legacyIncome === undefined &&
    legacyBudget === undefined
  ) {
    return undefined;
  }

  return {
    expenses: {
      ...expenseReducer(undefined, { type: "persistence/init" }),
      items:
        Array.isArray(legacyExpenses) && legacyExpenses.every(isExpense)
          ? legacyExpenses
          : [],
    },
    income: {
      ...incomeReducer(undefined, { type: "persistence/init" }),
      amount:
        typeof legacyIncome === "number" && Number.isFinite(legacyIncome)
          ? legacyIncome
          : 0,
      budget:
        typeof legacyBudget === "number" && Number.isFinite(legacyBudget)
          ? legacyBudget
          : 0,
    },
  };
};

const persistState = (state: RootState) => {
  if (typeof window === "undefined") return;

  try {
    const persistentState = {
      expenses: { items: state.expenses.items },
      income: state.income,
      ui: { sortBy: state.ui.sortBy },
    };
    window.localStorage.setItem("expensesState", JSON.stringify(persistentState));
  } catch (error) {
    console.warn("Unable to save app data to local storage.", error);
  }
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
});

persistState(store.getState());
store.subscribe(() => persistState(store.getState()));
