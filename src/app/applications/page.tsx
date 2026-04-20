'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, User, LogOut, Shield, Zap, Sparkles, ChevronRight, Clock, Users } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import Image from 'next/image'
import AdminButton from '../components/admin-button'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export default function ApplicationsPortal() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [appTypes, setAppTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/admin/application-types')
      if (response.ok) {
        const list = await response.json()
        setAppTypes(list || [])
      }
    } catch {
      console.error('Failed to fetch application types')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* Floating Header Card */}
      <div className="relative z-50 pt-10 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="glass rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <Image
                  src={applicationConfig.website.serverLogo}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="rounded-lg group-hover:scale-110 transition-transform duration-500"
                  priority
                  suppressHydrationWarning
                />
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-tight text-white">
                  {applicationConfig.website.serverName}
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400 font-black opacity-80">
                  Limitless Stories. Evolving Energy.
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="hidden md:block">
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400 uppercase tracking-[0.2em] px-3 py-1 bg-blue-500/5">
                SOLACE
              </Badge>
            </div>
            <nav className="flex flex-wrap justify-center gap-2">
              {[
                { name: 'Dashboard', href: '/' },
                { name: 'Applications', href: '/applications' },
                { name: 'Support', href: '/support' },
                { name: 'Rules', href: '/rules' },
              ].map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/applications' ? 'text-white border-white/10 bg-white/5' : ''}`}>
                    {item.name}
                  </Button>
                </Link>
              ))}
              <AdminButton />
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-4 rounded-lg border border-white/5 hover:bg-white/5">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={session.user?.image || undefined} />
                        <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">{session.user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-white/10 rounded-xl min-w-[200px]">
                    <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                      <Link href="/my-application" className="flex items-center gap-2 p-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Profile Protocol</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onSelect={() => signOut()} className="focus:bg-red-500/10 cursor-pointer p-2">
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Terminate Session</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => signIn('discord')} className="rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20">
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center md:text-left"
        >
          <div className="flex flex-col">
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              Registry Protocols
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase text-white mb-8">
              Available <br />
              <span className="text-gradient-primary">Applications</span>
            </h1>
          </div>
        </motion.div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 h-[300px] rounded-3xl animate-pulse" />
            ))
          ) : (
            appTypes.map((type, i) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="group"
              >
                <div className="bg-white/[0.03] border border-white/5 p-10 md:p-12 rounded-[32px] h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:border-white/10">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">{type.name}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">
                      {type.description || "Establish your identity within the community infrastructure."}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <Link href={`/apply?type=${type.id}`}>
                      <Button className="px-10 h-12 rounded-full bg-gradient-to-b from-white to-slate-300 text-black font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
            <div className="flex items-center gap-4">
              <Image src={applicationConfig.website.serverLogo} alt="Logo" width={50} height={50} className="rounded-lg grayscale opacity-50" />
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-tighter">{applicationConfig.website.serverName}</span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500">The Ultimate Choice</span>
              </div>
            </div>
            <div className="flex gap-8">
              <Link href="/terms" className="text-xs uppercase tracking-widest font-black text-slate-500 hover:text-blue-400 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs uppercase tracking-widest font-black text-slate-500 hover:text-blue-400 transition-colors">Privacy</Link>
              <Link href="/support" className="text-xs uppercase tracking-widest font-black text-slate-500 hover:text-blue-400 transition-colors">Support</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-black">
              &copy; {mounted ? new Date().getFullYear() : '2026'} {applicationConfig.website.serverName}. All rights reserved.
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-800 font-black">Crafted for Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
