import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "../features/expenses/expenseSlice";
import incomeReducer from "../features/income/incomeSlice";
import uiReducer from "../features/ui/uiSlice";


// ✅ Load state from localStorage
// const loadState = (): Partial<{
//   expenses: ReturnType<typeof expenseReducer>;
//   income: ReturnType<typeof incomeReducer>;
//   ui: ReturnType<typeof uiReducer>;
// }> | undefined => {
//   try {
//     if (typeof window === "undefined") return undefined;

//     const serializedState = localStorage.getItem("expensesState");

//     if (!serializedState) return undefined;

//     return JSON.parse(serializedState);
//   } catch {
//     return undefined;
//   }
// };

// ✅ Create store
export const store = configureStore({
  reducer: {
    expenses: expenseReducer,
    income: incomeReducer,
    ui: uiReducer,
  },
});

// ✅ Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Save state
const saveState = (state: RootState) => {
  try {
    if (typeof window === "undefined") return;

    const serializedState = JSON.stringify(state);

    localStorage.setItem("expensesState", serializedState);
  } catch {
    // ignore write errors
  }
};

// ✅ Subscribe
store.subscribe(() => {
  saveState(store.getState());
});