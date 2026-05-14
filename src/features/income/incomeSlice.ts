import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

interface IncomeState {
  amount: number;
  budget: number;
}

const loadIncome = (): number => {
  try {
    if (typeof window === "undefined") return 0;

    const data = localStorage.getItem("income");

    return data ? JSON.parse(data) : 0;
  } catch {
    return 0;
  }
};

const loadBudget = (): number => {
  try {
    if (typeof window === "undefined") return 0;

    const data = localStorage.getItem("budget");

    return data ? JSON.parse(data) : 0;
  } catch {
    return 0;
  }
};

const initialState: IncomeState = {
  amount: loadIncome(),
  budget: loadBudget(),
};

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {
  setIncome: (state, action: PayloadAction<number>) => {
  state.amount = action.payload;

  if (typeof window !== "undefined") {
    localStorage.setItem("income", JSON.stringify(state.amount));
  }
},

setBudget: (state, action: PayloadAction<number>) => {
  state.budget = action.payload;

  if (typeof window !== "undefined") {
    localStorage.setItem("budget", JSON.stringify(state.budget));
  }
},
  },
});

export const { setIncome, setBudget } = incomeSlice.actions;
export const selectBudget = (state: RootState) => state.income.budget;
export const selectIncome = (state: RootState) => state.income.amount;

export default incomeSlice.reducer;
