'use client';

import { useCallback, useMemo } from 'react';
import { StorageManager } from '../engines/storage-manager';

/**
 * React hook wrapping StorageManager for convenient key-value persistence.
 * Creates a scoped StorageManager instance for the given prefix.
 *
 * @param prefix - Namespace prefix for all storage keys (default: 'itsjust')
 * @returns An object with `save`, `load`, and `clear` utility functions
 *
 * @example
 * ```tsx
 * const storage = useStorage('my-tool');
 * await storage.save('preferences', { theme: 'dark' });
 * const prefs = storage.load<{ theme: string }>('preferences');
 * ```
 */
export function useStorage(prefix = 'itsjust') {
  const manager = useMemo(() => new StorageManager(prefix), [prefix]);

  const save = useCallback(<T>(key: string, data: T) => manager.save(key, data), [manager]);

  const load = useCallback(<T>(key: string) => manager.load<T>(key), [manager]);

  const clear = useCallback((key: string) => manager.remove(key), [manager]);

  return { save, load, clear };
}
