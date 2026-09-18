'use client'

import Link from 'next/link'

const roleCards = [
  {
    title: 'Admin',
    emoji: '👑',
    accent: 'from-gold-300 to-gold-600',
    summary: 'Manages the workspace and access control.',
    bullets: [
      'Add or remove users',
      'Change roles and permissions',
      'Control workspace-level access',
    ],
  },
  {
    title: 'Analyst',
    emoji: '📊',
    accent: 'from-amber-300 to-yellow-500',
    summary: 'Works with the data to uncover patterns and opportunities.',
    bullets: [
      'Analyze customer feedback',
      'Use AI classification and theme detection',
      'Generate insights, trends, and reports',
    ],
  },
  {
    title: 'Viewer',
    emoji: '👤',
    accent: 'from-slate-300 to-slate-500',
    summary: 'Consumes insights without managing the workspace itself.',
    bullets: [
      'View dashboards and reports',
      'Review feedback summaries',
      'Monitor customer sentiment and themes',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <div className='relative min-h-screen overflow-hidden bg-[#09090b] text-white'>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl' />
        <div className='absolute right-0 top-28 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl' />
      </div>

      <div className='relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8'>
        <header className='mb-8 flex items-center justify-between'>
          <Link href='/' className='text-white font-bold tracking-tight'>
            LO<span className='text-gold-500'>OP</span>
          </Link>
          <Link
            href='/'
            className='rounded-full border border-gray-700 bg-gray-950/60 px-4 py-2 text-sm text-gray-200 hover:border-gray-500'
          >
            Back home
          </Link>
        </header>

        <main className='flex-1'>
          <section className='mx-auto max-w-3xl text-center'>
            <span className='inline-flex rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-500'>
              How LOOP works
            </span>

            <h1 className='mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl'>
              One workspace. Three roles. One shared mission.
            </h1>

            <p className='mt-4 text-sm leading-relaxed text-gray-400 sm:text-base'>
              Every person in a LOOP workspace belongs to the same company account, but they do not all have the same permissions.
              The platform keeps workspaces isolated and applies role-based access control before any sensitive data is shown.
            </p>
          </section>

          <section className='mt-10 grid gap-5 md:grid-cols-3'>
            {roleCards.map((role) => (
              <article
                key={role.title}
                className='rounded-2xl border border-gray-800 bg-gray-950/70 p-6 shadow-[0_0_30px_rgba(212,175,55,0.06)] backdrop-blur-sm'
              >
                <div className={`mb-4 inline-flex rounded-full bg-gradient-to-r ${role.accent} px-3 py-2 text-xl shadow-lg`}>
                  {role.emoji}
                </div>
                <h2 className='text-2xl font-semibold text-white'>{role.title}</h2>
                <p className='mt-2 text-sm text-gray-400'>{role.summary}</p>

                <ul className='mt-5 space-y-3 text-sm text-gray-300'>
                  {role.bullets.map((item) => (
                    <li key={item} className='flex items-start gap-2'>
                      <span className='mt-1 h-2 w-2 rounded-full bg-gold-500' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className='mt-12 rounded-2xl border border-gray-800 bg-gray-950/60 p-6 sm:p-8'>
            <h2 className='text-xl font-semibold text-white sm:text-2xl'>The important rule: workspace scoping</h2>

            <div className='mt-5 space-y-4 text-sm leading-relaxed text-gray-300 sm:text-base'>
              <p>
                A user can only access the data connected to their own workspace. Even if someone is an Analyst in one workspace,
                they should never see another workspace’s feedback, themes, or reports.
              </p>

              <div className='rounded-xl border border-gray-800 bg-[#111111] p-4 font-mono text-[11px] text-gold-300 sm:text-xs'>
                authenticatedUser.workspaceId → Prisma query → WHERE workspaceId = authenticatedUser.workspaceId
              </div>

              <p>
                In practice, LOOP combines three layers: authentication, workspace isolation, and role-based permissions.
                That means the system first answers <span className='text-white'>who you are</span>, then <span className='text-white'>which workspace you belong to</span>,
                and then <span className='text-white'>what you are allowed to do</span>.
              </p>
            </div>
          </section>

          <section className='mt-10 flex flex-col items-center gap-3 text-center'>
            <h3 className='text-lg font-semibold text-white'>Ready to see LOOP in action?</h3>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Link
                href='/signup'
                className='rounded-full bg-linear-to-r from-gold-300 to-gold-600 px-6 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgba(212,175,55,0.25)]'
              >
                Create your workspace
              </Link>
              <Link
                href='/login'
                className='rounded-full border border-gray-700 bg-gray-950/60 px-6 py-3 text-sm text-gray-200 hover:border-gray-500'
              >
                Sign in
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
