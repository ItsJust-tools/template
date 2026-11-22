import { describe, it, expect } from 'vitest';
import {
  parseNumber,
  formatNumber,
  percentOf,
  percentChange,
  reversePercentage,
  addSubtract,
  compoundPercent,
  changeResult,
  resultText,
  stepsFor,
  summaryText,
} from '@/tool/types';
import { deserializeState, serializeState, withHistory, roundTrips } from '@/tool/tool-definition';
import { DEFAULT_STATE, MAX_HISTORY, type ToolState } from '@/tool/types';
import { percentageCalculatorTool } from '@/tool/tool-definition';

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

describe('parseNumber', () => {
  it('parses integers, decimals, signs and exponents', () => {
    expect(parseNumber('42')).toBe(42);
    expect(parseNumber('-3.5')).toBe(-3.5);
    expect(parseNumber('+0.25')).toBeCloseTo(0.25);
    expect(parseNumber('.5')).toBeCloseTo(0.5);
    expect(parseNumber('5.')).toBeCloseTo(5);
    expect(parseNumber('1e3')).toBe(1000);
  });

  it('rejects invalid input', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('  ')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('12,5')).toBeNull();
    expect(parseNumber('1.2.3')).toBeNull();
    expect(parseNumber('--5')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('formats integers without decimals', () => {
    expect(formatNumber(30)).toBe('30');
    expect(formatNumber(-42)).toBe('-42');
  });

  it('trims float noise on decimals', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(12.5)).toBe('12.5');
  });

  it('handles non-finite values', () => {
    expect(formatNumber(Infinity)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });
});

describe('percentOf', () => {
  it('computes X% of Y including decimals', () => {
    expect(percentOf(20, 150)).toBeCloseTo(30);
    expect(percentOf(50, 88)).toBeCloseTo(44);
    expect(percentOf(7.5, 200)).toBeCloseTo(15);
    expect(percentOf(0, 999)).toBeCloseTo(0);
    expect(percentOf(12.5, 80)).toBeCloseTo(10);
  });

  it('handles negative bases and percentages', () => {
    expect(percentOf(10, -200)).toBeCloseTo(-20);
    expect(percentOf(-10, 200)).toBeCloseTo(-20);
  });
});

describe('percentChange', () => {
  it('computes increases and decreases', () => {
    expect(percentChange(80, 100)).toBeCloseTo(25);
    expect(percentChange(100, 80)).toBeCloseTo(-20);
    expect(percentChange(-50, -25)).toBeCloseTo(50);
  });

  it('handles zero-change and undefined edge cases', () => {
    expect(percentChange(5, 5)).toBe(0);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(0, 10)).toBeNull();
    expect(percentChange(0, -10)).toBeNull();
  });
});

describe('changeResult', () => {
  it('reports direction', () => {
    expect(changeResult(80, 100)).toEqual({ change: 25, direction: 'increase' });
    expect(changeResult(100, 80)).toEqual({ change: -20, direction: 'decrease' });
    expect(changeResult(7, 7)).toEqual({ change: 0, direction: 'none' });
    expect(changeResult(0, 3).direction).toBe('undefined');
    expect(changeResult(0, 3).change).toBeNull();
  });
});

describe('reversePercentage', () => {
  it('recovers the whole from a part and percent', () => {
    expect(reversePercentage(30, 15)).toBeCloseTo(200);
    expect(reversePercentage(50, 25)).toBeCloseTo(200);
    expect(reversePercentage(12, 8)).toBeCloseTo(150);
    expect(reversePercentage(7.5, 5)).toBeCloseTo(150);
  });

  it('returns null when the percentage is zero', () => {
    expect(reversePercentage(30, 0)).toBeNull();
  });
});

describe('addSubtract', () => {
  it('adds and subtracts percentages', () => {
    expect(addSubtract(250, 20, 'add')).toBeCloseTo(300);
    expect(addSubtract(250, 20, 'subtract')).toBeCloseTo(200);
    expect(addSubtract(100, 10, 'add')).toBeCloseTo(110);
  });

  it('works with negative values', () => {
    expect(addSubtract(-100, 10, 'add')).toBeCloseTo(-110);
    expect(addSubtract(-100, 10, 'subtract')).toBeCloseTo(-90);
  });

  it('zero percentage leaves the value unchanged', () => {
    expect(addSubtract(42, 0, 'add')).toBeCloseTo(42);
    expect(addSubtract(42, 0, 'subtract')).toBeCloseTo(42);
  });
});

describe('compoundPercent', () => {
  it('computes percentage of a percentage', () => {
    expect(compoundPercent(20, 30)).toBeCloseTo(6);
    expect(compoundPercent(50, 50)).toBeCloseTo(25);
    expect(compoundPercent(120, 200)).toBeCloseTo(240);
  });
});

describe('resultText', () => {
  it('formats each mode result', () => {
    expect(resultText(state({ mode: 'of', percentageOf: '20', ofBase: '150' }))).toBe('30');
    expect(resultText(state({ mode: 'change', changeFrom: '80', changeTo: '100' }))).toBe(
      '25% increase'
    );
    expect(resultText(state({ mode: 'change', changeFrom: '100', changeTo: '80' }))).toBe(
      '-20% decrease'
    );
    expect(resultText(state({ mode: 'reverse', reversePart: '30', reversePercent: '15' }))).toBe(
      '200'
    );
    expect(
      resultText(
        state({ mode: 'addsub', addSubValue: '250', addSubPercent: '20', addSubOp: 'add' })
      )
    ).toBe('300');
    expect(resultText(state({ mode: 'compound', compoundA: '20', compoundB: '30' }))).toBe('6%');
  });

  it('returns null on invalid inputs', () => {
    expect(resultText(state({ mode: 'of', percentageOf: '', ofBase: '150' }))).toBeNull();
    expect(resultText(state({ mode: 'change', changeFrom: 'abc', changeTo: '100' }))).toBeNull();
    expect(resultText(state({ mode: 'change', changeFrom: '0', changeTo: '100' }))).toBeNull();
    expect(
      resultText(state({ mode: 'reverse', reversePart: '10', reversePercent: '0' }))
    ).toBeNull();
  });
});

describe('stepsFor', () => {
  it('explains the of mode with numbers', () => {
    const steps = stepsFor(state({ mode: 'of', percentageOf: '20', ofBase: '150' }));
    expect(steps.length).toBe(3);
    expect(steps[0]).toContain('X% of Y');
    expect(steps[2]).toContain('30');
  });

  it('explains division-by-zero for change mode', () => {
    const steps = stepsFor(state({ mode: 'change', changeFrom: '0', changeTo: '5' }));
    expect(steps.join(' ')).toContain('Undefined');
  });

  it('explains add/subtract with the chosen operation', () => {
    const add = stepsFor(
      state({ mode: 'addsub', addSubValue: '250', addSubPercent: '20', addSubOp: 'add' })
    );
    expect(add.join(' ')).toContain('300');
    const sub = stepsFor(
      state({ mode: 'addsub', addSubValue: '250', addSubPercent: '20', addSubOp: 'subtract' })
    );
    expect(sub.join(' ')).toContain('200');
  });

  it('falls back to a hint on invalid inputs', () => {
    const steps = stepsFor(state({ mode: 'of', percentageOf: 'x', ofBase: '150' }));
    expect(steps).toHaveLength(1);
    expect(steps[0]).toContain('valid numbers');
  });
});

describe('summaryText', () => {
  it('includes the mode label and result', () => {
    const text = summaryText(state({ mode: 'of', percentageOf: '20', ofBase: '150' }));
    expect(text).toContain('X% of Y');
    expect(text).toContain('30');
  });

  it('degrades gracefully on invalid input', () => {
    expect(summaryText(state({ mode: 'of', percentageOf: '', ofBase: '' }))).toContain(
      'enter valid inputs'
    );
  });
});

describe('serialize/deserialize round-trip', () => {
  const full: ToolState = {
    ...DEFAULT_STATE,
    mode: 'change',
    changeFrom: '80',
    changeTo: '100',
    history: [{ text: 'X% of Y: 30', createdAt: '2026-11-21T10:00:00.000Z' }],
  };

  it('round-trips all fields through serializeState/deserializeState', () => {
    const restored = deserializeState(JSON.parse(serializeState(full)));
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data).toEqual(full);
    }
    expect(serializeState(full)).toContain('"changeFrom":"80"');
  });

  it('round-trips via the Tool object', () => {
    const serialized = percentageCalculatorTool.serialize(full);
    const restored = percentageCalculatorTool.deserialize(JSON.parse(serialized));
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data).toEqual(full);
    }
  });

  it('keeps URL share state round-trip safe', () => {
    expect(roundTrips(full)).toBe(true);
    expect(roundTrips(DEFAULT_STATE)).toBe(true);
  });

  it('rejects malformed payloads', () => {
    expect(deserializeState(null).success).toBe(false);
    expect(deserializeState('string').success).toBe(false);
    expect(deserializeState([1, 2]).success).toBe(false);
    expect(deserializeState(undefined).success).toBe(false);
  });

  it('repairs invalid modes and ops instead of failing', () => {
    const restored = deserializeState({ mode: 'nonsense', addSubOp: 'multiply' });
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data.mode).toBe(DEFAULT_STATE.mode);
      expect(restored.data.addSubOp).toBe(DEFAULT_STATE.addSubOp);
    }
  });

  it('falls back to defaults for missing fields', () => {
    const restored = deserializeState({});
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data.mode).toBe(DEFAULT_STATE.mode);
      expect(restored.data.history).toEqual([]);
    }
  });

  it('filters invalid history entries and caps length', () => {
    const entries = Array.from({ length: MAX_HISTORY + 5 }, (_, i) => ({
      text: `entry ${i}`,
      createdAt: new Date(2026, 0, 1, 0, 0, i).toISOString(),
    }));
    const restored = deserializeState({ mode: 'of', history: [...entries, 'bad', { text: 'x' }] });
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data.history.length).toBe(MAX_HISTORY);
      expect(restored.data.history[0]?.text).toBe('entry 0');
    }
  });
});

describe('withHistory', () => {
  it('prepends newest entries first', () => {
    const now = new Date('2026-11-21T12:00:00Z');
    let s = state();
    s = withHistory(s, 'one', now);
    s = withHistory(s, 'two', now);
    expect(s.history[0]?.text).toBe('two');
    expect(s.history[1]?.text).toBe('one');
    expect(s.history[0]?.createdAt).toBe('2026-11-21T12:00:00.000Z');
  });

  it('caps the history at MAX_HISTORY', () => {
    const now = new Date('2026-11-21T12:00:00Z');
    let s = state();
    for (let i = 0; i < MAX_HISTORY + 10; i++) {
      s = withHistory(s, `entry ${i}`, now);
    }
    expect(s.history.length).toBe(MAX_HISTORY);
    expect(s.history[0]?.text).toBe(`entry ${MAX_HISTORY + 9}`);
  });
});
