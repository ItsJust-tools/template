/**
 * ToolShell — the main application chrome for itsjust tools.
 *
 * {@link ToolShell} — Root layout component that manages the toolbar, sidebar,
 * canvas area, and status bar. Handles keyboard shortcuts, theme toggling,
 * and accessibility (skip-nav, focus management).
 *
 * {@link LoadingSkeleton} — Placeholder UI shown while the tool is initializing
 * or loading its state from storage.
 */
export { ToolShell, LoadingSkeleton } from './tool-shell';
export type { ToolbarActions } from './tool-shell';
