import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import type { ToolState, ConversionMode } from './types';
import yaml from 'js-yaml';

function isToolState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    typeof v.input === 'string' &&
    typeof v.output === 'string' &&
    (v.mode === 'yaml-to-json' || v.mode === 'json-to-yaml')
  );
}

export const yamlToJsonTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    input: 'name: John Doe\nage: 30\nskills:\n  - JavaScript\n  - TypeScript\nactive: true',
    output: '',
    mode: 'yaml-to-json',
    indent: 2,
    error: null,
    autoConvert: true,
  },
  serialize: (state) => JSON.stringify(state),
  deserialize: (data): DeserializeResult<ToolState> => {
    try {
      if (isToolState(data)) {
        return { success: true, data: data };
      }
      return { success: false, error: 'Invalid data format: expected valid converter state' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deserialization error';
      return { success: false, error: `Failed to deserialize state: ${message}` };
    }
  },
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};

/** Convert YAML↔JSON based on state.mode. Not part of the Tool contract. */
export function convert(state: ToolState): ToolState {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion error';
      return { ...state, output: '', error: message };
    }
}

// Back-compat alias for existing tests using the class-based name.
export class YamlToJsonToolDefinition {
  initialState: ToolState = yamlToJsonTool.initialState;

  serialize(state: ToolState): string {
    return yamlToJsonTool.serialize(state);
  }

  deserialize(serialized: string): DeserializeResult<ToolState> {
    try {
      const parsed: unknown = JSON.parse(serialized);
      return yamlToJsonTool.deserialize(parsed);
    } catch {
      return { success: false, error: 'Invalid data format: expected valid converter state' };
    }
  }

  convert(state: ToolState): ToolState {
    return convert(state);
  }
}
