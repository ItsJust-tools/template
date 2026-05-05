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

function createExportClone(element: HTMLElement): { clone: HTMLElement; container: HTMLElement } {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.width = `${element.offsetWidth}px`;
  container.style.pointerEvents = 'none';

  const clone = element.cloneNode(true) as HTMLElement;

  // Inline computed background so theme context is preserved in the detached clone
  const computedBg = window.getComputedStyle(element).backgroundColor;
  if (computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent') {
    clone.style.backgroundColor = computedBg;
  }

  // Expand textarea to capture full scrolled content
  const originalTextarea = element.querySelector('textarea');
  const clonedTextarea = clone.querySelector('textarea');
  if (originalTextarea && clonedTextarea) {
    const ta = clonedTextarea as HTMLTextAreaElement;
    ta.style.height = `${originalTextarea.scrollHeight}px`;
    ta.style.minHeight = '0';
    ta.style.maxHeight = 'none';
    ta.style.overflow = 'visible';
    // cloneNode does not copy textarea value
    ta.value = originalTextarea.value;
  }

  clone.style.overflow = 'visible';
  clone.style.height = 'auto';
  clone.style.minHeight = '0';

  container.appendChild(clone);
  document.body.appendChild(container);

  return { clone, container };
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

  const { clone, container } = createExportClone(element);

  try {
    throwIfAborted(options.signal);

    const blob = await toBlob(clone, {
      pixelRatio: options.scale ?? 2,
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
