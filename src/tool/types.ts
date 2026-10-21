export type ConversionMode = 'yaml-to-json' | 'json-to-yaml';

export interface ToolState {
  input: string;
  output: string;
  mode: ConversionMode;
  indent: number;
  error: string | null;
  autoConvert: boolean;
}
