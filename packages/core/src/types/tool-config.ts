/**
 * Theme configuration for a tool's visual identity.
 *
 * @property accent - Primary accent color (CSS color value)
 * @property accentHover - Hover variant of the accent color
 * @property accentSubtle - Subtle/transparent variant for backgrounds
 * @property brand - Display name shown in the shell header
 * @property brandUrl - Optional URL linked from the brand name
 * @property icon - Emoji or text icon representing the tool
 */
export interface ToolTheme {
  accent?: string;
  accentHover?: string;
  accentSubtle?: string;
  brand?: string;
  brandUrl?: string;
  icon?: string;
}

/**
 * A single keyboard shortcut definition.
 *
 * @property keys - Key combination string (e.g. "Ctrl+S", "Mod+Shift+P")
 * @property label - Short human-readable label shown in the shortcuts dialog
 * @property description - Optional longer explanation of what the shortcut does
 */
export interface ShortcutDef {
  keys: string;
  label: string;
  description?: string;
}

/**
 * A group of related shortcuts presented together in the UI.
 *
 * @property title - Group heading (e.g. "Editing", "Navigation")
 * @property shortcuts - The shortcuts belonging to this group
 */
export interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutDef[];
}

/**
 * Complete tool configuration used throughout the framework.
 * This is the single source of truth for a tool's identity and capabilities.
 *
 * @property id - Unique machine-readable identifier (lowercase, kebab-case)
 * @property name - Human-readable tool name shown in headings and metadata
 * @property description - Short description used in SEO meta tags and the sidebar
 * @property version - Semantic version string (e.g. "1.0.0")
 * @property exportFormats - List of export formats the tool supports
 * @property features - Feature flags controlling which shell components are active
 * @property ogImage - Optional custom Open Graph image path (defaults to /og.svg)
 * @property theme - Optional visual theme overrides (colors, brand name, icon)
 * @property shortcuts - Optional keyboard shortcut groups shown in the shortcuts dialog
 */
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  exportFormats: ExportFormat[];
  features: FeatureFlags;
  ogImage?: string;
  theme?: ToolTheme;
  shortcuts?: ShortcutGroup[];
}

/**
 * Feature flags that enable or disable shell components.
 * Each flag controls visibility of a specific part of the UI.
 *
 * @property export - Show import/export controls in the toolbar
 * @property autoSave - Enable automatic state persistence to localStorage
 * @property undoRedo - Enable undo/redo history (requires useToolState)
 * @property sidebar - Show the sidebar panel
 * @property statusBar - Show the status bar at the bottom
 * @property darkMode - Enable dark/light mode toggle
 */
export interface FeatureFlags {
  export: boolean;
  autoSave: boolean;
  undoRedo: boolean;
  sidebar: boolean;
  statusBar: boolean;
  darkMode: boolean;
}

/** Default feature flags with all features enabled. */
export const defaultFeatures: FeatureFlags = {
  export: true,
  autoSave: true,
  undoRedo: true,
  sidebar: true,
  statusBar: true,
  darkMode: true,
};

/** Supported export formats for tool state and canvas output. */
export type ExportFormat = 'png' | 'pdf' | 'json' | 'jpeg' | 'webp';
