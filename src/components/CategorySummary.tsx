import { useAppSelector } from "../hooks/reduxHooks";
import { selectCategorySummary } from "../features/expenses/expenseSlice";

const CategorySummary = () => {
    const summary = useAppSelector(selectCategorySummary);

    return (
        <div className="max-w-3xl">
            <h2 className="mb-4 text-xl font-bold text-slate-800">Category Breakdown</h2>

            {Object.keys(summary).length === 0 ? (
                <p className="text-slate-500">No data available</p>
            ) : (
                <div className="space-y-3">
                    {Object.entries(summary).map(([category, total]) => (
                        <div
                            key={category}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                            <span className="font-medium text-slate-700">{category}</span>
                            <span className="font-bold text-slate-900">₹ {total}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategorySummary;