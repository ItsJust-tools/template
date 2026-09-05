/**
 * Sanitize a generated export filename so it is safe to use across
 * different operating systems (Windows, Linux, macOS).
 *
 * Replaces characters that are invalid in filenames on common filesystems
 * (`\`, `/`, `:`, `*`, `?`, `"`, `<`, `>`, `|`, `%`) with a dash, trims
 * surrounding whitespace, strips control characters and leading dots, and
 * enforces a maximum length of 100 characters (excluding the extension).
 *
 * @param filename - The raw filename to sanitize (may include an extension).
 * @returns A sanitized, OS-safe filename.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'export';

  // Split off the extension so we can preserve it while truncating the base.
  const match = /^(.*?)(\.[a-zA-Z0-9]+)?$/.exec(filename);
  const base = match?.[1] ?? filename;
  const ext = match?.[2] ?? '';

  // Replace invalid OS characters, control characters, and leading dots.
  let safeBase = base
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/^\.+/, '')
    .trim();

  // Collapse repeated dashes and trim leading/trailing dashes.
  safeBase = safeBase.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');

  if (!safeBase) safeBase = 'export';

  // Enforce a max length of 100 characters for the base name.
  const maxBaseLength = 100;
  if (safeBase.length > maxBaseLength) {
    safeBase = safeBase.slice(0, maxBaseLength).replace(/-+$/g, '');
  }

  return `${safeBase}${ext}`;
}
