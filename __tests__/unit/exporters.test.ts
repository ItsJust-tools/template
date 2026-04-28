import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatExportError,
  throwIfAborted,
  loadHtml2canvas,
  renderCanvas,
  createCanvasExporter,
} from '@/tool/exporters/utils';
import pdfExporter from '@/tool/exporters/pdf';
import type { ExportOptions } from '@itsjust/core';

const html2canvasMock = vi.fn();

vi.mock('html2canvas', () => ({
  default: (...args: unknown[]) => html2canvasMock(...args),
}));

const addImage = vi.fn();
const output = vi.fn();
const html = vi.fn();
const setFontSize = vi.fn();
const setTextColor = vi.fn();
const text = vi.fn();
const jsPdfCtor = vi.fn(() => ({ addImage, output, html, setFontSize, setTextColor, text }));

vi.mock('jspdf', () => ({
  jsPDF: jsPdfCtor,
}));

describe('exporters', () => {
  const makeOptions = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
    format: 'png',
    ...overrides,
  });

  beforeEach(() => {
    html2canvasMock.mockReset();
    addImage.mockReset();
    output.mockReset();
    html.mockReset();
    setFontSize.mockReset();
    setTextColor.mockReset();
    text.mockReset();
    jsPdfCtor.mockClear();
  });

  it('formats cors errors with guidance', () => {
    const msg = formatExportError(new Error('CORS blocked image'), 'PNG');
    expect(msg).toContain('enable CORS');
  });

  it('throws abort error when signal is aborted', () => {
    const ctrl = new AbortController();
    ctrl.abort();
    expect(() => throwIfAborted(ctrl.signal)).toThrowError(/Export aborted/);
  });

  it('loads html2canvas module', async () => {
    html2canvasMock.mockResolvedValue(document.createElement('canvas'));
    const mod = await loadHtml2canvas();
    expect(typeof mod).toBe('function');
  });

  it('blocks sensitive exports by default', async () => {
    const el = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'password';
    el.appendChild(input);

    await expect(renderCanvas(el, makeOptions())).rejects.toThrowError(
      /sensitive elements detected/
    );
  });

  it('renders canvas via html2canvas with capture dimensions', async () => {
    const el = document.createElement('div');
    el.id = 'capture-id';
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 120, height: 80 }),
    });
    Object.defineProperty(el, 'scrollWidth', { value: 140 });
    Object.defineProperty(el, 'clientWidth', { value: 110 });
    Object.defineProperty(el, 'scrollHeight', { value: 95 });
    Object.defineProperty(el, 'clientHeight', { value: 90 });

    const canvas = document.createElement('canvas');
    html2canvasMock.mockResolvedValue(canvas);

    const out = await renderCanvas(
      el,
      makeOptions({ allowSensitiveData: true, scale: 3, background: '#fff' })
    );
    expect(out).toBe(canvas);
    expect(html2canvasMock).toHaveBeenCalledTimes(1);
    const firstCall = html2canvasMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) throw new Error('missing html2canvas call');
    expect(firstCall[1]).toMatchObject({
      scale: 3,
      width: 140,
      height: 95,
      backgroundColor: '#fff',
    });
  });

  it('creates image exporter success and failure results', async () => {
    const el = document.createElement('div');
    const canvas = document.createElement('canvas');
    html2canvasMock.mockResolvedValue(canvas);

    const toBlobOk = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((cb) => cb(new Blob(['ok'], { type: 'image/png' })));

    const exporter = createCanvasExporter('png', 'image/png', 'png');
    const ok = await exporter.export(
      el,
      makeOptions({ format: 'png', filename: 'a.png', allowSensitiveData: true })
    );
    expect(ok.success).toBe(true);
    expect(ok.filename).toBe('a.png');

    toBlobOk.mockRestore();
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(null));

    const failed = await exporter.export(
      el,
      makeOptions({ format: 'png', filename: 'b.png', allowSensitiveData: true })
    );
    expect(failed.success).toBe(false);
    expect(failed.error).toContain('Failed to create blob');
  });

  it('passes format-specific mime type and quality to canvas toBlob', async () => {
    const el = document.createElement('div');
    html2canvasMock.mockResolvedValue(document.createElement('canvas'));
    const toBlobSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((cb) => cb(new Blob(['ok'])));

    const jpegExporter = createCanvasExporter('jpeg', 'image/jpeg', 'jpg', 0.92);
    const webpExporter = createCanvasExporter('webp', 'image/webp', 'webp', 0.9);

    await jpegExporter.export(el, makeOptions({ format: 'jpeg', allowSensitiveData: true }));
    await webpExporter.export(el, makeOptions({ format: 'webp', allowSensitiveData: true }));

    expect(toBlobSpy).toHaveBeenNthCalledWith(1, expect.any(Function), 'image/jpeg', 0.92);
    expect(toBlobSpy).toHaveBeenNthCalledWith(2, expect.any(Function), 'image/webp', 0.9);
    toBlobSpy.mockRestore();
  });

  it('captures large image export dimensions for long content', async () => {
    const el = document.createElement('div');
    el.id = 'long-capture';
    el.textContent = Array.from({ length: 300 }, (_, i) => `line-${i}`).join('\n');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 320, height: 240 }),
    });
    Object.defineProperty(el, 'scrollWidth', { value: 1600 });
    Object.defineProperty(el, 'clientWidth', { value: 320 });
    Object.defineProperty(el, 'scrollHeight', { value: 3200 });
    Object.defineProperty(el, 'clientHeight', { value: 240 });

    const canvas = document.createElement('canvas');
    html2canvasMock.mockResolvedValue(canvas);
    const toBlobSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((cb) => cb(new Blob(['ok'], { type: 'image/png' })));

    const exporter = createCanvasExporter('png', 'image/png', 'png');
    const result = await exporter.export(
      el,
      makeOptions({ format: 'png', filename: 'long.png', allowSensitiveData: true })
    );

    expect(result.success).toBe(true);
    expect(result.filename).toBe('long.png');
    const firstCall = html2canvasMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) throw new Error('missing html2canvas call');
    expect(firstCall[1]).toMatchObject({
      width: 1600,
      height: 3200,
      windowWidth: 1600,
      windowHeight: 3200,
    });
    toBlobSpy.mockRestore();
  });

  it('updates cloned element overflow when capturing by id', async () => {
    const el = document.createElement('div');
    el.id = 'capture-me';
    const canvas = document.createElement('canvas');
    html2canvasMock.mockImplementation(async (_element, options) => {
      if (!options || typeof options.onclone !== 'function') throw new Error('onclone missing');
      const doc = document.implementation.createHTMLDocument();
      const clone = doc.createElement('div');
      clone.id = 'capture-me';
      clone.style.overflow = 'hidden';
      doc.body.appendChild(clone);
      options.onclone(doc);
      expect(clone.style.overflow).toBe('visible');
      return canvas;
    });

    const out = await renderCanvas(el, makeOptions({ allowSensitiveData: true }));
    expect(out).toBe(canvas);
  });

  it('exports pdf successfully', async () => {
    const el = document.createElement('div');
    el.textContent = 'pdf text';
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 960, height: 480 }),
    });
    Object.defineProperty(el, 'scrollWidth', { value: 960 });
    Object.defineProperty(el, 'clientWidth', { value: 960 });
    Object.defineProperty(el, 'scrollHeight', { value: 480 });
    Object.defineProperty(el, 'clientHeight', { value: 480 });
    html.mockImplementation((_source, options) => options.callback());
    output.mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' }));

    const result = await pdfExporter.export(
      el,
      makeOptions({ format: 'pdf', filename: 'x.pdf', allowSensitiveData: true })
    );
    expect(result.success).toBe(true);
    expect(jsPdfCtor).toHaveBeenCalledTimes(1);
    expect(html).toHaveBeenCalledTimes(1);
    expect(addImage).not.toHaveBeenCalled();
    expect(text).toHaveBeenCalledTimes(1);
    expect(text).toHaveBeenCalledWith(
      expect.stringContaining('pdf text'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
    expect(result.filename).toBe('x.pdf');
  });

  it('adds normalized long multiline text to pdf text layer', async () => {
    const el = document.createElement('div');
    el.textContent =
      ' First line with extra spaces \n\nSecond line\nThird line with trailing spaces    ';
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 700, height: 900 }),
    });
    Object.defineProperty(el, 'scrollWidth', { value: 700 });
    Object.defineProperty(el, 'clientWidth', { value: 700 });
    Object.defineProperty(el, 'scrollHeight', { value: 900 });
    Object.defineProperty(el, 'clientHeight', { value: 900 });
    html.mockImplementation((_source, options) => options.callback());
    output.mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' }));

    const result = await pdfExporter.export(
      el,
      makeOptions({ format: 'pdf', filename: 'long-text.pdf', allowSensitiveData: true })
    );
    expect(result.success).toBe(true);
    expect(text).toHaveBeenCalledTimes(1);
    expect(text).toHaveBeenCalledWith(
      'First line with extra spaces Second line Third line with trailing spaces',
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ maxWidth: expect.any(Number) })
    );
  });

  it('falls back to rasterized pdf when dom rendering fails', async () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 960, height: 480 }),
    });
    Object.defineProperty(el, 'scrollWidth', { value: 960 });
    Object.defineProperty(el, 'clientWidth', { value: 960 });
    Object.defineProperty(el, 'scrollHeight', { value: 480 });
    Object.defineProperty(el, 'clientHeight', { value: 480 });

    html.mockImplementation(() => {
      throw new Error('html render failed');
    });
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'width', { value: 960 });
    Object.defineProperty(canvas, 'height', { value: 480 });
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/jpeg;base64,abc');
    html2canvasMock.mockResolvedValue(canvas);
    output.mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' }));

    const result = await pdfExporter.export(
      el,
      makeOptions({ format: 'pdf', filename: 'fallback.pdf', allowSensitiveData: true })
    );
    expect(result.success).toBe(true);
    expect(html).toHaveBeenCalledTimes(1);
    expect(addImage).toHaveBeenCalledTimes(1);
    expect(text).toHaveBeenCalledTimes(0);
    expect(result.filename).toBe('fallback.pdf');
  });
});
