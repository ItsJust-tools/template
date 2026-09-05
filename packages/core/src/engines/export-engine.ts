import type { ExportFormat, ExportOptions, ExportResult, Exporter, ExporterLoader } from '../types';
import { jsonExporter, exporterLoaders } from './exporters';
import { sanitizeFilename } from './filename';

/** Set of MIME types allowed for programmatic download via blob URLs. */
const ALLOWED_DOWNLOAD_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/json',
  'text/plain',
]);

/**
 * Trigger a browser file download for a given export result.
 * Validates the blob MIME type against an allowlist before proceeding.
 *
 * @param result - The export result containing the blob or string data
 */
function triggerDownload(result: ExportResult): void {
  if (!result.success || !result.data) return;

  const blob =
    result.data instanceof Blob ? result.data : new Blob([result.data], { type: 'text/plain' });
  if (!ALLOWED_DOWNLOAD_TYPES.has(blob.type)) {
    console.error(`[triggerDownload] Blocked unsafe blob type: ${blob.type}`);
    return;
  }
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFilename(result.filename);
  link.style.display = 'none';
  if (!document.body) {
    console.error('[triggerDownload] Document body is not ready');
    URL.revokeObjectURL(url);
    return;
  }
  document.body.appendChild(link);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(url, '_blank');
  } else {
    link.click();
  }
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Manages export operations for a tool. Handles lazy-loading of format-specific
 * exporter modules, caching loaded exporters, and coordinating export + download.
 *
 * The engine maintains an LRU cache for loaded exporters to keep memory usage bounded.
 * The JSON exporter is always available without loading.
 *
 * @example
 * ```ts
 * const engine = new ExportEngine({ png: () => import('./exporters/png') });
 * await engine.exportAndDownload(
 *   element,
 *   { format: 'png', filename: 'screenshot' }
 * );
 * ```
 */
export class ExportEngine {
  private exporters: Partial<Record<ExportFormat, Exporter>> = { json: jsonExporter };
  private localLoaders: Partial<Record<ExportFormat, ExporterLoader>>;
  private cachedFormats: ExportFormat[] = [];
  private maxExporterCacheSize: number;

  /**
   * @param localLoaders - Tool-specific exporter loaders keyed by format
   * @param maxExporterCacheSize - Maximum number of non-JSON exporters to cache in memory (default: 6)
   */
  constructor(
    localLoaders?: Partial<Record<ExportFormat, ExporterLoader>>,
    maxExporterCacheSize = 6
  ) {
    this.localLoaders = { ...localLoaders };
    this.maxExporterCacheSize = Math.max(1, maxExporterCacheSize);
  }

  /**
   * Register an already-loaded exporter instance.
   * Useful for programmatically adding custom exporters.
   *
   * @param exporter - The exporter instance to register
   */
  registerExporter(exporter: Exporter): void {
    this.exporters[exporter.format] = exporter;
    if (exporter.format !== 'json') {
      this.touchCache(exporter.format);
    }
  }

  /** Return the list of formats for which an exporter is currently loaded or loadable. */
  getSupportedFormats(): ExportFormat[] {
    return Object.keys(this.exporters) as ExportFormat[];
  }

  /**
   * Mark a format as recently used (LRU cache promotion).
   * Evicts the least-recently used format if the cache exceeds the max size.
   */
  private touchCache(format: ExportFormat): void {
    if (format === 'json') return;
    this.cachedFormats = this.cachedFormats.filter((f) => f !== format);
    this.cachedFormats.push(format);
    while (this.cachedFormats.length > this.maxExporterCacheSize) {
      const evict = this.cachedFormats.shift();
      if (evict) {
        delete this.exporters[evict];
      }
    }
  }

  /**
   * Load an exporter for the given format, either from cache or via dynamic import.
   * On success, the exporter is cached (LRU) for future calls.
   *
   * @param format - The export format to load
   * @returns The exporter instance, or undefined if no loader is registered for that format
   */
  async loadExporter(format: ExportFormat): Promise<Exporter | undefined> {
    if (this.exporters[format]) {
      this.touchCache(format);
      return this.exporters[format];
    }

    const loader = this.localLoaders[format] ?? exporterLoaders[format];
    if (!loader) return undefined;

    const mod = await loader();
    const exporter = 'default' in mod ? mod.default : mod.exporter;
    this.exporters[format] = exporter;
    this.touchCache(format);
    return exporter;
  }

  /**
   * Export the given element to the specified format.
   *
   * @param element - The DOM element to capture
   * @param options - Export options (format, quality, filename, etc.)
   * @param stateSerializer - Optional function that returns a JSON string of tool state
   * @returns An ExportResult describing success or failure
   */
  async export(
    element: HTMLElement,
    options: ExportOptions,
    stateSerializer?: () => string
  ): Promise<ExportResult> {
    const exporter = await this.loadExporter(options.format);
    if (!exporter) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}`,
        format: options.format,
        error: `No exporter registered for format: ${options.format}`,
      };
    }
    return exporter.export(element, options, stateSerializer);
  }

  /**
   * Export and immediately trigger a browser download.
   * Combines {@link export} and {@link triggerDownload}.
   *
   * @param element - The DOM element to capture
   * @param options - Export options
   * @param stateSerializer - Optional state serializer for JSON export
   * @returns The ExportResult from the underlying export operation
   */
  async exportAndDownload(
    element: HTMLElement,
    options: ExportOptions,
    stateSerializer?: () => string
  ): Promise<ExportResult> {
    const result = await this.export(element, options, stateSerializer);
    if (result.success) {
      triggerDownload(result);
    }
    return result;
  }
}

/**
 * Create a new ExportEngine with the given local exporter loaders.
 * This is the recommended factory function for creating an engine instance.
 *
 * @param localLoaders - Tool-specific exporter loaders keyed by format
 * @param maxExporterCacheSize - Maximum cached non-JSON exporters (default: 6)
 * @returns A configured ExportEngine instance
 */
export function createExportEngine(
  localLoaders?: Partial<Record<ExportFormat, ExporterLoader>>,
  maxExporterCacheSize?: number
): ExportEngine {
  return new ExportEngine(localLoaders, maxExporterCacheSize);
}
