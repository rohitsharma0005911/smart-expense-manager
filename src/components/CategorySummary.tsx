import { useAppSelector } from "../hooks/reduxHooks";
import { selectCategorySummary } from "../features/expenses/expenseSlice";

const CategorySummary = () => {
    const summary = useAppSelector(selectCategorySummary);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border max-w-3xl">
            <h2 className="text-lg font-semibold mb-4">
                Category Breakdown
            </h2>

            {Object.keys(summary).length === 0 ? (
                <p className="text-gray-500">No data available</p>
            ) : (
                <div className="space-y-2">
                    {Object.entries(summary).map(([category, total]) => (
                        <div
                            key={category}
                            className="flex justify-between border-b pb-2"
                        >
                            <span>{category}</span>
                            <span className="font-semibold">₹ {total}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategorySummary;