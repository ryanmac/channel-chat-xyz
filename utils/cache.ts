// utils/cache.ts

const cache = new Map<string, { value: any; expiry: number }>();

export const setCache = (key: string, value: any, ttl: number = 600000): void => {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
};

export const getCache = (key: string): any | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }
  return cached.value;
};

export const clearCache = (): void => {
  cache.clear();
}

export const deleteCache = (key: string): void => {
  cache.delete(key);
}

export const getCacheKeys = (): string[] => {
  return Array.from(cache.keys());
}

export const getCacheSize = (): number => {
  return cache.size;
}

export const getCacheEntries = (): [string, any][] => {
  return Array.from(cache.entries());
}