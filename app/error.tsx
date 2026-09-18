'use client'

import Link from 'next/link'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className='min-h-screen bg-black text-white flex items-center justify-center p-6'>
      <div className='max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center'>
        <p className='text-red-400 text-xs uppercase tracking-[0.2em]'>Something went wrong</p>
        <h1 className='mt-4 text-2xl font-semibold'>Unable to load this page</h1>
        <p className='mt-3 text-sm text-gray-400'>An unexpected error occurred. Please try again or go back to the dashboard.</p>
        <div className='mt-6 flex justify-center gap-3'>
          <button
            onClick={() => reset()}
            className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:border-red-500/50 transition-colors'
          >
            Try again
          </button>
          <Link
            href='/dashboard'
            className='rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-200 hover:border-gray-500 transition-colors'
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
