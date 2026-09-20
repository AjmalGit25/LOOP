import Link from 'next/link'
import GlowingBackground from './components/GlowingBackground';
import Navbar from './components/Navbar';


export default function NotFound() {
  return (
    <main className='min-h-screen text-white bg-[#09090b] flex items-center justify-center p-6'>
      {/* ------ Glowing Background Color ------- */}
      <GlowingBackground />

      <Navbar/>

      <div className='max-w-md w-full rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center'>
        <p className='text-gold-400 text-xs uppercase tracking-[0.2em]'>404</p>
        <h1 className='mt-4 text-2xl font-semibold'>Page not found</h1>
        <p className='mt-3 text-sm text-gray-400'>The page you’re looking for does not exist or may have been moved.</p>
        <Link
          href='/dashboard'
          className='mt-6 inline-flex items-center justify-center rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm text-gold-300 hover:border-gold-500 transition-colors'
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
