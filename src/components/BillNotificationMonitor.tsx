import { useEffect } from "react";

interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

const isBillReminderList = (value: unknown): value is BillReminder[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      typeof item.id === "string" &&
      "name" in item &&
      typeof item.name === "string" &&
      "amount" in item &&
      typeof item.amount === "number" &&
      "dueDate" in item &&
      typeof item.dueDate === "string" &&
      "paid" in item &&
      typeof item.paid === "boolean"
  );

const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const BillNotificationMonitor = () => {
  useEffect(() => {
    const checkBills = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      try {
        const serialized = window.localStorage.getItem("smart-expense-upcoming-bills");
        if (serialized === null) return;

        const reminders: unknown = JSON.parse(serialized);
        if (!isBillReminderList(reminders)) {
          console.warn("Saved bill reminders have an unexpected format; notifications skipped.");
          return;
        }

        const today = localDate(new Date());
        const lastReminderDate = new Date(`${today}T00:00:00`);
        lastReminderDate.setDate(lastReminderDate.getDate() + 3);
        const throughDate = localDate(lastReminderDate);

        reminders.forEach((bill) => {
          if (bill.paid || bill.dueDate < today || bill.dueDate > throughDate) return;

          const reminderKey = `smart-expense-bill-reminder:${bill.id}:${today}`;
          if (window.localStorage.getItem(reminderKey)) return;
          new Notification("Upcoming payment", {
            body: `${bill.name} · ₹${bill.amount} · Due ${bill.dueDate}`,
          });
          window.localStorage.setItem(reminderKey, "sent");
        });
      } catch (error) {
        console.warn("Unable to check upcoming bill reminders.", error);
      }
    };

    checkBills();
    const timer = window.setInterval(checkBills, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
};

export default BillNotificationMonitor;
