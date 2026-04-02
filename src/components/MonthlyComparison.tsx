import { useAppSelector } from "../hooks/reduxHooks";
import { selectMonthlyComparison } from "../features/expenses/expenseSlice";

const MonthlyComparison = () => {
    const { currentTotal, previousTotal, difference } =
        useAppSelector(selectMonthlyComparison);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border mt-6 max-w-3xl">
            <h2 className="text-lg font-semibold mb-4">
                Monthly Comparison
            </h2>

            <div className="space-y-2">
                <p>Current Month: ₹ {currentTotal}</p>
                <p>Previous Month: ₹ {previousTotal}</p>

                <p
                    className={`font-bold ${difference >= 0 ? "text-red-500" : "text-green-500"
                        }`}
                >
                    Difference: ₹ {difference}
                </p>
            </div>
        </div>
    );
};

export default MonthlyComparison;