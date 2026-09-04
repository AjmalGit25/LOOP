'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa6'

type Role = 'ADMIN' | 'ANALYST' | 'VIEWER'

const ROLE_INFO: Record<Role, { color: string; desc: string }> = {
  ADMIN:   { color: 'text-gold-400 border-gold-400/30 bg-gold-400/5',   desc: 'Full access — manage members, roles, and all workspace data.' },
  ANALYST: { color: 'text-blue-400 border-blue-400/30 bg-blue-400/5',   desc: 'Ingest and manage feedback, run CSV imports, view all insights.' },
  VIEWER:  { color: 'text-gray-400 border-gray-400/30 bg-gray-400/5',   desc: 'Read-only access to feedback, reports, and themes.' },
}

const STEPS = [
  { n: '01', label: 'Create your account' },
  { n: '02', label: 'Your workspace is auto-created' },
  { n: '03', label: 'Invite your team' },
  { n: '04', label: 'Start ingesting feedback' },
]

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' as Role })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Something went wrong')
      return
    }

    window.location.href = '/login'
  }

  const selectedRole = ROLE_INFO[form.role]

  return (
    <div className='flex flex-1 min-h-[calc(100vh-57px)]'>

      {/* Left panel */}
      <div className='hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 border-r border-gray-800 p-12'>
        <div className='flex flex-col gap-10'>
          <div className='flex flex-col gap-4'>
            <span className='text-xs font-semibold text-gold-500 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full w-fit uppercase tracking-widest'>
              Get started free
            </span>
            <h2 className='text-white text-3xl font-bold leading-snug'>
              One workspace.<br />
              <span className='bg-linear-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent'>
                Infinite clarity.
              </span>
            </h2>
            <p className='text-gray-400 text-sm leading-relaxed max-w-sm'>
              Your workspace is created automatically. Invite your team, assign roles,
              and start turning raw feedback into actionable product decisions.
            </p>
          </div>

          {/* Onboarding steps */}
          <div className='flex flex-col gap-3'>
            {STEPS.map((s, i) => (
              <div key={s.n} className='flex items-center gap-3'>
                <span className={`text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-gold-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                  {s.n}
                </span>
                <span className={`text-sm ${i === 0 ? 'text-white font-medium' : 'text-gray-500'}`}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Role cards */}
          <div className='flex flex-col gap-2'>
            <p className='text-gray-600 text-xs uppercase tracking-wider font-medium'>Workspace roles</p>
            {(Object.entries(ROLE_INFO) as [Role, typeof ROLE_INFO[Role]][]).map(([role, info]) => (
              <div key={role} className={`border rounded-lg px-3 py-2 flex items-start gap-2 ${info.color}`}>
                <span className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded border ${info.color}`}>{role}</span>
                <p className='text-gray-400 text-xs leading-relaxed'>{info.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className='flex flex-1 flex-col items-center justify-center px-6 py-12'>
        <div className='w-full max-w-sm flex flex-col gap-6'>

          {/* Header */}
          <div className='flex flex-col gap-1'>
            <h1 className='text-white font-bold text-2xl'>Create your account</h1>
            <p className='text-gray-500 text-sm'>Your workspace is created automatically</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Jane Smith' },
              { label: 'Work Email', name: 'email', type: 'email', placeholder: 'jane@company.com' },
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

            {/* Role selector */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-white text-xs font-bold'>Role</label>
              <select
                name='role'
                value={form.role}
                onChange={handleChange}
                className='bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gold-500 transition-colors'
              >
                {(Object.keys(ROLE_INFO) as Role[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {/* Live role description */}
              <p className={`text-xs px-2 py-1.5 rounded-lg border ${selectedRole.color}`}>
                {selectedRole.desc}
              </p>
            </div>

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
              <span>{loading ? 'Creating...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className='flex items-center gap-3'>
            <span className='flex-1 border-t border-gray-800' />
            <span className='text-gray-600 text-xs'>Already have an account?</span>
            <span className='flex-1 border-t border-gray-800' />
          </div>

          <Link
            href='/login'
            className='text-center text-sm border border-gray-700 text-gray-300 py-2.5 rounded-full hover:border-gray-500 hover:text-white transition-colors'
          >
            Sign in instead
          </Link>

          <p className='text-center text-gray-600 text-xs'>
            By creating an account you agree to our{' '}
            <span className='text-gray-500 hover:text-white cursor-pointer transition-colors'>Terms</span>
            {' '}and{' '}
            <span className='text-gray-500 hover:text-white cursor-pointer transition-colors'>Privacy Policy</span>
          </p>
        </div>
      </div>

    </div>
  )
}
