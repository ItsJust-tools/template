import type { Exporter } from '../../types';

/**
 * Built-in JSON exporter that serializes tool state via the provided
 * stateSerializer function. Always available without lazy-loading.
 *
 * The exporter returns a JSON string directly (no DOM element capture needed).
 */
const jsonExporter: Exporter = {
  format: 'json',
  export: async (_element, options, stateSerializer) => {
    try {
      const jsonString = stateSerializer?.() ?? '{}';
      return {
        success: true,
        data: jsonString,
        filename: options.filename ?? `export-${Date.now()}.json`,
        format: 'json',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}.json`,
        format: 'json',
        error: error instanceof Error ? error.message : 'JSON export failed',
      };
    }
  },
};

export default jsonExporter;
