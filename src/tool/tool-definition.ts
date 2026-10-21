import { ToolDefinition } from '@itsjust/core';
import { ToolState, ConversionMode } from './types';
import yaml from 'js-yaml';

export class YamlToJsonToolDefinition implements ToolDefinition<ToolState> {
  initialState: ToolState = {
    input: 'name: John Doe\nage: 30\nskills:\n  - JavaScript\n  - TypeScript\nactive: true',
    output: '',
    mode: 'yaml-to-json',
    indent: 2,
    error: null,
    autoConvert: true,
  };

  serialize(state: ToolState): string {
    return JSON.stringify(state);
  }

  deserialize(serialized: string): ToolState {
    try {
      const parsed = JSON.parse(serialized);
      return { ...this.initialState, ...parsed };
    } catch {
      return this.initialState;
    }
  }

  convert(state: ToolState): ToolState {
    if (!state.input.trim()) {
      return { ...state, output: '', error: null };
    }

    try {
      if (state.mode === 'yaml-to-json') {
        const parsed = yaml.load(state.input);
        const output = JSON.stringify(parsed, null, state.indent);
        return { ...state, output, error: null };
      } else {
        const parsed = JSON.parse(state.input);
        const output = yaml.dump(parsed, { indent: state.indent });
        return { ...state, output, error: null };
      }
    } catch (err: any) {
      return { ...state, output: '', error: err.message || 'Conversion error' };
    }
  }
}
