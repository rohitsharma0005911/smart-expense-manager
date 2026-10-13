import { useRef, useState, type ChangeEvent } from "react";
import { useAppSelector } from "../hooks/reduxHooks";

const backupKeys = [
  "expensesState",
  "smart-expense-upcoming-bills",
  "smart-expense-borrowed-lent",
  "smart-expense-category-budgets",
  "smart-expense-recurring",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value);

const isValidExpensesState = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.expenses) || !isRecord(value.income)) return false;
  const items = value.expenses.items;
  return (
    Array.isArray(items) &&
    items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        isNumber(item.amount) &&
        typeof item.category === "string" &&
        typeof item.date === "string" &&
        typeof item.createdAt === "string"
    ) &&
    isNumber(value.income.amount) &&
    isNumber(value.income.budget)
  );
};

const isValidRecordList = (
  value: unknown,
  isValidRecord: (record: Record<string, unknown>) => boolean
) =>
  Array.isArray(value) &&
  value.every((item) => isRecord(item) && isValidRecord(item));

const isValidBackup = (value: unknown): value is {
  format: string;
  version: number;
  data: Record<string, unknown>;
} => {
  if (
    !isRecord(value) ||
    value.format !== "smart-expense-manager-backup" ||
    value.version !== 1 ||
    !isRecord(value.data) ||
    !isValidExpensesState(value.data["expensesState"])
  ) {
    return false;
  }

  const data = value.data;
  if (
    data["smart-expense-upcoming-bills"] !== undefined &&
    !isValidRecordList(data["smart-expense-upcoming-bills"], (item) =>
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      isNumber(item.amount) &&
      typeof item.dueDate === "string" &&
      typeof item.paid === "boolean"
    )
  ) {
    return false;
  }
  if (
    data["smart-expense-borrowed-lent"] !== undefined &&
    !isValidRecordList(data["smart-expense-borrowed-lent"], (item) =>
      typeof item.id === "string" &&
      typeof item.person === "string" &&
      isNumber(item.amount) &&
      (item.direction === "borrowed" || item.direction === "lent") &&
      typeof item.date === "string" &&
      typeof item.settled === "boolean"
    )
  ) {
    return false;
  }
  if (data["smart-expense-category-budgets"] !== undefined) {
    const budgets = data["smart-expense-category-budgets"];
    if (
      !isRecord(budgets) ||
      !Object.values(budgets).every(
        (amount) =>
          typeof amount === "number" && Number.isFinite(amount) && amount >= 0
      )
    ) {
      return false;
    }
  }
  if (
    data["smart-expense-recurring"] !== undefined &&
    !isValidRecordList(data["smart-expense-recurring"], (item) =>
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      isNumber(item.amount) &&
      typeof item.category === "string" &&
      (item.frequency === "weekly" || item.frequency === "monthly" || item.frequency === "yearly") &&
      typeof item.nextDate === "string"
    )
  ) {
    return false;
  }

  return Object.keys(data).every((key) =>
    backupKeys.includes(key as (typeof backupKeys)[number])
  );
};

const downloadFile = (contents: string, fileName: string, type: string) => {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const quoteCsv = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

const ReportsAndData = () => {
  const expenses = useAppSelector((state) => state.expenses.items);
  const income = useAppSelector((state) => state.income.amount);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState("All");
  const [message, setMessage] = useState("");

  const years = Array.from(new Set(expenses.map((expense) => expense.date.slice(0, 4))))
    .filter((year) => /^\d{4}$/.test(year))
    .sort((a, b) => b.localeCompare(a));
  const reportExpenses =
    selectedYear === "All"
      ? expenses
      : expenses.filter((expense) => expense.date.startsWith(`${selectedYear}-`));
  const months = new Map<string, number>();
  reportExpenses.forEach((expense) => {
    const month = expense.date.slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + expense.amount);
  });
  const monthlyRows = Array.from(months.entries()).sort(([a], [b]) => b.localeCompare(a));

  const exportCsv = () => {
    const rows = [
      ["Date", "Expense", "Category", "Amount", "Notes"],
      ...reportExpenses.map((expense) => [
        expense.date,
        expense.title,
        expense.category,
        expense.amount,
        expense.notes ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map(quoteCsv).join(",")).join("\r\n");
    downloadFile(`\uFEFF${csv}`, `smart-expense-report-${selectedYear.toLowerCase()}.csv`, "text/csv;charset=utf-8");
    setMessage("CSV report downloaded.");
  };

  const exportBackup = () => {
    try {
      const data: Record<string, unknown> = {};
      backupKeys.forEach((key) => {
        const serialized = window.localStorage.getItem(key);
        if (serialized !== null) data[key] = JSON.parse(serialized) as unknown;
      });
      if (!data["expensesState"]) {
        data["expensesState"] = {
          expenses: { items: expenses },
          income: { amount: income, budget: 0 },
          ui: { sortBy: "date-desc" },
        };
      }
      downloadFile(
        JSON.stringify({ format: "smart-expense-manager-backup", version: 1, data }, null, 2),
        `smart-expense-backup-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json"
      );
      setMessage("Full app backup downloaded.");
    } catch (error) {
      console.error("Unable to create app backup.", error);
      setMessage("Could not create a backup. Check browser storage access and try again.");
    }
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isValidBackup(parsed)) {
        setMessage("That backup file is invalid or from an unsupported version.");
        return;
      }

      const previousValues = new Map<string, string | null>();
      try {
        backupKeys.forEach((key) => {
          previousValues.set(key, window.localStorage.getItem(key));
        });
        backupKeys.forEach((key) => {
          const value = parsed.data[key];
          if (value !== undefined) {
            window.localStorage.setItem(key, JSON.stringify(value));
          } else {
            window.localStorage.removeItem(key);
          }
        });
      } catch (error) {
        previousValues.forEach((previousValue, key) => {
          if (previousValue === null) window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, previousValue);
        });
        throw error;
      }

      setMessage("Backup restored. Reloading your saved data…");
      window.location.reload();
    } catch (error) {
      console.error("Unable to restore app backup.", error);
      setMessage("Could not read or restore that backup file.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Monthly reports</h2>
            <p className="mt-1 text-sm text-slate-500">Review spending totals and estimated savings by month.</p>
          </div>
          <label className="text-sm font-semibold text-slate-600">
            Report year
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <option value="All">All years</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-3 pr-4">Month</th><th className="py-3 pr-4">Expenses</th><th className="py-3 pr-4">Income</th><th className="py-3">Est. savings</th></tr>
            </thead>
            <tbody>
              {monthlyRows.map(([month, total]) => {
                const [year, monthNumber] = month.split("-");
                const monthLabel = new Date(Number(year), Number(monthNumber) - 1).toLocaleString("default", { month: "long", year: "numeric" });
                return (
                  <tr key={month} className="border-b border-slate-100 last:border-0">
                    <th className="py-3 pr-4 font-semibold text-slate-700">{monthLabel}</th>
                    <td className="py-3 pr-4 text-red-600">₹ {total}</td>
                    <td className="py-3 pr-4 text-emerald-600">₹ {income}</td>
                    <td className="py-3 font-medium text-slate-700">₹ {income - total}</td>
                  </tr>
                );
              })}
              {monthlyRows.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500">No expenses recorded for this period yet.</td></tr>
              )}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">Income and estimated savings use your currently saved monthly income.</p>
        </div>
        <button type="button" onClick={exportCsv} className="mt-5 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700">
          Export {selectedYear === "All" ? "all expenses" : selectedYear} to CSV
        </button>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="text-xl font-bold text-slate-800">Backup & restore</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">Download a portable backup of expenses, budgets, reminders, and recurring schedules.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={exportBackup} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Download full backup
          </button>
          <button type="button" onClick={() => fileInput.current?.click()} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Restore from backup
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={importBackup} />
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-slate-600">{message}</p>
        <p className="mt-2 text-xs text-slate-500">Restoring replaces the locally saved data for this app in this browser.</p>
      </section>
    </div>
  );
};

export default ReportsAndData;
