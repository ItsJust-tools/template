/**
 * Payload structure for sharing tool state.
 * This is the content portion of an `.itsjust.json` share file.
 *
 * @property toolId - Identifies which tool created this share data
 * @property content - Tool-specific state payload (passed to tool.deserialize)
 * @property metadata - Optional metadata about the share
 */
export interface ShareData {
  toolId: string;
  content: unknown;
  metadata?: {
    title?: string;
    description?: string;
    schemaVersion: string;
  };
}

/**
 * Result of a share operation.
 *
 * @property id - Generated unique identifier for this share
 * @property url - Full share URL encoding the compressed state
 * @property createdAt - ISO 8601 timestamp of when the share was created
 */
export interface ShareResult {
  id: string;
  url: string;
  createdAt: string;
}
