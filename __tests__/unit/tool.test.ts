import { describe, it, expect } from 'vitest';
import { YamlToJsonToolDefinition } from '../../src/tool/tool-definition';
import type { ToolState } from '../../src/tool/types';

describe('YamlToJsonToolDefinition', () => {
  const def = new YamlToJsonToolDefinition();

  it('should convert valid YAML to JSON', () => {
    const state: ToolState = { ...def.initialState, mode: 'yaml-to-json', input: 'name: test\nvalue: 123' };
    const res = def.convert(state);
    expect(res.error).toBeNull();
    expect(JSON.parse(res.output)).toEqual({ name: 'test', value: 123 });
  });

  it('should convert valid JSON to YAML', () => {
    const state: ToolState = { ...def.initialState, mode: 'json-to-yaml', input: '{"name":"test","value":123}' };
    const res = def.convert(state);
    expect(res.error).toBeNull();
    expect(res.output).toContain('name: test');
  });

  it('should report syntax errors for bad YAML', () => {
    const state: ToolState = { ...def.initialState, mode: 'yaml-to-json', input: 'name: [unclosed' };
    const res = def.convert(state);
    expect(res.error).not.toBeNull();
  });

  it('should respect indentation settings', () => {
    const state: ToolState = { ...def.initialState, mode: 'yaml-to-json', indent: 4, input: 'a: 1' };
    const res = def.convert(state);
    expect(res.output).toContain('    ');
  });
});
