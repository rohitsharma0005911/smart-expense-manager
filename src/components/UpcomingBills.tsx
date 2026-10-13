import { useEffect, useState, type FormEvent } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

const isBillList = (value: unknown): value is Bill[] =>
  Array.isArray(value) &&
  value.every(
    (bill) =>
      typeof bill === "object" &&
      bill !== null &&
      "id" in bill &&
      typeof bill.id === "string" &&
      "name" in bill &&
      typeof bill.name === "string" &&
      "amount" in bill &&
      typeof bill.amount === "number" &&
      Number.isFinite(bill.amount) &&
      "dueDate" in bill &&
      typeof bill.dueDate === "string" &&
      "paid" in bill &&
      typeof bill.paid === "boolean"
  );

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dueStatus = (dueDate: string) => {
  const today = new Date(`${toLocalDateString(new Date())}T00:00:00`);
  const due = new Date(`${dueDate}T00:00:00`);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
};

const UpcomingBills = () => {
  const [bills, setBills] = usePersistentState<Bill[]>(
    "smart-expense-upcoming-bills",
    [],
    isBillList
  );
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationReady, setNotificationReady] = useState(false);
  const notificationsSupported =
    typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (!notificationsSupported || Notification.permission !== "granted") return;

    const today = toLocalDateString(new Date());
    const reminderWindow = new Date(`${today}T00:00:00`);
    reminderWindow.setDate(reminderWindow.getDate() + 3);
    const lastReminderDate = toLocalDateString(reminderWindow);

    bills.forEach((bill) => {
      if (bill.paid || bill.dueDate < today || bill.dueDate > lastReminderDate) return;

      const reminderKey = `smart-expense-bill-reminder:${bill.id}:${today}`;
      try {
        if (window.localStorage.getItem(reminderKey)) return;
        new Notification("Upcoming payment", {
          body: `${bill.name} · ₹${bill.amount} · Due ${bill.dueDate}`,
        });
        window.localStorage.setItem(reminderKey, "sent");
      } catch (error) {
        console.warn("Unable to send a bill reminder notification.", error);
        setNotificationMessage("A browser notification could not be shown.");
      }
    });
  }, [bills, notificationReady, notificationsSupported]);

  const enableNotifications = async () => {
    if (!notificationsSupported) {
      setNotificationMessage("This browser does not support notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationReady(permission === "granted");
      setNotificationMessage(
        permission === "granted"
          ? "Notifications enabled for bills due within 3 days while the app is open."
          : "Notification permission was not granted."
      );
    } catch (error) {
      console.error("Unable to request notification permission.", error);
      setNotificationMessage("Could not request notification permission.");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!name.trim() || !dueDate || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    setBills((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        amount: parsedAmount,
        dueDate,
        paid: false,
      },
    ]);
    setName("");
    setAmount("");
    setDueDate("");
  };

  const sortedBills = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const unpaidTotal = bills.reduce(
    (total, bill) => total + (bill.paid ? 0 : bill.amount),
    0
  );

  return (
    <div className="max-w-4xl space-y-6">
      <section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Unpaid bills</p>
            <p className="mt-1 text-3xl font-black text-amber-900">₹ {unpaidTotal}</p>
            <p className="mt-1 text-sm text-amber-800">
              {bills.filter((bill) => !bill.paid).length} payment
              {bills.filter((bill) => !bill.paid).length === 1 ? "" : "s"} to track
            </p>
          </div>
          <button
            type="button"
            disabled={!notificationsSupported || Notification.permission === "granted"}
            onClick={enableNotifications}
            className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!notificationsSupported
              ? "Notifications unavailable"
              : Notification.permission === "granted"
                ? "Notifications enabled"
                : "Enable notifications"}
          </button>
        </div>
        <p role="status" aria-live="polite" className="mt-2 text-xs text-amber-800">
          {notificationMessage || "Optional browser alerts are shown for bills due within 3 days while the app is open."}
        </p>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <h2 className="text-xl font-bold text-slate-800">Add a bill reminder</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">Track upcoming and overdue payments in one place.</p>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="text-sm font-medium text-slate-600">
            Bill name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Electricity, rent..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Amount
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Due date
            <input
              required
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-200"
          >
            Add reminder
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Payment schedule</h2>
        {sortedBills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
            No bill reminders yet. Add a bill above to get started.
          </div>
        ) : (
          sortedBills.map((bill) => (
            <article key={bill.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{bill.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Due {bill.dueDate} · {bill.paid ? "Paid" : dueStatus(bill.dueDate)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="font-bold text-slate-800">₹ {bill.amount}</span>
                <button
                  type="button"
                  onClick={() =>
                    setBills((current) =>
                      current.map((item) =>
                        item.id === bill.id ? { ...item, paid: !item.paid } : item
                      )
                    )
                  }
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {bill.paid ? "Mark unpaid" : "Mark paid"}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${bill.name} reminder`}
                  onClick={() => setBills((current) => current.filter((item) => item.id !== bill.id))}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default UpcomingBills;
