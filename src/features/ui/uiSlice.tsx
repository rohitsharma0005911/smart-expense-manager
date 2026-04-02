import { createSlice } from "@reduxjs/toolkit";

interface UIState {
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    sortBy: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

}

const initialState: UIState = {
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    sortBy: "date-desc", // default newest first
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openEditModal: (state) => {
            state.isEditModalOpen = true;
        },
        closeEditModal: (state) => {
            state.isEditModalOpen = false;
        },
        openDeleteModal: (state) => {
            state.isDeleteModalOpen = true;
        },
        closeDeleteModal: (state) => {
            state.isDeleteModalOpen = false;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
    },
});

export const {
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    setSortBy
} = uiSlice.actions;

export const selectIsEditModalOpen = (state: any) =>
    state.ui.isEditModalOpen;

export const selectIsDeleteModalOpen = (state: any) =>
    state.ui.isDeleteModalOpen;

export const selectSortBy = (state: any) => state.ui.sortBy;
export default uiSlice.reducer;