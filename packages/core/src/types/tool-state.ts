/**
 * Reactive tool state returned by the useToolState hook.
 *
 * @template T - The shape of the tool's application data
 *
 * @property data - Current tool state data
 * @property setData - Update state directly or via an updater function
 * @property undo - Revert to the previous snapshot (if history available)
 * @property redo - Re-apply a previously undone snapshot
 * @property canUndo - True when there is undo history available
 * @property canRedo - True when there is redo history available
 * @property clearHistory - Discard all undo/redo history
 * @property lastSaved - ISO 8601 timestamp of the last auto-save, or null
 * @property isDirty - True when the current state differs from the last saved state
 * @property isSaving - True while an auto-save operation is in progress
 * @property saveNow - Force an immediate save to localStorage
 */
export interface ToolState<T> {
  data: T;
  setData: (updater: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  lastSaved: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveNow: () => Promise<void>;
}
