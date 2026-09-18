'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { FiCheckCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  title: string
  message?: string
  type: ToastType
  duration: number
  closing: boolean
}

type ShowToastInput = {
  title: string
  message?: string
  type?: ToastType
  duration?: number
}

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider')
  }

  return context
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => {
      if (current.some((toast) => toast.id === id && toast.closing)) {
        return current
      }

      return current.map((toast) =>
        toast.id === id ? { ...toast, closing: true } : toast,
      )
    })

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 220)
  }, [])

  const showToast = useCallback(({ title, message, type = 'info', duration = 3200 }: ShowToastInput) => {
    const id = Date.now() + Math.random()

    setToasts((current) => [
      ...current,
      {
        id,
        title,
        message,
        type,
        duration,
        closing: false,
      },
    ])

    window.setTimeout(() => dismissToast(id), duration)
  }, [dismissToast])

  const value = useMemo<ToastContextValue>(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className='pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3'>
        {toasts.map((toast) => {
          const Icon = toast.type === 'success'
            ? FiCheckCircle
            : toast.type === 'error'
              ? FiXCircle
              : FiInfo

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto toast-item ${toast.closing ? 'toast-exit' : 'toast-enter'} toast-${toast.type}`}
            >
              <div className='toast-icon-wrap'>
                <Icon size={18} />
              </div>

              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold leading-5'>{toast.title}</p>
                {toast.message && <p className='mt-1 text-xs leading-4 opacity-90'>{toast.message}</p>}
              </div>

              <button
                type='button'
                aria-label='Dismiss notification'
                onClick={() => dismissToast(toast.id)}
                className='rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white'
              >
                <FiX size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
