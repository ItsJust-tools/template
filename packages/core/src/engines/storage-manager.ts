import type { StorageData } from '../types';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

/**
 * Result status of a storage load operation.
 * - `'missing'`: No data found for the given key
 * - `'ok'`: Data loaded and decoded successfully
 * - `'corrupt'`: Data found but could not be parsed or decompressed
 */
export type StorageLoadStatus = 'missing' | 'ok' | 'corrupt';

/**
 * Typed result from StorageManager.loadEntry.
 *
 * @template T - Expected shape of the stored data
 * @property status - Whether the load succeeded, failed, or the key was absent
 * @property data - The decoded data on success, or null otherwise
 */
export interface StorageLoadResult<T> {
  status: StorageLoadStatus;
  data: T | null;
}

/**
 * Manages persistent key-value storage in localStorage with versioning and
 * automatic compression of large payloads using LZ-String.
 *
 * Keys are prefixed to avoid collisions with other applications or tools.
 * Data is wrapped in a {@link StorageData} envelope that carries version and
 * timestamp metadata.
 *
 * @example
 * ```ts
 * const sm = new StorageManager('my-tool');
 * await sm.save('config', { theme: 'dark' }, '1.0');
 * const result = sm.loadEntry<{ theme: string }>('config', '1.0');
 * if (result.status === 'ok') {
 *   console.log(result.data.theme); // 'dark'
 * }
 * ```
 */
export class StorageManager {
  private prefix: string;
  private defaultVersion?: string;
  private compressionThresholdBytes: number;

  /**
   * @param prefix - Namespace prefix for all localStorage keys (default: 'itsjust')
   * @param defaultVersion - Schema version used when none is explicitly provided (default: '1.0.0')
   * @param compressionThresholdBytes - Minimum payload size before attempting LZ-String compression (default: 2048)
   */
  constructor(prefix = 'itsjust', defaultVersion = '1.0.0', compressionThresholdBytes = 2048) {
    this.prefix = prefix;
    this.defaultVersion = defaultVersion;
    this.compressionThresholdBytes = Math.max(0, compressionThresholdBytes);
  }

  /** Build the full prefixed localStorage key. */
  private key(k: string): string {
    return `${this.prefix}:${k}`;
  }

  /**
   * Persist data to localStorage. Large payloads (> compressionThresholdBytes)
   * are automatically compressed with LZ-String before storage.
   *
   * @param key - Storage key (prefixed internally)
   * @param data - Data to store (will be JSON-serialized)
   * @param version - Optional schema version override
   * @throws If localStorage quota is exceeded or a write error occurs
   */
  async save<T>(key: string, data: T, version?: string): Promise<void> {
    const serialized = JSON.stringify(data);
    let storedData: unknown = data;
    let encoding: StorageData<unknown>['encoding'] = 'plain';
    if (serialized.length >= this.compressionThresholdBytes) {
      const compressed = compressToUTF16(serialized);
      if (compressed.length < serialized.length) {
        storedData = compressed;
        encoding = 'lz-string';
      }
    }
    const entry: StorageData<unknown> = {
      data: storedData,
      savedAt: new Date().toISOString(),
      version: version ?? this.defaultVersion ?? '1.0.0',
      encoding,
    };
    try {
      localStorage.setItem(this.key(key), JSON.stringify(entry));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`[StorageManager] Quota exceeded saving "${key}"`);
      } else {
        console.warn(`[StorageManager] Failed to save "${key}":`, error);
      }
      throw error;
    }
  }

  /**
   * Load and decode a stored entry. Handles both plain and LZ-String compressed
   * data transparently.
   *
   * @param key - Storage key (prefixed internally)
   * @param expectedVersion - Optional version to validate against; mismatches are logged as warnings
   * @returns A typed result with status and decoded data
   */
  loadEntry<T>(key: string, expectedVersion?: string): StorageLoadResult<T> {
    const raw = localStorage.getItem(this.key(key));
    if (!raw) return { status: 'missing', data: null };
    try {
      const entry: StorageData<unknown> = JSON.parse(raw);
      if (expectedVersion && entry.version !== expectedVersion) {
        console.warn(
          `[StorageManager] Version mismatch for "${key}": expected ${expectedVersion}, got ${entry.version}`
        );
      }
      if (entry.encoding === 'lz-string') {
        if (typeof entry.data !== 'string') {
          return { status: 'corrupt', data: null };
        }
        const decompressed = decompressFromUTF16(entry.data);
        if (decompressed == null) {
          return { status: 'corrupt', data: null };
        }
        return { status: 'ok', data: JSON.parse(decompressed) as T };
      }
      return { status: 'ok', data: entry.data as T };
    } catch (error) {
      console.warn(`[StorageManager] Failed to load "${key}":`, error);
      return { status: 'corrupt', data: null };
    }
  }

  /**
   * Convenience method that returns just the data payload, or null on any failure.
   *
   * @param key - Storage key (prefixed internally)
   * @param expectedVersion - Optional version to validate against
   * @returns The decoded data, or null if missing or corrupt
   */
  load<T>(key: string, expectedVersion?: string): T | null {
    return this.loadEntry<T>(key, expectedVersion).data;
  }

  /** Remove a stored entry from localStorage. */
  remove(key: string): void {
    localStorage.removeItem(this.key(key));
  }
}

/** Global singleton StorageManager with default settings (`itsjust` prefix). */
export const storageManager = new StorageManager();
