import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Providers from './providers'
import Navbar from './components/Navbar'
import ToastProvider from './components/ToastProvider'
import './globals.css'
import './components/toast.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LOOP — AI Customer-Feedback Intelligence Platform',
  description: 'Ingest, classify, and surface customer feedback insights powered by AI.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className='min-h-full flex flex-col bg-black text-white'>
        <Providers>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
