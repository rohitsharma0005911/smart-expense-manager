import { useEffect, useState } from "react";

export const usePersistentState = <T,>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T
): [T, (value: T | ((current: T) => T)) => void] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const savedValue = window.localStorage.getItem(key);
      if (savedValue === null) return initialValue;

      const parsed: unknown = JSON.parse(savedValue);
      if (isValid(parsed)) return parsed;

      console.warn(`Saved data for "${key}" has an unexpected format.`);
    } catch (error) {
      console.warn(`Unable to load saved data for "${key}".`, error);
    }

    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Unable to save data for "${key}".`, error);
    }
  }, [key, value]);

  return [value, setValue];
};
