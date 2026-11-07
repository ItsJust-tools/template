import type { ToolState } from './types';
import type { ToolConfig, ToolExporterDefinition } from '@itsjust/core';
import toolConfig from './tool.config';

export interface NotepadState {
  content: string;
  title?: string;
}

export const notepadTool = {
  id: 'notepad',
  name: 'Notepad',
  version: '1.0.0',
  config: toolConfig as unknown as ToolConfig,
  initialState: { content: '', title: '' } as NotepadState,
  serialize: (state: NotepadState): string => JSON.stringify(state, null, 2),
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ] as ToolExporterDefinition[],
  deserialize: (data: unknown) => {
    try {
      if (
        typeof data === 'object' &&
        data !== null &&
        typeof (data as { content?: unknown }).content === 'string'
      ) {
        const d = data as { content: string; title?: unknown };
        return {
          success: true as const,
          data: {
            content: d.content,
            title: typeof d.title === 'string' ? d.title : '',
          } as NotepadState,
        };
      }
      return {
        success: false as const,
        error: 'Invalid data format: expected { content: string, title?: string }',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deserialization error';
      return {
        success: false as const,
        error: `Failed to deserialize state: ${message}`,
      };
    }
  },
};
