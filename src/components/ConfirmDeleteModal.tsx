import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import {
    deleteExpense,
    selectExpenseToDelete,
    clearExpenseToDelete,
} from "../features/expenses/expenseSlice";
import {
    closeDeleteModal,
    selectIsDeleteModalOpen,
} from "../features/ui/uiSlice";
import Modal from "./ui/Modal";

const ConfirmDeleteModal = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(selectIsDeleteModalOpen);
    const expense = useAppSelector(selectExpenseToDelete);

    if (!expense) return null;

    const handleConfirm = () => {
        dispatch(deleteExpense(expense.id));
        dispatch(clearExpenseToDelete());
        dispatch(closeDeleteModal());
    };

    const handleCancel = () => {
        dispatch(clearExpenseToDelete());
        dispatch(closeDeleteModal());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Confirm Delete"
        >
            <div className="space-y-4">
                <p>
                    Are you sure you want to delete{" "}
                    <strong>{expense.title}</strong>?
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        className="bg-red-600 text-white px-4 py-2 rounded w-full"
                    >
                        Yes, Delete
                    </button>

                    <button
                        onClick={handleCancel}
                        className="bg-gray-300 px-4 py-2 rounded w-full"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDeleteModal;