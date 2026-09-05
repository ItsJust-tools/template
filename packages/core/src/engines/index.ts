/**
 * Engine classes for persistent storage and export operations.
 *
 * {@link StorageManager} — Key-value persistence with versioning and LZ-String compression.
 * {@link ExportEngine} — Lazy-loading export pipeline supporting PNG, JPEG, WebP, PDF, and JSON.
 *
 * Legacy globals:
 * {@link registerExporterLoader} / {@link exporterLoaders} — Deprecated; prefer declarative
 * exporters declared on the {@link import('../tool').Tool} definition instead.
 */
export { ExportEngine, createExportEngine } from './export-engine';
export { sanitizeFilename } from './filename';
export { StorageManager, storageManager } from './storage-manager';
export { registerExporterLoader, exporterLoaders } from './exporters';
