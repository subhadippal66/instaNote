import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import db from '@/lib/supabase/db'
import { ThemeProvider } from '@/lib/providers/next-theme-provider'
import {DM_Sans} from 'next/font/google'
import { twMerge } from 'tailwind-merge'
import { Toaster } from '@/components/ui/toaster'
import { StateProvider } from '@/redux/StateProvider'
import { SocketProvider } from '@/lib/providers/socket-provider'

const inter = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InstaNote',
  description: 'Most productive note taking app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // console.log(db)
  return (
    <html lang="en">
      <body className={twMerge('bg-background', inter.className)}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          <Toaster />
          <StateProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </StateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
