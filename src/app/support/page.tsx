'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingPage } from '@/components/ui/loading-spinner'
import type { Ticket } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { ExternalLink, LogOut, FileText, Ticket as TicketIcon, MessageCircle, AlertCircle, Sparkles, Shield, Zap, ShoppingBag, ChevronRight, Send } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import AdminButton from '@/app/components/admin-button'
import { motion } from 'framer-motion'

export default function SupportPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tickets')
        if (res.ok) {
          const data = await res.json()
          const email = session?.user?.email
          setTickets(Array.isArray(data) ? data.filter((t: Ticket) => t.userEmail === email) : [])
        }
      } catch (err) {
        console.error('Failed to load tickets', err)
      } finally {
        setLoading(false)
      }
    }
    if (status !== 'loading' && mounted) {
      load()
    }
  }, [status, session?.user?.email, mounted])


  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white hover:bg-red-700'
      case 'high': return 'bg-orange-600 text-white hover:bg-orange-700'
      case 'normal': return 'bg-blue-600 text-white hover:bg-blue-700'
      case 'low': return 'bg-slate-600 text-white hover:bg-slate-700'
      default: return ''
    }
  }

  if (!mounted || loading || status === 'loading') return <LoadingPage text="Loading support..." />

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
              <Image
                src={applicationConfig.website.serverLogo}
                alt="Logo"
                width={60}
                height={60}
                className="rounded-lg group-hover:scale-110 transition-transform duration-500"
                priority
                suppressHydrationWarning
              />
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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/support' ? 'text-white border-white/10' : ''}`}>
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
                <Button onClick={() => signIn('discord')} className="rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20">
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 pt-32 pb-40">
        {status === 'unauthenticated' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
            <div className="glass p-12 text-center rounded-[32px] border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl">
              <AlertCircle className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-50" />
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Connection Required</h3>
              <p className="text-slate-400 mb-8 font-medium">You must establish a secure session via Discord to access support infrastructure.</p>
              <Button onClick={() => signIn('discord')} className="bg-blue-600 hover:bg-blue-500 px-10 py-6 h-auto text-lg uppercase font-black tracking-widest rounded-xl">Establish Connection</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[32px] border-white/5 p-8 md:p-12 shadow-2xl bg-[#0a0a0a]/80 backdrop-blur-3xl"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-blue-400 mb-2">
                  Support Tickets
                </h1>
                <p className="text-slate-400 font-medium tracking-tight">
                  Track and manage your open requests with our staff.
                </p>
              </div>
              <Link href="/support/new">
                <Button variant="outline" className="rounded-xl border-white/10 bg-transparent hover:bg-white/5 text-white px-6 py-2 h-auto text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                  <span className="text-lg leading-none">+</span> New Ticket
                </Button>
              </Link>
            </div>

            {/* Tickets List Section */}
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-20 text-center opacity-40">
                  <TicketIcon className="w-16 h-16 mx-auto mb-6 text-slate-600" />
                  <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-slate-500">No transmissions found</p>
                </div>
              ) : (
                tickets.map((t, i) => (
                  <div key={t.id} className="bg-[#121212] border border-white/5 rounded-[20px] p-5 md:px-7 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-all group relative">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                          {t.subject}
                        </h4>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-500 text-[8px] uppercase tracking-widest px-2.5 py-0.5 font-bold flex items-center gap-1.5 rounded-full">
                          {t.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 italic opacity-60">
                          Updated {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 italic opacity-60">
                          Created {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-blue-500/40">ALLOWLIST</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-3 py-1 rounded-full">
                        <div className={`w-1 h-1 rounded-full ${t.status === 'open' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${t.status === 'open' ? 'text-blue-400' : 'text-slate-500'}`}>
                          {t.status}
                        </span>
                      </div>
                      <Link href={`/support/${t.id}`}>
                        <Button className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white rounded-lg px-6 py-2 h-8 text-[9px] font-black uppercase tracking-widest transition-all">
                          View Ticket
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
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
