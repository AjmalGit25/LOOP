'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { FaArrowRight } from 'react-icons/fa6'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='w-full max-w-100 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden'>

        {/* Header */}
        <div className='p-5 flex flex-col justify-center gap-3'>
          <h1 className='text-white font-semibold text-center'>Welcome back</h1>
          <p className='text-gray-500 text-sm'>Sign in to Loop — AI Customer-Feedback Intelligence Platform</p>
          <span className='w-full border-b border-gray-800'></span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-3'>
          {[
            { label: 'Email *', name: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password *', name: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} className='flex flex-col gap-1'>
              <label className='text-white text-xs font-bold'>{label}</label>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                required
                className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors duration-300'
              />
            </div>
          ))}

          {error && <p className='text-red-400 text-xs'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='mt-2 bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold shadow-xl hover:shadow-gold-500/10 hover:-translate-y-0.5 transition-all duration-100 py-2 rounded-full cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50'
          >
            <FaArrowRight size={20} />
            <span>{loading ? 'Signing in...' : 'Continue'}</span>
          </button>

          <p className='text-center text-gray-400 text-xs'>
            No account yet?{' '}
            <a href='/signup' className='text-gold-500 font-medium hover:underline'>Sign Up & Apply</a>
          </p>
        </form>

      </div>
    </div>
  )
}
