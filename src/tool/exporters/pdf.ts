import type { Exporter } from '@itsjust/core';
import { formatExportError, renderCanvas, throwIfAborted } from './utils';

function pxToMm(px: number): number {
  return (px * 25.4) / 96;
}

function getElementDimensions(element: HTMLElement): { widthPx: number; heightPx: number } {
  const rect = element.getBoundingClientRect();
  const widthPx = Math.max(Math.ceil(rect.width), element.scrollWidth, element.clientWidth, 1);
  const heightPx = Math.max(Math.ceil(rect.height), element.scrollHeight, element.clientHeight, 1);
  return { widthPx, heightPx };
}

async function renderDomPdf(
  pdf: {
    html: (
      source: HTMLElement,
      options: {
        callback: () => void;
        margin: [number, number, number, number];
        autoPaging: 'text';
        x: number;
        y: number;
        html2canvas: {
          scale: number;
          backgroundColor: string;
          useCORS: boolean;
          logging: boolean;
          scrollX: number;
          scrollY: number;
          windowWidth: number;
          windowHeight: number;
        };
      }
    ) => void;
  },
  element: HTMLElement,
  options: Parameters<Exporter['export']>[1]
): Promise<void> {
  const { widthPx, heightPx } = getElementDimensions(element);
  await new Promise<void>((resolve, reject) => {
    try {
      pdf.html(element, {
        callback: () => resolve(),
        margin: [0, 0, 0, 0],
        autoPaging: 'text',
        x: 0,
        y: 0,
        html2canvas: {
          scale: options.scale ?? 2,
          backgroundColor: options.background ?? '#ffffff',
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: widthPx,
          windowHeight: heightPx,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function renderRasterFallback(
  pdf: { addImage: (...args: unknown[]) => void },
  element: HTMLElement,
  options: Parameters<Exporter['export']>[1]
): Promise<void> {
  const canvas = await renderCanvas(element, options);
  const imgData = canvas.toDataURL('image/jpeg', options.quality ?? 0.92);
  const widthMm = pxToMm(canvas.width);
  const heightMm = pxToMm(canvas.height);
  pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm);
}

function addSearchableTextLayer(
  pdf: {
    setFontSize: (size: number) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    text: (text: string, x: number, y: number, options?: { maxWidth?: number }) => void;
  },
  element: HTMLElement,
  widthMm: number,
  heightMm: number
): void {
  const text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
  if (!text) return;
  pdf.setFontSize(1);
  pdf.setTextColor(255, 255, 255);
  pdf.text(text, 0.5, Math.max(0.5, heightMm - 0.5), { maxWidth: Math.max(1, widthMm - 1) });
}

const pdfExporter: Exporter = {
  format: 'pdf',
  export: async (element, options) => {
    try {
      throwIfAborted(options.signal);
      const { jsPDF } = await import('jspdf');
      const { widthPx, heightPx } = getElementDimensions(element);
      const widthMm = pxToMm(widthPx);
      const heightMm = pxToMm(heightPx);
      const orientation =
        options.orientation === 'portrait' || options.orientation === 'landscape'
          ? options.orientation
          : widthMm > heightMm
            ? 'landscape'
            : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [widthMm, heightMm],
      });
      try {
        await renderDomPdf(pdf, element, options);
      } catch {
        await renderRasterFallback(pdf, element, options);
      }
      addSearchableTextLayer(pdf, element, widthMm, heightMm);
      throwIfAborted(options.signal);
      const blob = pdf.output('blob');

      return {
        success: true,
        data: blob,
        filename: options.filename ?? `export-${Date.now()}.pdf`,
        format: 'pdf',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}.pdf`,
        format: 'pdf',
        error: formatExportError(error, 'PDF'),
      };
    }
  },
};

export default pdfExporter;
