'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { FaArrowRight } from 'react-icons/fa6'

const TESTIMONIALS = [
  { quote: 'LOOP cut our feedback review time from days to minutes.', author: 'Head of Product, SaaS Co.' },
  { quote: 'Finally, a tool that tells us what customers actually want.', author: 'VP Engineering, Fintech' },
  { quote: 'The AI clustering is scary accurate.', author: 'Customer Success Lead' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quote] = useState(() => TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password')
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className='flex flex-1 min-h-[calc(100vh-57px)]'>

      {/* Left panel */}
      <div className='hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 border-r border-gray-800 p-12'>
        <div className='flex flex-col gap-10'>
          {/* Product pitch */}
          <div className='flex flex-col gap-4'>
            <span className='text-xs font-semibold text-gold-500 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full w-fit uppercase tracking-widest'>
              AI-Powered
            </span>
            <h2 className='text-white text-3xl font-bold leading-snug'>
              Your customers are talking.<br />
              <span className='bg-linear-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent'>
                Are you listening?
              </span>
            </h2>
            <p className='text-gray-400 text-sm leading-relaxed max-w-sm'>
              LOOP ingests support tickets, reviews, and surveys — then uses AI to surface exactly
              what your customers are telling you, before it becomes a crisis.
            </p>
          </div>

          {/* Feature list */}
          <ul className='flex flex-col gap-3'>
            {[
              '🧠 AI sentiment & theme classification',
              '📊 Real-time trend dashboard',
              '🔐 Multi-tenant workspaces with RBAC',
              '⚡ CSV bulk import for analysts',
              '💬 Plain-English Q&A over your data',
            ].map(f => (
              <li key={f} className='text-gray-400 text-sm flex items-center gap-2'>
                <span className='text-green-500 text-xs'>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-2'>
          <p className='text-gray-300 text-sm italic'>"{quote.quote}"</p>
          <p className='text-gray-600 text-xs'>— {quote.author}</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className='flex flex-1 flex-col items-center justify-center px-6 py-12'>
        <div className='w-full max-w-sm flex flex-col gap-6'>

          {/* Header */}
          <div className='flex flex-col gap-1'>
            <h1 className='text-white font-bold text-2xl'>Welcome back</h1>
            <p className='text-gray-500 text-sm'>Sign in to your LOOP workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            {[
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@company.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} className='flex flex-col gap-1.5'>
                <label className='text-white text-xs font-bold'>{label}</label>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  className='bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors'
                />
              </div>
            ))}

            {error && (
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>
                <p className='text-red-400 text-xs'>{error}</p>
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='mt-1 bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold py-2.5 rounded-full cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50'
            >
              <FaArrowRight size={16} />
              <span>{loading ? 'Signing in...' : 'Continue'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className='flex items-center gap-3'>
            <span className='flex-1 border-t border-gray-800' />
            <span className='text-gray-600 text-xs'>New to LOOP?</span>
            <span className='flex-1 border-t border-gray-800' />
          </div>

          <Link
            href='/signup'
            className='text-center text-sm border border-gray-700 text-gray-300 py-2.5 rounded-full hover:border-gray-500 hover:text-white transition-colors'
          >
            Create an account
          </Link>

          <p className='text-center text-gray-600 text-xs'>
            By signing in you agree to our{' '}
            <span className='text-gray-500 hover:text-white cursor-pointer transition-colors'>Terms</span>
            {' '}and{' '}
            <span className='text-gray-500 hover:text-white cursor-pointer transition-colors'>Privacy Policy</span>
          </p>
        </div>
      </div>

    </div>
  )
}
