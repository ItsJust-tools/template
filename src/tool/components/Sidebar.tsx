import React from 'react';
import { ToolState } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  return (
    <div className="p-4 space-y-6 text-sm bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Indentation Spaces
            </label>
            <select
              value={state.indent}
              onChange={(e) => onChange({ ...state, indent: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Auto-convert</span>
            <input
              type="checkbox"
              checked={state.autoConvert}
              onChange={(e) => onChange({ ...state, autoConvert: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Samples</h3>
        <div className="space-y-2">
          <button
            onClick={() => onChange({
              ...state,
              mode: 'yaml-to-json',
              input: 'server:\n  host: localhost\n  port: 8080\n  enabled: true\ndatabase:\n  url: postgres://localhost/db',
            })}
            className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sample YAML Config
          </button>
          <button
            onClick={() => onChange({
              ...state,
              mode: 'json-to-yaml',
              input: '{\n  "users": [\n    { "id": 1, "name": "Alice" },\n    { "id": 2, "name": "Bob" }\n  ]\n}',
            })}
            className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sample JSON Data
          </button>
        </div>
      </div>
    </div>
  );
};
