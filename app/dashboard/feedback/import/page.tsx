'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type ImportResult = {
  imported: number
  skipped: number
  invalid: { row: number; issues: string[] }[]
}

export default function ImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return }
    if (status === 'authenticated') {
      const role = session.user.role
      if (role !== 'ADMIN' && role !== 'ANALYST') router.replace('/dashboard')
    }
  }, [status])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.csv')) setFile(dropped)
    else setError('Only .csv files are accepted')
  }

  async function handleUpload() {
    if (!file) return
    setError('')
    setResult(null)
    setUploading(true)

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/feedback/import', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)

    if (!res.ok) {
      setError(data.error ?? 'Import failed')
      return
    }

    setResult(data)
    setFile(null)
  }

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <p className='text-gray-500 text-sm'>Loading...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black p-6'>
      <div className='max-w-2xl mx-auto flex flex-col gap-6'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-white font-semibold text-lg'>Import Feedback</h1>
            <p className='text-gray-500 text-xs mt-0.5'>Upload a CSV to bulk-import feedback</p>
          </div>
          <button onClick={() => router.push('/dashboard/feedback')} className='text-xs text-gray-400 hover:text-white transition-colors'>
            ← Back
          </button>
        </div>

        {/* CSV format hint */}
        <div className='bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1'>
          <p className='text-gray-400 text-xs font-bold uppercase tracking-wider mb-1'>Expected CSV format</p>
          <code className='text-green-400 text-xs'>content,channel,sourceRef,customerLabel</code>
          <code className='text-gray-500 text-xs'>"Dashboard is slow",web,ref-001,user-42</code>
          <p className='text-gray-600 text-xs mt-1'>sourceRef and customerLabel are optional.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
            ${dragging ? 'border-gold-500 bg-gold-500/5' : 'border-gray-700 hover:border-gray-500'}`}
        >
          <input
            ref={inputRef}
            type='file'
            accept='.csv'
            className='hidden'
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) { setFile(f); setError('') }
            }}
          />
          {file ? (
            <p className='text-white text-sm font-medium'>{file.name}</p>
          ) : (
            <>
              <p className='text-gray-400 text-sm'>Drag & drop a CSV here</p>
              <p className='text-gray-600 text-xs'>or click to browse</p>
            </>
          )}
        </div>

        {error && <p className='text-red-400 text-xs'>{error}</p>}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className='bg-linear-to-r from-gold-300 to-gold-600 text-black font-bold py-2 rounded-full text-sm hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50 cursor-pointer'
        >
          {uploading ? 'Importing...' : 'Import CSV'}
        </button>

        {/* Result */}
        {result && (
          <div className='bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3'>
            <div className='flex gap-4'>
              <div className='flex flex-col'>
                <span className='text-green-400 text-2xl font-bold'>{result.imported}</span>
                <span className='text-gray-500 text-xs'>imported</span>
              </div>
              <div className='flex flex-col'>
                <span className='text-red-400 text-2xl font-bold'>{result.skipped}</span>
                <span className='text-gray-500 text-xs'>skipped</span>
              </div>
            </div>

            {result.invalid.length > 0 && (
              <div className='flex flex-col gap-1'>
                <p className='text-gray-400 text-xs font-bold uppercase tracking-wider'>Invalid rows</p>
                {result.invalid.map((r) => (
                  <div key={r.row} className='text-xs text-red-400 bg-red-400/5 border border-red-400/10 rounded-lg px-3 py-2'>
                    Row {r.row}: {r.issues.join(', ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
