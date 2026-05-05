export function UndoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h6a3.5 3.5 0 0 1 0 7H7.5" />
      <path d="M3 6l2.5-2.5M3 6l2.5 2.5" />
    </svg>
  );
}
UndoIcon.displayName = 'UndoIcon';

export function RedoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 6H7a3.5 3.5 0 0 0 0 7h1.5" />
      <path d="M13 6l-2.5-2.5M13 6l-2.5 2.5" />
    </svg>
  );
}
RedoIcon.displayName = 'RedoIcon';

export function ExportIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" />
      <path d="M8 2v8M5 7l3 3 3-3" />
    </svg>
  );
}
ExportIcon.displayName = 'ExportIcon';

export function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8l3.5 3.5L13 5" />
    </svg>
  );
}
CheckIcon.displayName = 'CheckIcon';

export function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" className="spinner-arc" />
    </svg>
  );
}
SpinnerIcon.displayName = 'SpinnerIcon';

export function SidebarIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="2" width="14" height="12" rx="1.5" />
      <line x1="5.5" y1="2" x2="5.5" y2="14" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="2" width="14" height="12" rx="1.5" />
      <line x1="5.5" y1="2" x2="5.5" y2="14" />
      <line x1="5.5" y1="2" x2="5.5" y2="14" strokeOpacity="0.3" strokeDasharray="2 2" />
    </svg>
  );
}
SidebarIcon.displayName = 'SidebarIcon';

export function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2.5M8 12v2.5M1.5 8h2.5M12 8h2.5M3.5 3.5l1.8 1.8M10.7 10.7l1.8 1.8M3.5 12.5l1.8-1.8M10.7 5.3l1.8-1.8" />
    </svg>
  );
}
SettingsIcon.displayName = 'SettingsIcon';

export function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
    </svg>
  );
}
SunIcon.displayName = 'SunIcon';

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 8.5A6 6 0 1 1 7.5 2a4.5 4.5 0 0 0 6.5 6.5z" />
    </svg>
  );
}
MoonIcon.displayName = 'MoonIcon';
