'use client'

import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <main className='min-h-screen bg-black text-white flex items-center justify-center p-6'>
      <div className='max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center'>
        <p className='text-red-400 text-xs uppercase tracking-[0.2em]'>403</p>
        <h1 className='mt-4 text-2xl font-semibold'>Access denied</h1>
        <p className='mt-3 text-sm text-gray-400'>You do not have permission to perform this action.</p>
        <Link
          href='/dashboard'
          className='mt-6 inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-200 hover:border-gray-500 transition-colors'
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
