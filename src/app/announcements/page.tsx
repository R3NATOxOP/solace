'use client'

import { useState, useEffect } from 'react'
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
import { FileText, User, LogOut, Bell, Calendar, AlertTriangle, Star, Zap, Sparkles, Shield, ShoppingBag } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import AdminButton from '../components/admin-button'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { motion } from 'framer-motion'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: string
  createdAt: string
  updatedAt?: string
  createdBy: string
}

export default function Announcements() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements')
        if (response.ok) {
          const data = await response.json()
          setAnnouncements(data)
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  if (!mounted || loading) return <LoadingPage text="Loading announcements..." />

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      {/* Background Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Floating Header Card */}
      <div className="relative z-50 pt-10 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="glass rounded-lg p-6 flex flex-col md:flex-row items-center justify-between border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-4 group">
              <Image
                src={applicationConfig.website.serverLogo}
                alt="Logo"
                width={60}
                height={60}
                className="rounded-lg group-hover:scale-110 transition-transform duration-500"
                priority
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-tight">
                  {applicationConfig.website.serverName}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-black opacity-80">
                  Limitless Stories. Evolving Energy.
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="hidden md:block">
              <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-400 uppercase tracking-[0.2em] px-3 py-1 bg-teal-500/5">
                Operational Bulletins
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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/announcements' ? 'text-white border-white/10' : ''}`}>
                    {item.name}
                  </Button>
                </Link>
              ))}
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
                  <DropdownMenuContent className="bg-slate-900 border-white/10">
                    <DropdownMenuItem asChild><Link href="/my-application">Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut()}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => signIn('discord')} className="rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20">
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
          className="mb-20"
        >
          <div className="flex flex-col">
            <span className="text-teal-400 text-xs font-black uppercase tracking-[0.4em] mb-4">
              Intelligence Broadcast
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-white mb-8">
              Latest <br />
              <span className="text-gradient-primary">Directives</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Stay updated with critical server intelligence, tactical updates, and operational bulletins.
            </p>
          </div>
        </motion.div>

        <div className="space-y-12">
          {announcements.length === 0 ? (
            <div className="glass-card hud-border p-20 text-center rounded-lg">
              <Bell className="w-16 h-16 text-teal-500/30 mx-auto mb-6" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No active broadcasts detected</p>
            </div>
          ) : (
            announcements.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="glass-card hud-border p-8 md:p-12 rounded-lg group hover:bg-white/5 transition-all duration-500 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-16 h-16 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform flex-shrink-0">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[8px] font-black uppercase tracking-widest">
                            {a.priority} Priority
                          </Badge>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-500">
                          <User className="w-3 h-3" />
                          {a.createdBy}
                        </div>
                      </div>
                      <h2 className="text-3xl font-black tracking-tighter uppercase text-white group-hover:text-teal-400 transition-colors leading-tight">
                        {a.title}
                      </h2>
                      <p className="text-slate-400 font-medium leading-relaxed text-lg">
                        {a.content}
                      </p>
                    </div>
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
              <Link href="/terms" className="text-xs uppercase tracking-widest font-black text-slate-500 hover:text-teal-400 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs uppercase tracking-widest font-black text-slate-500 hover:text-teal-400 transition-colors">Privacy</Link>
              <Link href="/support" className="text-xs uppercase tracking-widest font-black text-slate-500 hover:text-teal-400 transition-colors">Support</Link>
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
