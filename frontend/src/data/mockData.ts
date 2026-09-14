import type {
  Comparison,
  Conflict,
  MergePlan,
  MergePlanItem,
  MergePlanRequest,
  MergeResult,
  Project,
  Strategy,
  Variant,
} from '../types'

/**
 * Local mirror of the Spring Boot mock data. The API client falls back to this
 * when the backend is not running, so a demo never dead-ends on a fetch error.
 */

export const demoProject: Project = {
  id: 'causekind',
  name: 'CauseKind',
  repository: 'causekind/causekind-web',
  description: 'Donation platform for grassroots causes and community fundraisers.',
  language: 'TypeScript · React',
  baseBranch: 'main',
  branchA: {
    name: 'ganpati-theme',
    label: 'Branch A',
    author: 'aarav.m',
    commits: 7,
    lastCommit: 'feat(nav): animate ganpati logo on scroll',
    updatedAt: '2 hours ago',
    accent: 'amber',
  },
  branchB: {
    name: 'navbar-feature',
    label: 'Branch B',
    author: 'priya.s',
    commits: 5,
    lastCommit: 'feat(nav): profile menu + notification tray',
    updatedAt: '40 minutes ago',
    accent: 'violet',
  },
  updatedAt: 'Updated 40 minutes ago',
}

export const analysisSteps = [
  'Analyzing branches...',
  'Comparing changes...',
  'Detecting conflicts...',
  'Preparing previews...',
]

const navbarConflict: Conflict = {
  id: 'conflict-navbar',
  title: 'Navbar',
  component: 'navbar',
  type: 'UI Conflict',
  severity: 'HIGH',
  status: 'UNRESOLVED',
  description: 'Both branches modified this component.',
  filePath: 'src/components/Navbar.tsx',
  branchAChanges: [
    'Animated festival navbar',
    'Ganpati logo treatment',
    'Mobile navigation',
    'Navbar styling',
  ],
  branchBChanges: ['Notification menu', 'Profile menu', 'Navbar spacing'],
  analysis: {
    summary:
      'Branch A restyles the navigation shell for the Ganpati festival release. Branch B adds two account-level menus to the same header. The two sets of changes touch different regions of the component.',
    branchA: [
      'Animated festival navbar',
      'Ganpati logo treatment',
      'Mobile navigation',
      'Navbar styling',
    ],
    branchB: ['Notification menu', 'Profile menu', 'Navbar spacing'],
    recommendation: 'These changes appear partially compatible and can likely be combined.',
    compatibility: 'PARTIALLY_COMPATIBLE',
    confidence: 92,
  },
  codeDiff: {
    filePath: 'src/components/Navbar.tsx',
    language: 'tsx',
    branchA: `export function Navbar() {
  return (
    <header className="ck-nav ck-nav--festival">
      <GanpatiMark animated />
      <nav className="ck-nav__links">
        <a href="/">Home</a>
        <a href="/causes">Causes</a>
        <a href="/donate">Donate</a>
        <a href="/about">About</a>
      </nav>
      <DonateButton variant="festival" />
      <MobileMenuToggle />
    </header>
  );
}`,
    branchB: `export function Navbar({ user }: NavbarProps) {
  return (
    <header className="ck-nav ck-nav--wide">
      <Logo />
      <nav className="ck-nav__links ck-nav__links--spaced">
        <a href="/">Home</a>
        <a href="/causes">Causes</a>
        <a href="/donate">Donate</a>
        <a href="/about">About</a>
      </nav>
      <NotificationMenu count={3} />
      <ProfileMenu user={user} />
    </header>
  );
}`,
    conflictMarkers: `<<<<<<< HEAD (ganpati-theme)
  <header className="ck-nav ck-nav--festival">
    <GanpatiMark animated />
    <DonateButton variant="festival" />
    <MobileMenuToggle />
=======
  <header className="ck-nav ck-nav--wide">
    <Logo />
    <NotificationMenu count={3} />
    <ProfileMenu user={user} />
>>>>>>> navbar-feature`,
  },
  defaultInstruction:
    'Keep the animated Ganpati navbar from Branch A, but keep the notification and profile menus from Branch B.',
}

const heroConflict: Conflict = {
  id: 'conflict-hero',
  title: 'Hero Section',
  component: 'hero',
  type: 'UI Conflict',
  severity: 'MEDIUM',
  status: 'UNRESOLVED',
  description: 'Both branches modified this component.',
  filePath: 'src/components/Hero.tsx',
  branchAChanges: ['Festival campaign banner', 'Diya accent background', 'Festival headline copy'],
  branchBChanges: ['Live donation counter', 'Two-column layout', 'Secondary CTA'],
  analysis: {
    summary:
      'Branch A swaps the hero for a seasonal festival campaign. Branch B restructures the same hero into a two-column layout with a live donation counter. The headline copy is the only region both branches rewrite.',
    branchA: ['Festival campaign banner', 'Diya accent background', 'Festival headline copy'],
    branchB: ['Live donation counter', 'Two-column layout', 'Secondary CTA'],
    recommendation: 'These changes appear partially compatible and can likely be combined.',
    compatibility: 'PARTIALLY_COMPATIBLE',
    confidence: 87,
  },
  codeDiff: {
    filePath: 'src/components/Hero.tsx',
    language: 'tsx',
    branchA: `export function Hero() {
  return (
    <section className="ck-hero ck-hero--festival">
      <DiyaBackdrop />
      <h1>Celebrate by giving back this Ganesh Chaturthi</h1>
      <DonateButton size="lg" variant="festival" />
    </section>
  );
}`,
    branchB: `export function Hero() {
  return (
    <section className="ck-hero ck-hero--split">
      <div>
        <h1>Fund the causes your community cares about</h1>
        <DonateButton size="lg" />
        <SecondaryCta href="/causes">Browse causes</SecondaryCta>
      </div>
      <LiveDonationCounter />
    </section>
  );
}`,
    conflictMarkers: `<<<<<<< HEAD (ganpati-theme)
  <section className="ck-hero ck-hero--festival">
    <DiyaBackdrop />
    <h1>Celebrate by giving back this Ganesh Chaturthi</h1>
=======
  <section className="ck-hero ck-hero--split">
    <h1>Fund the causes your community cares about</h1>
    <LiveDonationCounter />
>>>>>>> navbar-feature`,
  },
  defaultInstruction:
    'Keep the festival hero styling from Branch A, but keep the live donation counter from Branch B.',
}

export const demoConflicts: Conflict[] = [navbarConflict, heroConflict]

export function buildComparison(): Comparison {
  return {
    id: `cmp_local_${Date.now()}`,
    projectId: demoProject.id,
    baseBranch: demoProject.baseBranch,
    branchA: demoProject.branchA.name,
    branchB: demoProject.branchB.name,
    createdAt: new Date().toISOString(),
    conflictCount: demoConflicts.length,
    conflicts: demoConflicts,
    compatible: [
      {
        id: 'compatible-footer',
        title: 'Footer',
        component: 'footer',
        status: 'COMPATIBLE',
        description: 'No conflict detected. Changes apply cleanly on top of main.',
        filePath: 'src/components/Footer.tsx',
      },
    ],
    analysisSteps,
    filesChanged: 14,
    additions: 486,
    deletions: 132,
  }
}

function variantFor(strategy: Strategy): Variant {
  if (strategy === 'BRANCH_A') return 'BRANCH_A'
  if (strategy === 'BRANCH_B') return 'BRANCH_B'
  return 'MERGED'
}

function itemsFor(conflict: Conflict, strategy: Strategy): MergePlanItem[] {
  const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const build = (
    features: string[],
    source: MergePlanItem['source'],
    sourceBranch: string,
    note: string,
  ) =>
    features.map((feature) => ({
      id: `${conflict.id}-${slug(feature)}`,
      component: conflict.title,
      feature,
      source,
      sourceBranch,
      note,
    }))

  if (strategy === 'COMBINE') {
    return [
      ...build(conflict.branchAChanges, 'Branch A', 'ganpati-theme', 'Kept from Branch A'),
      ...build(conflict.branchBChanges, 'Branch B', 'navbar-feature', 'Kept from Branch B'),
    ]
  }
  if (strategy === 'BRANCH_B') {
    return [
      ...build(conflict.branchBChanges, 'Branch B', 'navbar-feature', 'Kept from Branch B'),
      ...build(conflict.branchAChanges, 'Dropped', 'ganpati-theme', 'Discarded — Branch B selected'),
    ]
  }
  return [
    ...build(conflict.branchAChanges, 'Branch A', 'ganpati-theme', 'Kept from Branch A'),
    ...build(conflict.branchBChanges, 'Dropped', 'navbar-feature', 'Discarded — Branch A selected'),
  ]
}

export function buildMergePlan(request: MergePlanRequest): MergePlan {
  const byConflict = new Map<string, Strategy>()
  demoConflicts.forEach((conflict) => byConflict.set(conflict.id, request.strategy ?? 'COMBINE'))
  request.resolutions?.forEach((resolution) => {
    if (byConflict.has(resolution.conflictId)) {
      byConflict.set(resolution.conflictId, resolution.strategy)
    }
  })

  const items = demoConflicts.flatMap((conflict) =>
    itemsFor(conflict, byConflict.get(conflict.id) ?? 'COMBINE'),
  )
  const combined = [...byConflict.values()].filter((s) => s === 'COMBINE').length
  const navbarStrategy = byConflict.get('conflict-navbar') ?? 'COMBINE'

  return {
    id: `plan_local_${Date.now()}`,
    comparisonId: request.comparisonId,
    projectId: demoProject.id,
    strategy: navbarStrategy,
    strategyLabel:
      navbarStrategy === 'BRANCH_A'
        ? 'Use Branch A'
        : navbarStrategy === 'BRANCH_B'
          ? 'Use Branch B'
          : 'Combine with AI',
    instruction: request.instruction,
    conflictIds: [...byConflict.keys()],
    conflictsResolved: byConflict.size,
    summary:
      combined === byConflict.size
        ? 'Both components were composed from the two branches. Festival styling stays from Branch A, account menus stay from Branch B.'
        : combined === 0
          ? 'Every conflict was resolved by taking a single branch wholesale.'
          : `${combined} of ${byConflict.size} conflicts were composed from both branches, the rest take a single branch.`,
    items,
    notes: [
      'No changes were made outside the two conflicting components.',
      ...(combined > 0
        ? ['Navbar spacing from Branch B was widened to fit the Ganpati logo treatment.']
        : []),
      'Footer changes from both branches applied cleanly and needed no decision.',
    ],
    preview: {
      navbar: variantFor(byConflict.get('conflict-navbar') ?? 'COMBINE'),
      hero: variantFor(byConflict.get('conflict-hero') ?? 'COMBINE'),
      footer: 'MERGED',
    },
    createdAt: new Date().toISOString(),
  }
}

export function buildMergeResult(plan: MergePlan): MergeResult {
  return {
    id: `merge_local_${Date.now()}`,
    planId: plan.id,
    projectId: plan.projectId,
    status: 'READY',
    plan,
    preview: plan.preview,
    verification: {
      steps: [
        { id: 'build', label: 'Building application...', durationMs: 900 },
        { id: 'navbar', label: 'Checking navbar...', durationMs: 700 },
        { id: 'notifications', label: 'Checking notification menu...', durationMs: 650 },
        { id: 'profile', label: 'Checking profile menu...', durationMs: 650 },
        { id: 'responsive', label: 'Checking responsive layout...', durationMs: 800 },
        { id: 'regression', label: 'Visual regression check...', durationMs: 950 },
      ],
      checks: [
        { id: 'build', label: 'Build passed', status: 'PASSED' },
        { id: 'ui', label: 'UI verified', status: 'PASSED' },
        { id: 'interactions', label: 'Interactions verified', status: 'PASSED' },
        { id: 'responsive', label: 'Responsive layout verified', status: 'PASSED' },
      ],
      verdict: 'Merge candidate looks good.',
    },
    mergeRequest: {
      id: 'mr_142',
      number: 142,
      title: `Merge ${demoProject.branchA.name} into ${demoProject.baseBranch}`,
      description: `Resolved with VisualMerge.\n\n${plan.summary}\n\nInstruction: "${plan.instruction}"`,
      sourceBranch: demoProject.branchA.name,
      targetBranch: demoProject.baseBranch,
      url: `https://github.com/${demoProject.repository}/pull/142`,
      state: 'OPEN',
      filesChanged: 4,
      additions: 186,
      deletions: 74,
      commits: [
        {
          hash: '8f2a1c4',
          message: 'merge: compose navbar from ganpati-theme and navbar-feature',
          author: 'visualmerge[bot]',
          time: 'just now',
        },
        {
          hash: '3e91b07',
          message: 'merge: compose hero section from both branches',
          author: 'visualmerge[bot]',
          time: 'just now',
        },
        {
          hash: 'c40d55a',
          message: 'chore: apply footer changes from both branches',
          author: 'visualmerge[bot]',
          time: 'just now',
        },
      ],
      files: [
        { path: 'src/components/Navbar.tsx', status: 'modified', additions: 94, deletions: 41 },
        { path: 'src/components/Hero.tsx', status: 'modified', additions: 61, deletions: 28 },
        { path: 'src/components/Footer.tsx', status: 'modified', additions: 18, deletions: 5 },
        { path: 'src/styles/festival.css', status: 'added', additions: 13, deletions: 0 },
      ],
    },
    createdAt: new Date().toISOString(),
  }
}
