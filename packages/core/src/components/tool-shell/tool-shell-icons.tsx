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
      <path d="M12.93 9A5 5 0 0 0 13 8a5 5 0 0 0-.07-1l1.7-1a.5.5 0 0 0 .11-.86l-1.45-1.45a.5.5 0 0 0-.86.11l-1 1.7A5 5 0 0 0 9 3.07V1.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v1.57a5 5 0 0 0-1.57.91l-1-1.7a.5.5 0 0 0-.86-.11L.07 4.64a.5.5 0 0 0 .11.86l1.7 1A5 5 0 0 0 3 8a5 5 0 0 0 .07 1l-1.7 1a.5.5 0 0 0-.11.86l1.45 1.45a.5.5 0 0 0 .86-.11l1-1.7A5 5 0 0 0 7 12.93V14.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1.57a5 5 0 0 0 1.57-.91l1 1.7a.5.5 0 0 0 .86.11l1.45-1.45a.5.5 0 0 0-.11-.86l-1.7-1z" />
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
