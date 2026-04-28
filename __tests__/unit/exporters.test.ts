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
const jsPdfCtor = vi.fn(() => ({ addImage, output }));

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

  it('exports pdf successfully', async () => {
    const el = document.createElement('div');
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'width', { value: 960 });
    Object.defineProperty(canvas, 'height', { value: 480 });
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/jpeg;base64,abc');
    html2canvasMock.mockResolvedValue(canvas);
    output.mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' }));

    const result = await pdfExporter.export(
      el,
      makeOptions({ format: 'pdf', filename: 'x.pdf', allowSensitiveData: true })
    );
    expect(result.success).toBe(true);
    expect(jsPdfCtor).toHaveBeenCalledTimes(1);
    expect(addImage).toHaveBeenCalledTimes(1);
    expect(result.filename).toBe('x.pdf');
  });
});
