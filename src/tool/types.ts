export type Mode = 'of' | 'change' | 'reverse' | 'addsub' | 'compound';

export type AddSubOp = 'add' | 'subtract';

export interface HistoryEntry {
  /** Short human readable description of the calculation. */
  text: string;
  /** ISO timestamp when the entry was saved. */
  createdAt: string;
}

export interface ToolState {
  /** Active calculator mode. */
  mode: Mode;
  /** 'of' mode: the percentage X. */
  percentageOf: string;
  /** 'of' mode: the base value Y. */
  ofBase: string;
  /** 'change' mode: original value. */
  changeFrom: string;
  /** 'change' mode: new value. */
  changeTo: string;
  /** 'reverse' mode: the known part amount. */
  reversePart: string;
  /** 'reverse' mode: the percentage the part represents. */
  reversePercent: string;
  /** 'addsub' mode: base value. */
  addSubValue: string;
  /** 'addsub' mode: percentage to apply. */
  addSubPercent: string;
  /** 'addsub' mode: operation direction. */
  addSubOp: AddSubOp;
  /** 'compound' mode: first percentage. */
  compoundA: string;
  /** 'compound' mode: second percentage. */
  compoundB: string;
  /** Saved calculation history, newest first. */
  history: HistoryEntry[];
}

export const DEFAULT_STATE: ToolState = {
  mode: 'of',
  percentageOf: '20',
  ofBase: '150',
  changeFrom: '80',
  changeTo: '100',
  reversePart: '30',
  reversePercent: '15',
  addSubValue: '250',
  addSubPercent: '20',
  addSubOp: 'add',
  compoundA: '20',
  compoundB: '30',
  history: [],
};

export const MAX_HISTORY = 20;

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'of', label: 'X% of Y', hint: 'percentage of a value' },
  { value: 'change', label: 'Change', hint: 'increase or decrease between two values' },
  { value: 'reverse', label: 'Reverse', hint: 'find the whole from a part' },
  { value: 'addsub', label: 'Add / subtract', hint: 'apply a percentage to a value' },
  { value: 'compound', label: 'Compound', hint: 'percentage of a percentage' },
];

/** Parse a plain decimal number; returns null for empty/unparseable input. */
export function parseNumber(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** Format a number without float noise where possible. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);
  if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
    return value.toExponential(6).replace(/e([+-])(\d)$/, 'e$10$2');
  }
  return String(Number(value.toFixed(10)));
}

/** X% of Y = Y * X / 100. */
export function percentOf(percent: number, base: number): number {
  return (percent / 100) * base;
}

/**
 * Percentage change from `from` to `to`.
 * Returns null when from is 0 (undefined change), 0 when both are 0.
 */
export function percentChange(from: number, to: number): number | null {
  if (from === 0 && to === 0) return 0;
  if (from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

/** Reverse percentage: whole = part * 100 / percent; null when percent is 0. */
export function reversePercentage(part: number, percent: number): number | null {
  if (percent === 0) return null;
  return (part * 100) / percent;
}

/** Apply (add or subtract) a percentage to a value. */
export function addSubtract(value: number, percent: number, op: AddSubOp): number {
  const factor = op === 'add' ? 1 + percent / 100 : 1 - percent / 100;
  return value * factor;
}

/** Percentage of a percentage, expressed as a percentage (a% of b% = a*b/100 %). */
export function compoundPercent(a: number, b: number): number {
  return (a * b) / 100;
}

export interface ChangeResult {
  change: number | null;
  direction: 'increase' | 'decrease' | 'none' | 'undefined';
}

/** Direction-aware percentage change result. */
export function changeResult(from: number, to: number): ChangeResult {
  const change = percentChange(from, to);
  if (change === null) {
    return { change, direction: 'undefined' };
  }
  if (change > 0) return { change, direction: 'increase' };
  if (change < 0) return { change, direction: 'decrease' };
  return { change, direction: 'none' };
}

/** Human-readable result for the active mode, or null when inputs are invalid. */
export function resultText(state: ToolState): string | null {
  switch (state.mode) {
    case 'of': {
      const percent = parseNumber(state.percentageOf);
      const base = parseNumber(state.ofBase);
      if (percent === null || base === null) return null;
      return `${formatNumber(percentOf(percent, base))}`;
    }
    case 'change': {
      const from = parseNumber(state.changeFrom);
      const to = parseNumber(state.changeTo);
      if (from === null || to === null) return null;
      const result = changeResult(from, to);
      if (result.change === null) return null;
      return `${formatNumber(result.change)}% ${result.direction}`;
    }
    case 'reverse': {
      const part = parseNumber(state.reversePart);
      const percent = parseNumber(state.reversePercent);
      if (part === null || percent === null) return null;
      const whole = reversePercentage(part, percent);
      return whole === null ? null : `${formatNumber(whole)}`;
    }
    case 'addsub': {
      const value = parseNumber(state.addSubValue);
      const percent = parseNumber(state.addSubPercent);
      if (value === null || percent === null) return null;
      return `${formatNumber(addSubtract(value, percent, state.addSubOp))}`;
    }
    case 'compound': {
      const a = parseNumber(state.compoundA);
      const b = parseNumber(state.compoundB);
      if (a === null || b === null) return null;
      return `${formatNumber(compoundPercent(a, b))}%`;
    }
  }
}

/** One formula line per step for the active mode. */
export function stepsFor(state: ToolState): string[] {
  switch (state.mode) {
    case 'of': {
      const percent = parseNumber(state.percentageOf);
      const base = parseNumber(state.ofBase);
      if (percent === null || base === null) {
        return ['Enter valid numbers for X (%) and Y to see the steps.'];
      }
      return [
        `Formula: X% of Y = Y × X / 100`,
        `Substitute: ${formatNumber(base)} × ${formatNumber(percent)} / 100`,
        `Compute: ${formatNumber(percentOf(percent, base))}`,
      ];
    }
    case 'change': {
      const from = parseNumber(state.changeFrom);
      const to = parseNumber(state.changeTo);
      if (from === null || to === null) {
        return ['Enter valid original and new values to see the steps.'];
      }
      const result = changeResult(from, to);
      const steps = [
        `Formula: change % = (new − original) / |original| × 100`,
        `Substitute: (${formatNumber(to)} − ${formatNumber(from)}) / |${formatNumber(from)}| × 100`,
      ];
      if (result.change === null) {
        steps.push('Undefined: division by zero (original value is 0).');
      } else {
        steps.push(`Compute: ${formatNumber(result.change)}% — ${result.direction}`);
      }
      return steps;
    }
    case 'reverse': {
      const part = parseNumber(state.reversePart);
      const percent = parseNumber(state.reversePercent);
      if (part === null || percent === null) {
        return ['Enter valid part and percentage values to see the steps.'];
      }
      const whole = reversePercentage(part, percent);
      return [
        `Formula: whole = part × 100 / percent`,
        `Substitute: ${formatNumber(part)} × 100 / ${formatNumber(percent)}`,
        whole === null ? 'Undefined: percentage is 0.' : `Compute: ${formatNumber(whole)}`,
      ];
    }
    case 'addsub': {
      const value = parseNumber(state.addSubValue);
      const percent = parseNumber(state.addSubPercent);
      if (value === null || percent === null) {
        return ['Enter valid value and percentage to see the steps.'];
      }
      const op = state.addSubOp === 'add' ? '+' : '−';
      return [
        `Formula: ${state.addSubOp === 'add' ? 'new' : 'new'} = value ${op} (value × percent / 100)`,
        `Substitute: ${formatNumber(value)} ${op} (${formatNumber(value)} × ${formatNumber(percent)} / 100)`,
        `Compute: ${formatNumber(addSubtract(value, percent, state.addSubOp))}`,
      ];
    }
    case 'compound': {
      const a = parseNumber(state.compoundA);
      const b = parseNumber(state.compoundB);
      if (a === null || b === null) {
        return ['Enter valid percentages to see the steps.'];
      }
      return [
        `Formula: result % = A × B / 100`,
        `Substitute: ${formatNumber(a)} × ${formatNumber(b)} / 100`,
        `Compute: ${formatNumber(compoundPercent(a, b))}%`,
      ];
    }
  }
}

/** Compact summary used by the status bar and copy actions. */
export function summaryText(state: ToolState): string {
  const result = resultText(state);
  const label = MODES.find((m) => m.value === state.mode)?.label ?? state.mode;
  return result === null ? `${label}: enter valid inputs` : `${label}: ${result}`;
}

/** Build a history entry text for the current state. */
export function historyText(state: ToolState): string {
  return summaryText(state);
}

export function isState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    typeof v.mode === 'string' && typeof v.percentageOf === 'string' && DEFAULT_STATE !== undefined
  );
}

export { MODES };
