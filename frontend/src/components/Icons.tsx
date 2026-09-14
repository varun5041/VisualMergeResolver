import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const GitBranchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="6" cy="6" r="2.4" />
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="8" r="2.4" />
    <path d="M6 8.4v7.2" />
    <path d="M18 10.4c0 3.4-3 4.6-6 5.2" />
  </Icon>
)

export const GitMergeIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="7" cy="6" r="2.3" />
    <circle cx="7" cy="18" r="2.3" />
    <circle cx="17" cy="12" r="2.3" />
    <path d="M7 8.3v7.4" />
    <path d="M9.3 6c2.6 0 5.4 1.6 5.6 5.6" />
  </Icon>
)

export const GitPullRequestIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="7" cy="6" r="2.3" />
    <circle cx="7" cy="18" r="2.3" />
    <circle cx="17" cy="18" r="2.3" />
    <path d="M7 8.3v7.4" />
    <path d="M17 15.7V9.5A2.5 2.5 0 0 0 14.5 7H12" />
    <path d="m13.6 5 -1.8 2 1.8 2" />
  </Icon>
)

export const SparkIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3.5 13.7 9 19 10.7 13.7 12.4 12 18l-1.7-5.6L5 10.7 10.3 9z" />
    <path d="M18.5 16.2 19.2 18l1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </Icon>
)

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.6 4.4 4.4L19 7" />
  </Icon>
)

export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5 21 19.5H3z" />
    <path d="M12 10.2v3.6" />
    <path d="M12 16.6h.01" />
  </Icon>
)

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 12h14" />
    <path d="m13 6.5 5.5 5.5L13 17.5" />
  </Icon>
)

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19.5 12h-14" />
    <path d="M11 6.5 5.5 12 11 17.5" />
  </Icon>
)

export const CodeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m8.5 8.5-4 3.5 4 3.5" />
    <path d="m15.5 8.5 4 3.5-4 3.5" />
    <path d="m13.4 5.5-2.8 13" />
  </Icon>
)

export const DesktopIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4.5" width="18" height="12" rx="1.8" />
    <path d="M9 20h6" />
    <path d="M12 16.5V20" />
  </Icon>
)

export const MobileIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="7.5" y="3" width="9" height="18" rx="2.2" />
    <path d="M11 18h2" />
  </Icon>
)

export const RefreshIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.8 4.6v4.2h-4.2" />
  </Icon>
)

export const LockIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
  </Icon>
)

export const FileIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13.5 3.5H7.2A1.7 1.7 0 0 0 5.5 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V8.5z" />
    <path d="M13.5 3.5v5h5" />
  </Icon>
)

export const LayersIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 3.5 8.5 4.3L12 12 3.5 7.8z" />
    <path d="m3.5 12.4 8.5 4.3 8.5-4.3" />
    <path d="m3.5 16.6 8.5 4.3 8.5-4.3" />
  </Icon>
)

export const ShieldCheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3.2 19 6v6c0 4-3 7.2-7 8.8-4-1.6-7-4.8-7-8.8V6z" />
    <path d="m9 12 2.2 2.2L15.4 10" />
  </Icon>
)

export const BellIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 18h15z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </Icon>
)

export const HeartIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.6 12 20 12 20z" />
  </Icon>
)

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </Icon>
)

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6.5 6.5l11 11" />
    <path d="M17.5 6.5l-11 11" />
  </Icon>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
  </Icon>
)

export const ExternalLinkIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 5h5v5" />
    <path d="m19 5-7.5 7.5" />
    <path d="M18 14.5v3.8A1.7 1.7 0 0 1 16.3 20H5.7A1.7 1.7 0 0 1 4 18.3V7.7A1.7 1.7 0 0 1 5.7 6h3.8" />
  </Icon>
)

export const UsersIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.8 19.5a5.4 5.4 0 0 1 10.4 0" />
    <path d="M16 6.2a3 3 0 0 1 0 5.9" />
    <path d="M17.4 14.6a5.4 5.4 0 0 1 3 4.9" />
  </Icon>
)

export const ClockIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.3" />
    <path d="M12 7.4V12l3 1.8" />
  </Icon>
)
