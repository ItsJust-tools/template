# itsjust Template — AI Assistant Guide

## Project Overview

Single-purpose web tool template built with Next.js App Router. Each tool does ONE thing well — no bloat, no signups.

**Live example:** [itsjust.tools](https://itsjust.tools)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn-style components
- **State:** `useToolState` hook (custom, with undo/redo)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Vercel (zero config)

## Monorepo Structure

```text
template/
├── src/                      # App source code
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Tool page (Server Component)
│   │   ├── tool-client.tsx   # Client component (main logic)
│   ├── tool/                 # Tool-specific code (CUSTOMIZE THIS)
│   │   ├── tool.config.ts    # Tool metadata & features
│   │   ├── tool-definition.ts # Tool contract (state, serialize, deserialize)
│   │   ├── template-metadata.ts # Locale, URL, PWA metadata
│   │   ├── types.ts          # Tool-specific types
│   │   ├── components/       # Canvas, Toolbar, Sidebar
│   │   └── exporters/        # Lazy-loaded exporters (png, pdf, ...)
│   └── lib/                  # Utilities (seo.ts, utils.ts)
├── packages/core/            # @itsjust/core (shared)
│   ├── src/
│   │   ├── types/            # ToolConfig, ExportFormat, ShareData, etc.
│   │   ├── components/       # ToolShell, ThemeProvider, ToastProvider
│   │   ├── hooks/            # useToolState, useExport, useImport, useShare
│   │   ├── engines/          # ExportEngine, StorageManager
│   │   └── testing/          # renderTool(), createMockToolState()
│   └── __tests__/            # Core unit tests
├── __tests__/                # App-level tests
│   ├── unit/                 # Tool-specific unit tests
│   └── e2e/                  # Playwright E2E tests
└── scripts/                  # Preflight, bundle-size checks
```

## Creating a New Tool

1. Edit `src/tool/tool.config.ts` — set id, name, export formats
2. Replace `src/tool/tool-definition.ts` — state shape, serialize, deserialize
3. Edit `src/tool/template-metadata.ts` — locale, URL defaults
4. Replace `src/tool/components/` — canvas, toolbar, sidebar
5. Wire up `src/app/tool-client.tsx` and `src/app/page.tsx`
6. Replace `public/og.svg` — Open Graph image
7. Run `node scripts/preflight.mjs` to validate

## Canonical Import/Export/Share Contracts

This section is the **single source of truth** for all data contracts. All code and docs must match this.

### `.itsjust.json` Share Format

```json
{
  "$schema": "itsjust-tool",
  "toolId": "simple-notepad",
  "version": "1.0",
  "content": { "text": "...", "fontSize": 16 },
  "createdAt": "2026-04-22T12:00:00Z",
  "metadata": { "schemaVersion": "1.0" }
}
```

| Field       | Type     | Required | Description                    |
| ----------- | -------- | -------- | ------------------------------ |
| `$schema`   | `string` | Yes      | Always `"itsjust-tool"`        |
| `toolId`    | `string` | Yes      | Matches `toolConfig.id`        |
| `version`   | `string` | Yes      | Schema version                 |
| `content`   | `object` | Yes      | Passed to `tool.deserialize()` |
| `createdAt` | `string` | Yes      | ISO 8601 timestamp             |
| `metadata`  | `object` | No       | Optional extra metadata        |

### Import/Export Verträge

**`ImportResult` (Discriminated Union):**

```ts
type ImportResult =
  | { success: true; data: unknown; isItsJustFile: boolean }
  | { success: false; error: string; isItsJustFile: boolean };
```

**`DeserializeResult<T>` (Discriminated Union):**

```ts
type DeserializeResult<T> = { success: true; data: T } | { success: false; error: string };
```

**`ExportResult`:**

```ts
type ExportResult = {
  success: boolean;
  data: Blob | string | null;
  filename: string;
  format: ExportFormat;
  error?: string;
};
```

### Export Formats

| Format | Requires canvas | Lazy-loaded | File                         |
| ------ | --------------- | ----------- | ---------------------------- |
| `json` | No              | No          | Built into `@itsjust/core`   |
| `png`  | Yes             | Yes         | `src/tool/exporters/png.ts`  |
| `jpeg` | Yes             | Yes         | `src/tool/exporters/jpeg.ts` |
| `webp` | Yes             | Yes         | `src/tool/exporters/webp.ts` |
| `pdf`  | Yes             | Yes         | `src/tool/exporters/pdf.ts`  |

Register exporters in `src/tool/tool-definition.ts`:

```ts
exporters: [
  { format: 'png', loader: () => import('./exporters/png') },
  { format: 'pdf', loader: () => import('./exporters/pdf') },
],
```

## Key Patterns

### Import/Export System (100% Client-Side)

Alles läuft im Browser — kein Server, keine API-Calls:

```tsx
const { exportTo, supportedFormats, isExporting } = useExport(canvasRef, toolConfig, serialize);
const { importFromFile } = useImport({
  acceptedFormats: ['json'],
  maxFileSize: 5 * 1024 * 1024, // optional, default: 5MB
  onImport: (result) => {
    if (result.success) {
      // result.data enthält den Inhalt
      // result.isItsJustFile zeigt .itsjust.json Dateien an
    }
  },
});

// Export
exportTo('png'); // oder jpeg, webp, pdf, json

// Import via File Input
<input
  type="file"
  accept=".itsjust.json,.json"
  onChange={(e) => importFromFile(e.target.files[0])}
/>;

// Import via Drag & Drop (selber machen)
```

**Unterstützte Formate:**

- `.itsjust.json` — Share-Format (wird automatisch erkannt)
- `.json` — JSON Export/Import
- `.png`, `.jpeg`, `.webp` — Bild-Export (`html-to-image`, lazy-loaded)
- `.pdf` — PDF-Export (`@media print` iframe, lazy-loaded)

### ToolShell

```tsx
<ToolShell
  config={toolConfig}
  actions={toolbarActions}
  toolbar={<ToolToolbar state={state} />}
  sidebar={<ToolSidebar />}
  canvas={<ToolCanvas />}
  statusBar={<span>Status</span>}
/>
```

### useToolState Hook

Provides undo/redo, auto-save, dirty state:

```tsx
const state = useToolState<NotepadState>(initialState, {
  key: 'my-tool',
  maxHistory: 50,
  autoSaveDelay: 1000,
});

state.setData((prev) => ({ ...prev, text: 'new' }));
state.undo();
state.redo();
state.saveNow();
```

### Export System

Client-side export via `useExport`:

```tsx
const { exportTo, supportedFormats, isExporting } = useExport(canvasRef, toolConfig, serialize);
exportTo('png'); // or jpeg, webp, pdf, json
```

### Share System (100% Client-Side)

Kein Server nötig — Files werden direkt im Browser erzeugt:

```tsx
const { downloadShareFile, shareViaWeb } = useShare();

// Download als .itsjust.json Datei
await downloadShareFile({
  toolId: 'my-tool',
  content: serialize(),
  metadata: { schemaVersion: '1.0' },
});

// Web Share API (System-Dialog)
await shareViaWeb({
  toolId: 'my-tool',
  content: serialize(),
  metadata: { schemaVersion: '1.0' },
});

// Share URL mit serialisiertem State
const shareUrl = `${window.location.origin}${window.location.pathname}?state=<encoded-state>`;
```

## Environment Variables

```bash
NEXT_PUBLIC_URL=https://your-tool.vercel.app
```

## Scripts

| Command                      | Description                 |
| ---------------------------- | --------------------------- |
| `npm run dev`                | Dev server (Turbopack)      |
| `npm run build`              | Build core + Next.js        |
| `npm test`                   | Vitest unit tests           |
| `npm run test:e2e`           | Playwright E2E              |
| `npm run test:e2e:dev`       | Playwright with UI          |
| `npm run lint`               | ESLint                      |
| `node scripts/preflight.mjs` | Validate template readiness |

## Important Conventions

- **No premature abstraction** — 3 similar lines > wrong abstraction
- **Client-side only** — no server-side processing for tool logic
- **Privacy-first** — user actions/data stay local in browser memory/storage unless explicitly requested by user
- **Zero signup** — tools work immediately, no auth required
- **Print-friendly** — CSS hides UI chrome when printing
- **Mobile-first** — toolbar icons only on mobile, full labels on desktop
- **Accessibility is mandatory** — all UI must preserve keyboard access, strong visible focus, semantic landmarks, and screen-reader support
- **Full-space canvas** — tool UI should use available viewport space; avoid fixed A4-like layout constraints

## Common Pitfalls

- Don't use `useEffect` for state updates — use `useCallback` with handlers
- Don't access `window` without `typeof window !== 'undefined'` check
- Don't commit `.env` files — use `.env.example` as template
- Don't add server dependencies to tool logic — keep it client-side
- Don't return `TState` directly from `deserialize` — always return `DeserializeResult<TState>`
- Don't forget to build `@itsjust/core` before building Next.js: `npm run build -w @itsjust/core`

## Testing

- Unit tests in `packages/core/__tests__/` and `__tests__/unit/`
- E2E tests in `__tests__/e2e/`
- Use `renderTool()` from `@itsjust/core/testing` for component tests
- For hook changes, cover success, failure, and edge-state transitions in separate test cases
- For E2E changes, avoid fixed sleeps and prefer role/selectors with explicit expectations
- Mock `console.error`/`console.warn` in tests that trigger expected errors to keep stderr clean

## Deployment

Push to GitHub → Connect to Vercel → Set env vars → Done.

No build config needed — `next.config.ts` handles everything.

For static export, uncomment `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts`.

## Agent Workflow Rules

- Non-negotiable philosophy guardrails:
  - One tool, one purpose. Do not broaden scope into multi-tool suites.
  - Privacy-first/client-only by default. Do not introduce server processing for user content unless explicitly requested.
  - Accessibility is mandatory. Do not trade away keyboard support, focus visibility, semantics, or readable contrast.
  - Keep UX simple. Do not add feature bloat, complex settings trees, or onboarding friction.
- Decision policy for AI agents:
  - Prefer the smallest change that solves the request.
  - Reuse existing patterns in `src/tool/` and `@itsjust/core`; avoid introducing parallel architectures.
  - If a request conflicts with philosophy, ask for confirmation before implementing the conflicting part.
  - When uncertain, choose maintainability and clarity over clever abstractions.
- Template baseline protection (hard rule):
  - Never silently "fix" or rewrite template defaults/content to hide template-level issues.
  - If a problem is caused by template baseline data/contracts, explicitly report it as a template bug.
  - State clearly that the upstream template must be updated, instead of masking the issue in downstream tool code.
- Always keep `CHANGELOG.md` up to date when behavior, API, UX, dependencies, or version changes.
- When asked to "commit and push", do the full flow automatically (`git add`, commit, push) without extra confirmation.
- Never add Co-Authored-By trailers or set yourself as a co-author in commits.
- Always verify version consistency before committing:
  - `package.json` version
  - `packages/core/package.json` version
  - `src/tool/tool.config.ts` version source/value
  - `CHANGELOG.md` release entries
- If version updates are part of the change, ensure all versioned files are aligned in the same commit.
