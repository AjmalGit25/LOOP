import Link from 'next/link'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Ingest at scale',
    desc: 'Import feedback from support tickets, app-store reviews, surveys, and sales notes via CSV or API.',
  },
  {
    icon: '🧠',
    title: 'AI classification',
    desc: 'Claude-powered sentiment analysis and theme clustering — no manual tagging required.',
  },
  {
    icon: '📊',
    title: 'Trend dashboard',
    desc: 'Spot what is rising, falling, or exploding across channels before it becomes a crisis.',
  },
  {
    icon: '💬',
    title: 'Plain-English Q&A',
    desc: 'Ask "What do customers complain about most?" and get a direct answer backed by real data.',
  },
  {
    icon: '🔐',
    title: 'Multi-tenant RBAC',
    desc: 'Workspaces with Admin, Analyst, and Viewer roles. Every query is scoped — no data leaks.',
  },
  {
    icon: '🔗',
    title: 'Clean API layer',
    desc: 'Every feature is backed by a typed REST API. Integrate with your existing toolchain.',
  },
]

const COMPARISONS = ['Enterpret', 'Dovetail', 'Productboard Insights']

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>

      {/* Hero */}
      <section className='flex flex-col items-center justify-center text-center px-6 py-28 gap-6'>
        <span className='text-xs font-semibold text-gold-500 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full uppercase tracking-widest'>
          AI Customer-Feedback Intelligence
        </span>

        <h1 className='text-4xl sm:text-6xl font-bold leading-tight max-w-3xl'>
          Turn customer noise into{' '}
          <span className='bg-linear-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent'>
            product clarity
          </span>
        </h1>

        <p className='text-gray-400 text-lg max-w-xl leading-relaxed'>
          LOOP ingests your support tickets, reviews, and surveys — then uses AI to classify, cluster,
          and surface exactly what your customers are telling you.
        </p>

        <div className='flex items-center gap-3 mt-2'>
          <Link
            href='/signup'
            className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all duration-100 text-sm'
          >
            Start for free
          </Link>
          <Link
            href='/login'
            className='text-gray-400 hover:text-white text-sm border border-gray-700 px-6 py-3 rounded-full hover:border-gray-500 transition-colors'
          >
            Sign in
          </Link>
        </div>

        <p className='text-gray-600 text-xs mt-2'>
          Comparable in spirit to{' '}
          {COMPARISONS.map((c, i) => (
            <span key={c}>
              <span className='text-gray-500'>{c}</span>
              {i < COMPARISONS.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </section>

      {/* Divider */}
      <div className='w-full border-t border-gray-800' />

      {/* Flow diagram */}
      <section className='flex flex-col items-center px-6 py-16 gap-6'>
        <h2 className='text-white font-semibold text-xl'>How it works</h2>
        <div className='flex flex-wrap items-center justify-center gap-2 text-sm'>
          {[
            'Customer feedback',
            'LOOP ingests',
            'PostgreSQL',
            'AI analysis',
            'Sentiment · Themes · Insights',
          ].map((step, i, arr) => (
            <div key={step} className='flex items-center gap-2'>
              <span className='bg-gray-900 border border-gray-800 text-gray-300 px-3 py-1.5 rounded-lg'>
                {step}
              </span>
              {i < arr.length - 1 && <span className='text-gray-600'>→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className='px-6 py-16 max-w-5xl mx-auto w-full'>
        <h2 className='text-white font-semibold text-xl text-center mb-10'>Everything you need</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {FEATURES.map((f) => (
            <div key={f.title} className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-2 hover:border-gray-700 transition-colors'>
              <span className='text-2xl'>{f.icon}</span>
              <h3 className='text-white font-semibold text-sm'>{f.title}</h3>
              <p className='text-gray-500 text-xs leading-relaxed'>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RBAC callout */}
      <section className='px-6 py-16 max-w-5xl mx-auto w-full'>
        <div className='bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-6'>
          <h2 className='text-white font-semibold text-xl'>Built for teams</h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[
              { role: 'ADMIN', color: 'text-gold-400 border-gold-400/20 bg-gold-400/5', perms: ['Manage members & roles', 'Full workspace access', 'Import & delete feedback'] },
              { role: 'ANALYST', color: 'text-blue-400 border-blue-400/20 bg-blue-400/5', perms: ['Ingest & manage feedback', 'CSV bulk import', 'View all insights'] },
              { role: 'VIEWER', color: 'text-gray-400 border-gray-400/20 bg-gray-400/5', perms: ['Read-only access', 'View feedback list', 'View reports & themes'] },
            ].map(({ role, color, perms }) => (
              <div key={role} className={`border rounded-xl p-4 flex flex-col gap-3 ${color}`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border w-fit ${color}`}>{role}</span>
                <ul className='flex flex-col gap-1'>
                  {perms.map(p => (
                    <li key={p} className='text-gray-400 text-xs flex items-center gap-1.5'>
                      <span className='text-green-500'>✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='flex flex-col items-center text-center px-6 py-20 gap-5'>
        <h2 className='text-white font-bold text-3xl max-w-lg'>
          Ready to understand your customers?
        </h2>
        <p className='text-gray-500 text-sm max-w-sm'>
          Set up your workspace in minutes. No credit card required.
        </p>
        <Link
          href='/signup'
          className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-8 py-3 rounded-full hover:-translate-y-0.5 transition-all duration-100 text-sm'
        >
          Create your workspace
        </Link>
      </section>

      {/* Footer */}
      <footer className='border-t border-gray-800 px-6 py-6 flex items-center justify-between mt-auto'>
        <span className='text-white font-bold text-sm tracking-tight'>
          LO<span className='text-gold-500'>OP</span>
        </span>
        <p className='text-gray-600 text-xs'>© 2025 LOOP · AI Customer-Feedback Intelligence Platform</p>
      </footer>

    </div>
  )
}
