import '@/app/styles/globals.css'
import type { Metadata } from 'next'
import { Oswald } from 'next/font/google'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from "./components/providers/session-provider"
import { NotificationBell } from './components/admin-button'
import { initializeDataFiles } from '@/lib/init-data'
import { applicationConfig } from '@/lib/config'

const oswald = Oswald({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
})

export const metadata: Metadata = {
  title: applicationConfig.website.metaTitle,
  description: applicationConfig.website.metaDescription,
}

// Initialize data files on server startup
if (typeof window === 'undefined') {
  initializeDataFiles()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${oswald.variable}`}>
      <body className={`${oswald.className} bg-black antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
            <div className="min-h-screen relative selection:bg-teal-500/30 selection:text-teal-200">
              {/* Content Layer */}
              <div className="relative z-10">
                {children}
              </div>

              {/* Global notification bell: fixed top-right on every page */}
              <div className="fixed top-8 right-8 z-[100]">
                <NotificationBell />
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
