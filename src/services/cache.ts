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
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
  cacheStore.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}
