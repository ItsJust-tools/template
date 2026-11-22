'use client';

import React from 'react';
import { resultText, stepsFor } from '../tool-definition';
import { changeResult, formatNumber, percentOf } from '../types';
import { MODES, type ToolState } from '../types';

interface CanvasProps {
  state: ToolState;
  onChange?: (state: ToolState) => void;
  onSaveHistory?: (text: string) => void;
}

const numberInputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';

function CopyButton({ value, testid }: { value: string; testid?: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }, [value]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid={testid}
      className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Copy value"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChangeState,
  testid,
}: {
  label: string;
  value: string;
  onChangeState: (next: string) => void;
  testid: string;
}) {
  return (
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChangeState(e.target.value)}
        data-testid={testid}
        className={numberInputClass}
      />
    </label>
  );
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange, onSaveHistory }) => {
  const update = (patch: Partial<ToolState>) => onChange?.({ ...state, ...patch });
  const result = resultText(state);
  const steps = stepsFor(state);

  const inputsByMode = (() => {
    switch (state.mode) {
      case 'of':
        return (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="of-inputs">
            <NumberField
              label="X — percentage"
              value={state.percentageOf}
              onChangeState={(v) => update({ percentageOf: v })}
              testid="input-percentage-of"
            />
            <NumberField
              label="Y — base value"
              value={state.ofBase}
              onChangeState={(v) => update({ ofBase: v })}
              testid="input-of-base"
            />
          </div>
        );
      case 'change':
        return (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="change-inputs">
            <NumberField
              label="Original value"
              value={state.changeFrom}
              onChangeState={(v) => update({ changeFrom: v })}
              testid="input-change-from"
            />
            <NumberField
              label="New value"
              value={state.changeTo}
              onChangeState={(v) => update({ changeTo: v })}
              testid="input-change-to"
            />
          </div>
        );
      case 'reverse':
        return (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="reverse-inputs">
            <NumberField
              label="Part amount"
              value={state.reversePart}
              onChangeState={(v) => update({ reversePart: v })}
              testid="input-reverse-part"
            />
            <NumberField
              label="Percentage of the whole"
              value={state.reversePercent}
              onChangeState={(v) => update({ reversePercent: v })}
              testid="input-reverse-percent"
            />
          </div>
        );
      case 'addsub':
        return (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="addsub-inputs">
            <NumberField
              label="Value"
              value={state.addSubValue}
              onChangeState={(v) => update({ addSubValue: v })}
              testid="input-addsub-value"
            />
            <NumberField
              label="Percentage"
              value={state.addSubPercent}
              onChangeState={(v) => update({ addSubPercent: v })}
              testid="input-addsub-percent"
            />
            <div className="sm:col-span-2">
              <div className="flex gap-2" role="group" aria-label="Operation">
                {(['add', 'subtract'] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    role="tab"
                    aria-selected={state.addSubOp === op}
                    data-testid={`addsub-${op}`}
                    onClick={() => update({ addSubOp: op })}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                      state.addSubOp === op
                        ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
                    }`}
                  >
                    {op === 'add' ? 'Add percentage' : 'Subtract percentage'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'compound':
        return (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="compound-inputs">
            <NumberField
              label="Percentage A"
              value={state.compoundA}
              onChangeState={(v) => update({ compoundA: v })}
              testid="input-compound-a"
            />
            <NumberField
              label="Percentage B"
              value={state.compoundB}
              onChangeState={(v) => update({ compoundB: v })}
              testid="input-compound-b"
            />
          </div>
        );
    }
  })();

  const directionResult =
    state.mode === 'change'
      ? (() => {
          const from = Number.parseFloat(state.changeFrom);
          const to = Number.parseFloat(state.changeTo);
          if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
          return changeResult(from, to);
        })()
      : null;

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full" data-testid="percentage-canvas">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Calculator mode"
        data-testid="mode-tabs"
      >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={state.mode === mode.value}
            data-testid={`mode-tab-${mode.value}`}
            title={mode.hint}
            onClick={() => onChange?.({ ...state, mode: mode.value })}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              state.mode === mode.value
                ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {inputsByMode}

      <div
        className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
        data-testid="result-card"
        role="status"
      >
        <span className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Result
        </span>
        <span className="flex items-center justify-center gap-2">
          <span className="block font-mono text-3xl font-bold" data-testid="result-main">
            {result ?? '—'}
          </span>
          {result ? <CopyButton value={result} testid="copy-result" /> : null}
        </span>
        {directionResult ? (
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              directionResult.direction === 'increase'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                : directionResult.direction === 'decrease'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
            data-testid="direction-indicator"
          >
            {directionResult.direction === 'increase'
              ? '▲ increase'
              : directionResult.direction === 'decrease'
                ? '▼ decrease'
                : directionResult.direction === 'none'
                  ? '= no change'
                  : '? undefined (division by zero)'}
          </span>
        ) : null}
        <span
          className="mt-2 block text-xs text-gray-600 dark:text-gray-300"
          data-testid="result-summary"
        >
          {result === null ? 'Enter valid inputs' : 'Copy the result or save it below.'}
        </span>
        {result ? (
          <button
            type="button"
            data-testid="btn-save-history"
            onClick={() => onSaveHistory?.(result)}
            className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Save to history
          </button>
        ) : null}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Step-by-step
        </h3>
        <ol className="space-y-1 text-xs text-gray-700 dark:text-gray-300" data-testid="steps-list">
          {steps.map((step, i) => (
            <li key={i} className="font-mono">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {state.mode === 'of' ? (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400" data-testid="of-hint">
          Example: {formatNumber(percentOf(20, 150))} is 20% of 150.
        </p>
      ) : null}

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          History
        </h3>
        {state.history.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="history-empty">
            No saved calculations yet.
          </p>
        ) : (
          <ul className="space-y-1" data-testid="history-list">
            {state.history.map((entry, i) => (
              <li
                key={`${entry.createdAt}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs dark:border-gray-800"
              >
                <span className="text-gray-700 dark:text-gray-300">{entry.text}</span>
                <CopyButton value={entry.text} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        All calculations run locally in your browser; nothing is uploaded.
      </p>
    </div>
  );
};
