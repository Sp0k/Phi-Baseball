type Stored<T> = { v: T; exp?: number };

export function lsSet<T>(key: string, value: T, ttlMs?: number) {
  const payload: Stored<T> = { v: value, exp: ttlMs ? Date.now() + ttlMs : undefined };
  try { 
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const { v, exp } = JSON.parse(raw) as Stored<T>;
    if (exp && Date.now() > exp) { 
      localStorage.removeItem(key);
      return null;
    }

    return v as T;
  } catch {
    return null;
  }
}

export function lsDel(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
