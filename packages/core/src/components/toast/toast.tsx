'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { t as tt } from '../../i18n/strings';

/** A single toast notification in the queue. */
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  /** True when the exit animation should play before removal. */
  exiting?: boolean;
}

/** Context value for the toast system. */
interface ToastContextValue {
  /** Show a toast notification. */
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * SVG icon rendered inside each toast based on its type.
 * - success: checkmark
 * - error: circled X
 * - info: circled info
 */
function ToastIcon({ type }: { type: Toast['type'] }) {
  if (type === 'success') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8l3.5 3.5L13 5" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3M8 10.5v0" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5.5v3M8 10.5v0" />
    </svg>
  );
}

/**
 * Hook to show toast notifications. Must be used within {@link ToastProvider}.
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 * toast('File saved!', 'success');
 * ```
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/**
 * Context provider for the toast notification system.
 * Renders a fixed-position overlay with auto-dismissing toasts.
 *
 * Toasts auto-dismiss after 3 seconds (2700ms + 300ms exit animation).
 * Each toast includes a dismiss button for manual closing.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const nextIdRef = useRef(0);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);

    const t1 = setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      timersRef.current.delete(t1);
    }, 2700);
    timersRef.current.add(t1);

    const t2 = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(t2);
    }, 3000);
    timersRef.current.add(t2);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}
            role={t.type === 'error' ? 'alert' : 'status'}
            onAnimationEnd={() => {
              if (t.exiting) {
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
              }
            }}
          >
            <ToastIcon type={t.type} />
            <span>{t.message}</span>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => dismissToast(t.id)}
              aria-label={tt('dismissNotification')}
            >
              ×
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
ToastProvider.displayName = 'ToastProvider';
