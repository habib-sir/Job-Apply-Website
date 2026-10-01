/**
 * In-memory 5-minute TTL cache for public data, feeds, and files
 * Saves Firestore read quota across page transitions and re-renders
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string, ttlMs: number = DEFAULT_CACHE_TTL_MS): T | null {
  // 1. Check in-memory map first
  const entry = cacheStore.get(key);
  if (entry) {
    if (Date.now() - entry.timestamp <= ttlMs) {
      return entry.data as T;
    }
    cacheStore.delete(key);
  }

  // 2. Check sessionStorage for session persistence across page loads
  try {
    const raw = sessionStorage.getItem(`cache_${key}`);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - parsed.timestamp <= ttlMs) {
        cacheStore.set(key, parsed);
        return parsed.data;
      }
      sessionStorage.removeItem(`cache_${key}`);
    }
  } catch {
    // sessionStorage not available or parsing failed
  }

  return null;
}

export function setCached<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  cacheStore.set(key, entry);
  try {
    sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch {
    // Quota exceeded or private browsing
  }
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cacheStore.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith('cache_')) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
    return;
  }

  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(`cache_${prefix}`)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}
