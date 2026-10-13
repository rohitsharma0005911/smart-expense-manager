import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

interface IncomeState {
  amount: number;
  budget: number;
}

const initialState: IncomeState = {
  amount: 0,
  budget: 0,
};

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {
    setIncome: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    setBudget: (state, action: PayloadAction<number>) => {
      state.budget = action.payload;
    },
  },
});

export const { setIncome, setBudget } = incomeSlice.actions;
export const selectBudget = (state: RootState) => state.income.budget;
export const selectIncome = (state: RootState) => state.income.amount;

export default incomeSlice.reducer;
