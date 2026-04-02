import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppSelector } from "../hooks/reduxHooks";
import { selectCategorySummary } from "../features/expenses/expenseSlice";

const COLORS = ["#0d3950", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];

const CategoryChart = () => {
    const summary = useAppSelector(selectCategorySummary);

    const data = Object.entries(summary).map(([name, value]) => ({
        name,
        value,
    }));

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border mt-6">
                <p className="text-gray-500">No chart data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border mt-6 max-w-3xl">
            <h2 className="text-lg text-primary font-semibold mb-4">
                Expense Distribution
            </h2>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CategoryChart;