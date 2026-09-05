import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../../src/engines/filename';

describe('sanitizeFilename', () => {
  it('leaves safe filenames unchanged', () => {
    expect(sanitizeFilename('report.png')).toBe('report.png');
    expect(sanitizeFilename('my-export.json')).toBe('my-export.json');
  });

  it('replaces invalid OS characters with dashes', () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j.png')).toBe('a-b-c-d-e-f-g-h-i-j.png');
  });

  it('replaces percent characters', () => {
    expect(sanitizeFilename('100%done.png')).toBe('100-done.png');
  });

  it('strips control characters', () => {
    expect(sanitizeFilename('bad\u0000name\u001f.png')).toBe('badname.png');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeFilename('  spaced  .png')).toBe('spaced.png');
  });

  it('strips leading dots', () => {
    expect(sanitizeFilename('..hidden.png')).toBe('hidden.png');
  });

  it('collapses repeated dashes and trims edge dashes', () => {
    expect(sanitizeFilename('a---b--c.png')).toBe('a-b-c.png');
    expect(sanitizeFilename('--leading.png')).toBe('leading.png');
    expect(sanitizeFilename('trailing--.png')).toBe('trailing.png');
  });

  it('falls back to a default name when nothing remains', () => {
    expect(sanitizeFilename('///')).toBe('export');
    expect(sanitizeFilename('')).toBe('export');
  });

  it('enforces a max length of 100 characters for the base name', () => {
    const long = 'x'.repeat(150) + '.png';
    const result = sanitizeFilename(long);
    expect(result.endsWith('.png')).toBe(true);
    expect(result.length).toBe(104); // 100 base + 4-char extension
  });

  it('preserves the extension while truncating the base', () => {
    const long = 'y'.repeat(120) + '.json';
    const result = sanitizeFilename(long);
    expect(result.endsWith('.json')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(105);
  });
});
