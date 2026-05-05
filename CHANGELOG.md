# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.3] - 2026-05-05

### Changed

- Expanded unit test coverage for exporters: CORS error formatting, abort signal handling, sensitive data blocking, DOM/style restoration on failure, background color inlining, textarea scroll expansion, special character handling, and PDF iframe content verification.

## [1.2.0] - 2026-05-05

### Fixed

- Image export now preserves the actual theme background color instead of forcing white. Uses computed styles from the live element.
- Image export now captures the full scrolled textarea content by expanding clone height to `scrollHeight`.
- Fixed `html-to-image` font embedding crash (`skipFonts: true`) that caused exports to fail silently in production.
- Fixed blank exports caused by off-screen manual clone collapsing due to missing layout context.

### Changed

- PDF export now attempts DOM-based rendering first and only falls back to raster image embedding when needed.
- PDF export now adds a searchable text layer derived from canvas DOM text so text content can be indexed/copied in successful exports.
- Expanded export test coverage for screenshot downloads (PNG, JPEG, WEBP), PDF download flow, large-canvas image dimensions, and long multiline PDF text handling.

### Added

- **Notepad Tool**: Built a complete single-purpose notepad tool (`simple-notepad`).
  - Clean textarea-based canvas with monospace font and adjustable font size (8–72px).
  - Toolbar with font-size controls (A− / A+) and help link.
  - Sidebar showing live document stats: words, characters, characters without spaces, and lines.
  - Full export support: JSON, PNG, JPEG, WebP, PDF (all client-side via lazy-loaded exporters).
  - URL-based sharing with compressed state and automatic hydration on load.
  - Undo/redo, auto-save, dark mode, and high-contrast accessibility support.
  - Updated tests: 92 passing across unit and component suites.

## [1.1.0] - 2026-04-28

### Changed

- Layout now uses the full available canvas area instead of an A4-like centered width, with responsive spacing for desktop and mobile.
- Documentation updated to reflect the full-space responsive canvas behavior in `README.md`, `GUIDE.md`, and `CLAUDE.md`.
- Privacy-first defaults tightened: removed server-sharing env token guidance, added telemetry-disable default in `.env.example`, and added lint guards that block network calls in tool logic files.
- Added high-contrast accessibility support (manual toggle + system contrast preference handling) and improved status announcements with `aria-live`.
- Accessibility guidance now explicitly states that accessibility is mandatory across `README.md`, `GUIDE.md`, and `CLAUDE.md`.
- Import/Export now includes URL-based sharing with compressed state in query params and automatic state hydration when opening a shared link.
- AI/agent documentation was tightened with mandatory guardrails to enforce single-purpose scope, privacy-first defaults, and accessibility requirements.
- Reset now requires a confirmation dialog before clearing state, and reset actions remain undoable via the existing undo history.
- Added a dedicated `/help` page with inline-rendered SVG usage graphics, practical workflow examples, and direct sidebar navigation.
- Added a visible toolbar button to open the full keyboard shortcuts overlay so all shortcuts are always discoverable (in addition to `?`).
- Redesigned the help page layout and content for better usability, and moved help access from the sidebar into a visible header toolbar button.
- Tightened AI contribution rules to require explicit reporting of template-level bugs instead of silently mutating template baseline data/contracts.
- Updated shortcuts overlay trigger to require Ctrl/Cmd + ? instead of plain ?, preventing accidental popup while typing.

## [1.0.0] - 2026-04-24

### Added

- **Testing**: Comprehensive test suite with 48 tests across all core hooks and components.
  - `useExport` tests with race condition and error handling coverage.
  - `useShare` tests for download, web share, and clipboard.
  - `useStorage` tests with corrupted data handling.
  - `useTool` integration tests with ToastProvider wrapper.
  - `ThemeProvider` tests with `matchMedia` mock.
  - `ImportExport` component tests for dropdown and file input.
  - `ExportEngine` tests for Blob URL cleanup.
- **E2E**: Playwright now runs on Chromium, Firefox, WebKit, and mobile viewports (Pixel 5, iPhone 12).
- **CI/CD**: Security headers enabled in `next.config.ts` (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- **Accessibility**:
  - Focus trap in `KeyboardShortcutsOverlay`.
  - ARIA live region for toasts (`aria-live="polite"`).
  - Sidebar resize handle with `aria-valuenow/min/max` and keyboard control (ArrowLeft/Right).
  - Canvas marked with `role="application"` and `aria-label`.
- **Keyboard Navigation**: Export dropdown supports Home, End, PageUp, PageDown, and typeahead search.
- **Error Resilience**: `html2canvas` lazy-load failures handled with retry mechanism (3 attempts with exponential backoff).
- **Display Names**: All components and icon components have explicit `displayName` for React DevTools.

### Changed

- **API Breaking**: `Tool.deserialize` now returns `DeserializeResult<TState>` instead of `TState` directly.
  - Callers must check `result.success` before using `result.data`.
- **API Breaking**: `useImport` no longer uses generic `T`. Returns `ImportResult` with `data: unknown`.
  - Type safety enforced via `tool.deserialize` validation.
- **API Breaking**: `handleExport` now returns `Promise<{ success: boolean; error?: string }>`.
  - Callers can react to export failures.
- **File Size Display**: Dynamic units (B, KB, MB) instead of always showing MB with `toFixed(0)`.

### Fixed

- **Memory Leak**: `triggerDownload` now revokes Blob URLs for string exports too.
- **Race Condition**: `useExport.isExporting` uses a ref for atomic check before concurrent exports.
- **Export Format Mismatch**: `tool.config.ts` lists all registered formats.
- **Keyboard Shortcuts**: `useKeyboardShortcuts` deps fixed — listens to entire `actions` object.
- **Sidebar Callback Churn**: `toggleSidebar` uses `useRef` for current value instead of closure.
- **Focus Restoration**: `KeyboardShortcutsOverlay` checks `document.body.contains(prev)` before restoring focus.
- **Sidebar Resize**: Ref anti-pattern replaced with direct save in `mouseup` handler.

### Removed

- **Deprecated API**: `registerExporterLoader` and `registerToolExporters` removed.
- **Dead Component**: `tool-shell-export-dropdown.tsx` removed (unused, `ImportExport` component is used instead).
- **Duplicate `formatLabels`**: Centralized in `packages/core/src/types/export.ts`.
