import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const raw = window.localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue(prev => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch {
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}

export function useDarkMode(storageKey = "dark-theme") {
  const [enabled, setEnabled] = useLocalStorage<boolean>(storageKey, false);
  const isEnabled = !!enabled;

  useEffect(() => {
    const el = document.documentElement.classList;
    const cls = "dark";
    isEnabled ? el.add(cls) : el.remove(cls);
  }, [isEnabled]);

  return [enabled, setEnabled] as const;
}
