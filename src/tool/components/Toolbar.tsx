import React from 'react';
import { ToolState } from '../types';

interface ToolbarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
  onConvert: () => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ state, onChange, onConvert, onClear }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...state, mode: 'yaml-to-json', input: state.output, output: '' })}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            state.mode === 'yaml-to-json'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          YAML to JSON
        </button>
        <button
          onClick={() => onChange({ ...state, mode: 'json-to-yaml', input: state.output, output: '' })}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            state.mode === 'json-to-yaml'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          JSON to YAML
        </button>
      </div>

      <div className="flex items-center gap-2">
        {!state.autoConvert && (
          <button
            onClick={onConvert}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Convert
          </button>
        )}
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
