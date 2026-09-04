'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { FiHome, FiMessageSquare, FiUpload, FiUsers, FiLogOut } from 'react-icons/fi'

type Props = { role: string; name: string }

export default function DashboardNav({ role, name }: Props) {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Overview', icon: FiHome, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { href: '/dashboard/feedback', label: 'Feedback Inbox', icon: FiMessageSquare, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { href: '/dashboard/feedback/import', label: 'Import CSV', icon: FiUpload, roles: ['ADMIN', 'ANALYST'] },
    { href: '/dashboard/members', label: 'Members', icon: FiUsers, roles: ['ADMIN'] },
  ].filter(l => l.roles.includes(role))

  return (
    <aside className='w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col justify-between py-6 px-3'>
      <div className='flex flex-col gap-1'>
        {/* Logo */}
        <Link href='/' className='text-white font-bold text-lg tracking-tight px-3 mb-4 block'>
          LO<span className='text-gold-500'>OP</span>
        </Link>

        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* User + sign out */}
      <div className='flex flex-col gap-2 px-1'>
        <div className='px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg'>
          <p className='text-white text-xs font-medium truncate'>{name}</p>
          <p className={`text-xs font-bold mt-0.5 ${
            role === 'ADMIN' ? 'text-gold-500' : role === 'ANALYST' ? 'text-blue-400' : 'text-gray-500'
          }`}>{role}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 text-sm rounded-lg hover:bg-red-400/5 transition-colors'
        >
          <FiLogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
