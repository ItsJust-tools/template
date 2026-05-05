import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatExportError,
  throwIfAborted,
  renderToImage,
  createCanvasExporter,
} from '@/tool/exporters/utils';
import pdfExporter from '@/tool/exporters/pdf';
import type { ExportOptions } from '@itsjust/core';

const toBlobMock = vi.fn();

vi.mock('html-to-image', () => ({
  toBlob: (...args: unknown[]) => toBlobMock(...args),
  toPng: vi.fn(),
}));

function mockImageClass(width: number, height: number) {
  return class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = width;
    naturalHeight = height;
    private _src = '';
    get src() {
      return this._src;
    }
    set src(value: string) {
      this._src = value;
      queueMicrotask(() => this.onload?.());
    }
  };
}

function createFakeCanvasContext() {
  return {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('exporters', () => {
  const makeOptions = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
    format: 'png',
    ...overrides,
  });

  let getContextSpy: ReturnType<typeof vi.spyOn>;
  let canvasToBlobSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    toBlobMock.mockReset();
    document.body.innerHTML = '';
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => createFakeCanvasContext());
    canvasToBlobSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((cb) => cb(new Blob(['fake'], { type: 'image/png' })));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    getContextSpy?.mockRestore();
    canvasToBlobSpy?.mockRestore();
    vi.restoreAllMocks();
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

  it('blocks sensitive exports by default', async () => {
    const el = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'password';
    el.appendChild(input);

    await expect(renderToImage(el, makeOptions(), 'image/png')).rejects.toThrowError(
      /sensitive elements detected/
    );
  });

  it('renders image via html-to-image with correct options', async () => {
    const el = document.createElement('div');
    el.className = 'notepad-canvas';

    // Mock html-to-image to return a simple blob
    toBlobMock.mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' }));

    // Mock Image loading since we create an Image from the blob
    const originalImage = globalThis.Image;
    vi.stubGlobal('Image', mockImageClass(200, 100));

    const result = await renderToImage(
      el,
      makeOptions({ allowSensitiveData: true, scale: 3, background: '#fff' }),
      'image/png'
    );

    expect(result).toBeInstanceOf(HTMLCanvasElement);
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
    expect(toBlobMock).toHaveBeenCalledTimes(1);
    const firstCall = toBlobMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) throw new Error('missing toBlob call');
    expect(firstCall[1]).toMatchObject({
      pixelRatio: 3,
      backgroundColor: '#fff',
      cacheBust: true,
      skipFonts: true,
    });

    vi.stubGlobal('Image', originalImage);
  });

  it('creates image exporter success and failure results', async () => {
    const el = document.createElement('div');
    el.className = 'notepad-canvas';

    toBlobMock.mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' }));

    const originalImage = globalThis.Image;
    vi.stubGlobal('Image', mockImageClass(100, 50));

    const exporter = createCanvasExporter('png', 'image/png', 'png');
    const ok = await exporter.export(
      el,
      makeOptions({ format: 'png', filename: 'a.png', allowSensitiveData: true })
    );
    expect(ok.success).toBe(true);
    expect(ok.filename).toBe('a.png');

    // Force failure by making toBlob return null
    toBlobMock.mockResolvedValue(null);

    const failed = await exporter.export(
      el,
      makeOptions({ format: 'png', filename: 'b.png', allowSensitiveData: true })
    );
    expect(failed.success).toBe(false);
    expect(failed.error).toContain('Failed to create image blob');

    vi.stubGlobal('Image', originalImage);
  });

  it('passes format-specific mime type and quality to canvas toBlob', async () => {
    const el = document.createElement('div');
    el.className = 'notepad-canvas';

    toBlobMock.mockResolvedValue(new Blob(['fake-image'], { type: 'image/png' }));

    const originalImage = globalThis.Image;
    vi.stubGlobal('Image', mockImageClass(10, 10));

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
    vi.stubGlobal('Image', originalImage);
  });

  it('exports pdf successfully via iframe print', async () => {
    const el = document.createElement('div');
    el.textContent = 'pdf text';

    const printMock = vi.fn();
    let capturedDoc: { write: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> } | null = null;

    // Spy on appendChild to capture the iframe
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLIFrameElement || (node as HTMLElement).tagName === 'IFRAME') {
        const iframe = node as HTMLIFrameElement;
        const mockDoc = {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        };
        capturedDoc = mockDoc;
        Object.defineProperty(iframe, 'contentDocument', {
          get: () => mockDoc,
          configurable: true,
        });
        Object.defineProperty(iframe, 'contentWindow', {
          get: () => ({ print: printMock }),
          configurable: true,
        });
      }
      return node;
    });

    const result = await pdfExporter.export(
      el,
      makeOptions({ format: 'pdf', filename: 'x.pdf', allowSensitiveData: true })
    );

    expect(result.success).toBe(true);
    expect(result.filename).toBe('x.pdf');
    expect(printMock).toHaveBeenCalledTimes(1);
    expect(capturedDoc?.write).toHaveBeenCalledTimes(1);

    appendChildSpy.mockRestore();
  });

  it('returns error when pdf iframe fails to create', async () => {
    const el = document.createElement('div');

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLIFrameElement || (node as HTMLElement).tagName === 'IFRAME') {
        const iframe = node as HTMLIFrameElement;
        Object.defineProperty(iframe, 'contentDocument', {
          get: () => null,
          configurable: true,
        });
      }
      return node;
    });

    const result = await pdfExporter.export(
      el,
      makeOptions({ format: 'pdf', filename: 'fail.pdf', allowSensitiveData: true })
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to create print iframe');

    appendChildSpy.mockRestore();
  });
});
