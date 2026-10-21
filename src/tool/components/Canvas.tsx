import React from 'react';
import { ToolState } from '../types';

interface CanvasProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange }) => {
  const handleInput = (val: string) => {
    const newState = { ...state, input: val };
    onChange(newState);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(state.output);
  };

  const downloadOutput = () => {
    const ext = state.mode === 'yaml-to-json' ? 'json' : 'yaml';
    const blob = new Blob([state.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Input ({state.mode === 'yaml-to-json' ? 'YAML' : 'JSON'})
          </label>
        </div>
        <textarea
          value={state.input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={`Enter ${state.mode === 'yaml-to-json' ? 'YAML' : 'JSON'} here...`}
          className="flex-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Output ({state.mode === 'yaml-to-json' ? 'JSON' : 'YAML'})
          </label>
          {state.output && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyOutput}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Copy
              </button>
              <button
                onClick={downloadOutput}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Download
              </button>
            </div>
          )}
        </div>
        <div className="relative flex-1 flex flex-col h-full">
          <textarea
            value={state.output}
            readOnly
            placeholder="Converted output will appear here..."
            className="flex-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none resize-none"
            spellCheck={false}
          />
          {state.error && (
            <div className="absolute bottom-3 left-3 right-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded text-xs">
              {state.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
