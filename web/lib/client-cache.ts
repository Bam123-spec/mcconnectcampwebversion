type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const clientCache = new Map<string, CacheEntry<unknown>>();

export function getClientCache<T>(key: string) {
  const entry = clientCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    clientCache.delete(key);
    return null;
  }

  return entry.value;
}

export function setClientCache<T>(key: string, value: T, ttlMs = 5 * 60 * 1000) {
  clientCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}
