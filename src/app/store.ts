import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "../features/expenses/expenseSlice";
import incomeReducer from "../features/income/incomeSlice";
import uiReducer from "../features/ui/uiSlice";
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("expensesState");
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("expensesState", serializedState);
  } catch {
    // ignore write errors
  }
};

// export const store = configureStore({
//   reducer: {
//     expenses: expenseReducer,
//   },
// });

export const store = configureStore({
  reducer: {
    expenses: expenseReducer,
    income: incomeReducer,
    ui: uiReducer,
  },
  preloadedState: loadState(),
});

// ✅ These MUST be below store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

store.subscribe(() => {
  saveState(store.getState());
});
