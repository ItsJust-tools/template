/**
 * Wrapper for data stored in localStorage, including metadata.
 *
 * @template T - The shape of the stored application data
 *
 * @property data - The stored data (plain object or LZ-String compressed)
 * @property savedAt - ISO 8601 timestamp of when this entry was saved
 * @property version - Schema version for forward-compatibility checks
 * @property encoding - How the data field is serialized ('plain' or 'lz-string')
 */
export interface StorageData<T> {
  data: T;
  savedAt: string;
  version: string;
  encoding?: 'plain' | 'lz-string';
}

/**
 * Options for configuring the auto-save behavior.
 *
 * @property enabled - Whether auto-save is active
 * @property debounceMs - Debounce interval in milliseconds after the last change
 * @property maxWaitMs - Maximum wait time before forcing a save regardless of debounce
 * @property key - localStorage key used for the primary save entry
 * @property maxHistoryEntries - Maximum number of undo/redo history snapshots retained
 * @property version - Schema version stamped on saved entries
 * @property storageManager - Optional custom StorageManager instance (defaults to global)
 * @property historyStorage - Optional custom storage backend for undo history
 * @property historyNamespace - Optional namespace prefix for history keys
 */
export interface AutoSaveOptions {
  enabled: boolean;
  debounceMs: number;
  maxWaitMs: number;
  key: string;
  maxHistoryEntries?: number;
  version?: string;
  storageManager?: {
    loadEntry: <T>(
      key: string,
      expectedVersion?: string
    ) => { status: 'missing' | 'ok' | 'corrupt'; data: T | null };
    save: <T>(key: string, data: T, version?: string) => Promise<void>;
  };
  historyStorage?: Pick<Storage, 'getItem' | 'setItem'>;
  historyNamespace?: string;
  /**
   * Optional callback invoked when a storage write fails (e.g. QuotaExceededError
   * in private browsing or low-disk scenarios). Use this to surface a non-intrusive
   * warning to the user without breaking the state flow.
   */
  onStorageWarning?: (reason: 'quota' | 'unavailable') => void;
}

/** Sensible defaults for auto-save: enabled, 2s debounce, 50 history entries max. */
export const defaultAutoSaveOptions: AutoSaveOptions = {
  enabled: true,
  debounceMs: 2000,
  maxWaitMs: 10000,
  key: 'itsjust-tool',
  maxHistoryEntries: 50,
};
