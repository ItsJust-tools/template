import { DEFAULT_STATE, type Mode, type ToolState } from './types';

export const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'of', label: 'X% of Y', hint: 'percentage of a value' },
  { value: 'change', label: 'Change', hint: 'increase or decrease between two values' },
  { value: 'reverse', label: 'Reverse', hint: 'find the whole from a part' },
  { value: 'addsub', label: 'Add / subtract', hint: 'apply a percentage to a value' },
  { value: 'compound', label: 'Compound', hint: 'percentage of a percentage' },
];

export function isState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    typeof v.mode === 'string' && typeof v.percentageOf === 'string' && DEFAULT_STATE !== undefined
  );
}
