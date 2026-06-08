import type { ExportFormat } from './tool-config';

/**
 * Options for controlling an export operation.
 *
 * @property format - Target export format
 * @property quality - Image quality (0-1, only applies to lossy formats like JPEG)
 * @property scale - Scale factor for raster export (e.g. 2 for retina)
 * @property filename - Override the auto-generated filename
 * @property background - CSS background color to render behind transparent content
 * @property padding - Padding in pixels around the exported content
 * @property orientation - Page orientation for PDF export
 * @property allowSensitiveData - If false, sensitive data will be redacted (default false)
 * @property signal - Optional AbortSignal to cancel a long-running export
 */
export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  scale?: number;
  filename?: string;
  background?: string;
  padding?: number;
  orientation?: 'portrait' | 'landscape' | 'auto';
  allowSensitiveData?: boolean;
  signal?: AbortSignal;
}

/**
 * Result returned by an export operation.
 *
 * @property success - Whether the export completed successfully
 * @property data - Exported blob (for binary formats) or string (for JSON/text), null on failure
 * @property filename - The resolved filename used for download
 * @property format - The format that was exported
 * @property error - Error message if success is false
 */
export interface ExportResult {
  success: boolean;
  data: Blob | string | null;
  filename: string;
  format: ExportFormat;
  error?: string;
}

/**
 * Contract that every format-specific exporter must satisfy.
 *
 * @property format - The export format this exporter handles
 * @property export - Perform the export and return a result
 */
export interface Exporter {
  format: ExportFormat;
  export: (
    element: HTMLElement,
    options: ExportOptions,
    stateSerializer?: () => string
  ) => Promise<ExportResult>;
}

/**
 * A function that lazily loads an exporter module via dynamic import.
 * The module should either have a default export or a named 'exporter' export.
 */
export type ExporterLoader = () => Promise<{ default: Exporter } | { exporter: Exporter }>;

/** Human-readable labels for each supported export format. */
export const formatLabels = {
  png: 'PNG Image',
  jpeg: 'JPEG Image',
  webp: 'WebP Image',
  pdf: 'PDF Document',
  json: 'JSON Data',
} satisfies Record<ExportFormat, string>;
