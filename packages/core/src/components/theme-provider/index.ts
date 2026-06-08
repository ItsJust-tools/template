/**
 * Theme components for dark/light/high-contrast mode support.
 *
 * {@link ThemeProvider} — React context provider wrapping the application that
 * reads the current theme from state and applies CSS class / data-attribute
 * to the document root element.
 *
 * {@link ThemeScript} — Inline `<script>` injected into `<head>` to apply the
 * stored theme before React hydrates, preventing flash of wrong theme.
 *
 * {@link useTheme} — Hook provided by ThemeContext for reading and toggling
 * the current theme within child components.
 */
export { ThemeProvider, useTheme } from './theme-provider';
export { ThemeScript } from './theme-script';
export type { ToolTheme } from '../../types';
