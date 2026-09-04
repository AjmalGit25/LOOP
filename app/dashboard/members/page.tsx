'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Member = { id: string; name: string; email: string; role: string }

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
  ANALYST: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  VIEWER: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
}

export default function MembersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return }
    if (status === 'authenticated' && session.user.role !== 'ADMIN') { router.replace('/dashboard'); return }
    if (status === 'authenticated') fetchMembers()
  }, [status])

  async function fetchMembers() {
    const res = await fetch('/api/workspace/members')
    const data = await res.json()
    setMembers(data.members ?? [])
    setLoading(false)
  }

  async function changeRole(userId: string, role: string) {
    await fetch('/api/workspace/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    fetchMembers()
  }

  async function removeMember(userId: string) {
    await fetch('/api/workspace/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    fetchMembers()
  }

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <p className='text-gray-500 text-sm'>Loading members...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black p-6'>
      <div className='max-w-2xl mx-auto flex flex-col gap-4'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-white font-semibold text-lg'>Workspace Members</h1>
            <p className='text-gray-500 text-xs mt-0.5'>{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-xs text-gray-400 hover:text-white transition-colors'
          >
            ← Back
          </button>
        </div>

        {/* Members list */}
        <div className='flex flex-col gap-2'>
          {members.map((m) => (
            <div key={m.id} className='bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3'>

              {/* Avatar */}
              <div className='w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold shrink-0'>
                {m.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className='flex-1 min-w-0'>
                <p className='text-white text-sm font-medium truncate'>{m.name}</p>
                <p className='text-gray-500 text-xs truncate'>{m.email}</p>
              </div>

              {/* Role badge + change */}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[m.role]}`}>
                {m.role}
              </span>

              {/* Actions — hidden for self */}
              {m.id !== session?.user.id && (
                <div className='flex items-center gap-2 shrink-0'>
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                    className='bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-gold-500'
                  >
                    {['ADMIN', 'ANALYST', 'VIEWER'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeMember(m.id)}
                    className='text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 border border-red-400/20 rounded-lg hover:bg-red-400/10'
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
