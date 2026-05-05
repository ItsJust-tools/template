import type { ExportFormat, ExportOptions, ExportResult, Exporter } from '@itsjust/core';
import { toBlob } from 'html-to-image';

export function formatExportError(error: unknown, format: string): string {
  const base = error instanceof Error ? error.message : `${format} export failed`;
  const isCors = /cors|cross-origin|tainted|security/i.test(base);
  if (isCors) {
    return `${base}. Try removing external images or enable CORS on your assets.`;
  }
  return base;
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Export aborted', 'AbortError');
  }
}

function replaceTextareaWithDiv(container: HTMLElement): void {
  const textarea = container.querySelector('textarea');
  if (!(textarea instanceof HTMLTextAreaElement)) return;

  const replacement = document.createElement('div');
  replacement.className = 'notepad-textarea-replacement';
  replacement.textContent = textarea.value;

  const computed = window.getComputedStyle(textarea);
  replacement.style.font = computed.font;
  replacement.style.lineHeight = computed.lineHeight;
  replacement.style.letterSpacing = computed.letterSpacing;
  replacement.style.color = computed.color;
  replacement.style.background = computed.background;
  replacement.style.padding = computed.padding;
  replacement.style.whiteSpace = 'pre-wrap';
  replacement.style.overflowWrap = 'anywhere';
  replacement.style.wordBreak = 'break-word';
  replacement.style.width = '100%';
  replacement.style.maxWidth = '100%';
  replacement.style.border = 'none';
  replacement.style.outline = 'none';
  replacement.style.margin = '0';
  replacement.style.boxSizing = 'border-box';
  replacement.style.minHeight = '0';
  replacement.style.flex = 'none';
  replacement.style.height = 'auto';

  textarea.parentNode?.replaceChild(replacement, textarea);
}

export function createStyledClone(element: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className = 'export-clone-container';
  document.body.appendChild(container);

  const clone = element.cloneNode(true) as HTMLElement;
  container.appendChild(clone);

  replaceTextareaWithDiv(clone);

  return container;
}

export async function renderToImage(
  element: HTMLElement,
  options: ExportOptions
): Promise<HTMLCanvasElement> {
  throwIfAborted(options.signal);
  if (!options.allowSensitiveData) {
    const sensitive = element.querySelector('input[type="password"], [data-sensitive="true"]');
    if (sensitive) {
      throw new Error('Export blocked: sensitive elements detected');
    }
  }

  const container = createStyledClone(element);
  const clone = container.firstElementChild as HTMLElement;
  if (!clone) {
    container.remove();
    throw new Error('Failed to create export clone');
  }

  try {
    throwIfAborted(options.signal);

    const blob = await toBlob(clone, {
      pixelRatio: options.scale ?? 2,
      backgroundColor: options.background ?? '#ffffff',
      cacheBust: true,
      skipFonts: true,
    });

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    const canvas = document.createElement('canvas');
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(img.src);

    return canvas;
  } finally {
    container.remove();
  }
}

export function createCanvasExporter(
  format: ExportFormat,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  defaultExt: 'png' | 'jpg' | 'webp',
  defaultQuality?: number
): Exporter {
  return {
    format,
    export: async (element, options): Promise<ExportResult> => {
      try {
        const canvas = await renderToImage(element, options);
        const quality = options.quality ?? defaultQuality;
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
            mimeType,
            quality
          );
        });
        return {
          success: true,
          data: blob,
          filename: options.filename ?? `export-${Date.now()}.${defaultExt}`,
          format,
        };
      } catch (error) {
        return {
          success: false,
          data: null,
          filename: options.filename ?? `export-${Date.now()}.${defaultExt}`,
          format,
          error: formatExportError(error, format.toUpperCase()),
        };
      }
    },
  };
}
