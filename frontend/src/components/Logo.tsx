/** The VisualMerge mark: two branch points converging on a single node. */
export function VisualMergeMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="vm-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7aa2ff" />
          <stop offset="100%" stopColor="#4566d8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#vm-mark)" />
      <circle cx="11" cy="9.5" r="2.3" fill="#fff" />
      <circle cx="11" cy="22.5" r="2.3" fill="#fff" />
      <circle cx="22" cy="16" r="2.3" fill="#fff" />
      <path
        d="M11 12v8M13.2 9.5c3 0 6.4 1.4 6.6 5.2M13.2 22.5c3 0 6.4-1.4 6.6-5.2"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
