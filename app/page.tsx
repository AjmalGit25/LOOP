'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react';
import Counter from "./components/Counter";

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

const STATS = [
  { value: '130+', label: 'Feedback records analysed' },
  { value: '8', label: 'Auto-detected categories' },
  { value: '3', label: 'Role tiers (RBAC)' },
  { value: '<1 min', label: 'Workspace setup time' },
]

const TESTIMONIALS = [
  {
    quote: 'LOOP replaced three spreadsheets and a weekly meeting. We now know what customers want before they churn.',
    name: 'Sarah K.',
    title: 'Head of Product, SaaS startup',
  },
  {
    quote: 'The sentiment clustering is scary accurate. It surfaced a billing bug we had no idea was causing frustration.',
    name: 'Marcus T.',
    title: 'CX Lead, E-commerce brand',
  },
  {
    quote: 'Finally a tool that gives our analysts real power without handing them the keys to the whole database.',
    name: 'Priya M.',
    title: 'Data Analyst, FinTech scale-up',
  },
]

const FAQS = [
  {
    q: 'How does LOOP classify feedback?',
    a: 'LOOP uses AI-powered sentiment analysis to score each piece of feedback as positive, neutral, or negative, then clusters it into themes like performance, pricing, UX, and more — automatically.',
  },
  {
    q: 'Can I import existing feedback?',
    a: 'Yes. ANALYST and ADMIN roles can bulk-import feedback via CSV upload. The importer validates each row and skips malformed entries with a clear error report.',
  },
  {
    q: 'How does the role system work?',
    a: 'Every workspace has three roles: ADMIN (full control), ANALYST (ingest + manage feedback), and VIEWER (read-only). Roles are enforced at the API level — not just the UI.',
  },
  {
    q: 'Is my data isolated from other workspaces?',
    a: 'Completely. Every database query is scoped to your workspaceId. There is no way for one workspace to read or write another\'s data.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. Create your workspace and start ingesting feedback immediately. No credit card, no trial timer.',
  },
]

const COMPARISONS = ['Enterpret', 'Dovetail', 'Productboard Insights']

export default function LandingPage() {
  const { data: session, status } = useSession()
  const loggedIn = status !== 'loading' && !!session

  return (
    <>
      <style jsx>{`
        .gold-ambient {
          position: absolute;
          filter: blur(80px);
          border-radius: 9999px;
          opacity: 0.7;
          animation: floatGlow 12s ease-in-out infinite alternate;
        }

        .gold-ambient.one {
          width: 26rem;
          height: 26rem;
          left: -4rem;
          top: 4rem;
          background: rgba(245, 197, 62, 0.28);
          animation-delay: 0s;
        }

        .gold-ambient.two {
          width: 30rem;
          height: 30rem;
          right: -6rem;
          top: 8rem;
          background: rgba(212, 175, 55, 0.18);
          animation-delay: 2s;
        }

        .gold-ambient.three {
          width: 22rem;
          height: 22rem;
          left: 30%;
          bottom: 8rem;
          background: rgba(251, 191, 36, 0.14);
          animation-delay: 5s;
        }

        @keyframes floatGlow {
          0% {
            transform: translate3d(0, 0, 0) scale(0.96);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(3rem, -2rem, 0) scale(1.08);
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-2rem, 2rem, 0) scale(1.02);
            opacity: 0.58;
          }
        }
      `}</style>

      <div className='relative min-h-screen overflow-hidden bg-[#09090b] text-white'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='gold-ambient one' />
          <div className='gold-ambient two' />
          <div className='gold-ambient three' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,197,62,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.14),_transparent_34%)]' />
        </div>

        <div className='relative z-10 flex min-h-screen flex-col'>

          {/* Hero */}
          <section className='flex flex-col items-center justify-center text-center gap-5 px-4 py-10 sm:py-15'>
            <span className='text-[10px] sm:text-xs font-semibold text-gold-500 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full uppercase tracking-[0.18em]'>
              AI Customer-Feedback Intelligence
            </span>

            <h1 className='text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] max-w-4xl tracking-[-0.04em]'>
              Turn customer noise into{' '}
              <span className='bg-linear-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent'>
                product clarity
              </span>
            </h1>

            <p className='text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed'>
              LOOP ingests your support tickets, reviews, and surveys — then uses AI to classify, cluster,
              and surface exactly what your customers are telling you.
            </p>

            <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mt-1'>
              {loggedIn ? (
                <>
                  <Link
                    href='/dashboard'
                    className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all duration-100 text-sm shadow-[0_0_30px_rgba(212,175,55,0.25)]'
                  >
                    Go to Dashboard →
                  </Link>
                  <Link
                    href='/how-it-works'
                    className='text-gray-300 hover:text-white text-sm border border-gray-700 px-6 py-3 rounded-full hover:border-gray-500 transition-colors bg-gray-950/60'
                  >
                    How it works
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href='/signup'
                    className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all duration-100 text-sm shadow-[0_0_30px_rgba(212,175,55,0.25)]'
                  >
                    Start for free
                  </Link>
                  <Link
                    href='/how-it-works'
                    className='text-gray-300 hover:text-white text-sm border border-gray-700 px-6 py-3 rounded-full hover:border-gray-500 transition-colors bg-gray-950/60'
                  >
                    How it works
                  </Link>
                </>
              )}
            </div>

            <p className='text-gray-600 text-[11px] sm:text-xs mt-1'>
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

          {/* Stats bar */}
          <section className='px-4 sm:px-6 py-8 sm:py-10 max-w-5xl mx-auto w-full'>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-center'>
              {STATS.map(({ value, label }) => (
                <div key={label} className='flex flex-col gap-1 rounded-xl border border-gray-800 bg-gray-950/70 p-3 sm:p-4'>
                  <span className='text-2xl sm:text-3xl font-bold bg-linear-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent'>
                    {label === "Feedback records analysed" ? (<Counter end={parseInt(value.replace(/,/g, ''))} duration={2000} className='text-2xl sm:text-3xl font-bold' />) : (value)}
                  </span>
                  <span className='text-gray-500 text-[10px] sm:text-xs leading-relaxed'>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <div className='w-full border-t border-gray-800' />

          {/* How it works */}
          <section className='flex flex-col items-center px-4 sm:px-6 py-10 sm:py-12 gap-5'>
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
          <section className='px-4 sm:px-6 py-10 sm:py-12 max-w-5xl mx-auto w-full'>
            <h2 className='text-white font-semibold text-xl text-center mb-6 sm:mb-8'>Everything you need</h2>
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
          <section className='px-4 sm:px-6 py-10 sm:py-12 max-w-5xl mx-auto w-full'>
            <div className='bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6'>
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

          {/* Testimonials */}
          <section className='px-4 sm:px-6 py-10 sm:py-12 max-w-5xl mx-auto w-full'>
            <h2 className='text-white font-semibold text-xl text-center mb-6 sm:mb-8'>What teams are saying</h2>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {TESTIMONIALS.map(({ quote, name, title }) => (
                <div key={name} className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors'>
                  <span className='text-gold-500 text-2xl leading-none'>"</span>
                  <p className='text-gray-300 text-sm leading-relaxed flex-1'>{quote}</p>
                  <div>
                    <p className='text-white text-xs font-semibold'>{name}</p>
                    <p className='text-gray-500 text-xs'>{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className='px-4 sm:px-6 py-10 sm:py-12 max-w-3xl mx-auto w-full'>
            <h2 className='text-white font-semibold text-xl text-center mb-6 sm:mb-8'>Frequently asked questions</h2>
            <div className='flex flex-col gap-4'>
              {FAQS.map(({ q, a }) => (
                <div key={q} className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-2 hover:border-gray-700 transition-colors'>
                  <p className='text-white text-sm font-semibold'>{q}</p>
                  <p className='text-gray-500 text-xs leading-relaxed'>{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className='flex flex-col items-center text-center px-4 sm:px-6 py-14 sm:py-16 gap-4'>
            <h2 className='text-white font-bold text-2xl sm:text-3xl max-w-lg'>
              Ready to understand your customers?
            </h2>
            <p className='text-gray-500 text-sm max-w-sm'>
              Set up your workspace in minutes. No credit card required.
            </p>
            {loggedIn ? (
              <Link
                href='/dashboard'
                className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-8 py-3 rounded-full hover:-translate-y-0.5 transition-all duration-100 text-sm'
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link
                href='/signup'
                className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold px-8 py-3 rounded-full hover:-translate-y-0.5 transition-all duration-100 text-sm'
              >
                Create your workspace
              </Link>
            )}
          </section>

          {/* Footer */}
          <footer className='border-t border-gray-800 px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto'>
            <span className='text-white font-bold text-sm tracking-tight'>
              LO<span className='text-gold-500'>OP</span>
            </span>
            <p className='text-gray-600 text-[11px] sm:text-xs text-center'>© 2025 LOOP · AI Customer-Feedback Intelligence Platform</p>
          </footer>
        </div>
      </div>
    </>
  )
}
