import { describe, it, expect } from 'vitest';
import { notepadTool } from '@/tool/notepad-state';
import type { NotepadState } from '@/tool/notepad-state';

describe('Notepad logic', () => {
  it('initializes with default state', () => {
    expect(notepadTool.initialState.content).toBe('');
  });

  it('updates text content', () => {
    const state = { ...notepadTool.initialState, content: 'Hello world' };
    expect(state.content).toBe('Hello world');
  });
});

describe('Notepad deserialize', () => {
  it('accepts valid notepad state object', () => {
    const result = notepadTool.deserialize({ content: 'Valid' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Valid');
    }
  });

  it('rejects null data', () => {
    const result = notepadTool.deserialize(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects non-object data', () => {
    const result = notepadTool.deserialize('string');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object without content', () => {
    const result = notepadTool.deserialize({ title: 'No content' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object with non-string content', () => {
    const result = notepadTool.deserialize({ content: 123 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('round-trips state through serialize/deserialize', () => {
    const state: NotepadState = { content: 'Test', title: 'My note' };
    const json = notepadTool.serialize(state);
    expect(() => JSON.parse(json)).not.toThrow();
    const result = notepadTool.deserialize(JSON.parse(json));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(state);
    }
  });
});
