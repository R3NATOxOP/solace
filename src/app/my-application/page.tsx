'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import type { Application } from '@/lib/types'
import { FileText, CheckCircle2, XCircle, Clock, Calendar, User, Zap, Eye, ChevronDown, Shield, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { HomeButton } from '@/app/components/admin-button'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { ApplicationStatistics } from '@/components/application-statistics'
import { applicationConfig } from '@/lib/config'
import { signOut, signIn } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  denied: { label: 'Denied', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
}

export default function MyApplicationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [latestApplication, setLatestApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'latest' | 'history'>('latest')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated' && mounted) {
      router.push('/')
    } else if (status === 'authenticated' && mounted) {
      fetchMyApplications()
    }
  }, [status, router, mounted])

  const fetchMyApplications = async () => {
    try {
      const response = await fetch('/api/applications/my-status')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        setLatestApplication(data.latestApplication)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || status === 'loading' || loading) {
    return <LoadingPage text="Loading your applications..." />
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

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
                suppressHydrationWarning
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-tight">
                  {applicationConfig.website.serverName}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-black opacity-80">
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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/my-application' ? 'text-white border-white/10' : ''}`}>
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex flex-col">
            <span className="text-blue-400 text-xs font-black uppercase tracking-[0.4em] mb-4">
              Personal Dossier
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-white mb-8">
              Application <br />
              <span className="text-gradient-primary">Tracking</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Monitor the status of your entry credentials and review historical transmissions.
            </p>
          </div>
        </motion.div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-16">
          <button onClick={() => setViewMode('latest')} className={`px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-500 relative ${viewMode === 'latest' ? 'text-white' : 'text-slate-500'}`}>
            {viewMode === 'latest' && <motion.div layoutId="viewTab" className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 rounded-lg" />}
            <span className="relative z-10 flex items-center gap-3"><Eye className="w-4 h-4" /> Primary File</span>
          </button>
          <button onClick={() => setViewMode('history')} className={`px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-500 relative ${viewMode === 'history' ? 'text-white' : 'text-slate-500'}`}>
            {viewMode === 'history' && <motion.div layoutId="viewTab" className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 rounded-lg" />}
            <span className="relative z-10 flex items-center gap-3"><Calendar className="w-4 h-4" /> Archives ({applications.length})</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'latest' ? (
            <motion.div key="latest" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {latestApplication ? (
                <div className="glass-card hud-border p-8 md:p-12 rounded-lg space-y-12">
                  <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="w-full md:w-1/3">
                      <div className="glass p-10 rounded-lg border-white/5 text-center space-y-6">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 border-white/10 ${statusConfig[latestApplication.status as keyof typeof statusConfig]?.bgColor}`}>
                          {latestApplication.status === 'approved' && <CheckCircle2 className="w-10 h-10 text-blue-500" />}
                          {latestApplication.status === 'denied' && <XCircle className="w-10 h-10 text-red-500" />}
                          {latestApplication.status === 'pending' && <Clock className="w-10 h-10 text-yellow-500" />}
                        </div>
                        <div>
                          <h3 className={`text-2xl font-black uppercase tracking-tighter ${statusConfig[latestApplication.status as keyof typeof statusConfig]?.color}`}>
                            {statusConfig[latestApplication.status as keyof typeof statusConfig]?.label || 'In Process'}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2">
                            Synchronized {new Date(latestApplication.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-6 w-full">
                      {[
                        { label: 'Alias', value: latestApplication.characterName || 'N/A' },
                        { label: 'Chronology', value: `${latestApplication.age} Cycles` },
                        { label: 'Registry', value: latestApplication.steamId, mono: true },
                        { label: 'Assignee', value: latestApplication.assignedTo || 'Pending Assignment' },
                      ].map((item, i) => (
                        <div key={i} className="glass p-6 rounded-lg border-white/5 group hover:border-blue-500/30 transition-all">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{item.label}</p>
                          <p className={`text-white font-bold uppercase tracking-tight ${item.mono ? 'font-mono text-xs opacity-50' : 'text-lg'}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {latestApplication.statusReason && (
                    <div className="glass p-8 rounded-lg border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Administrative Feedback
                      </p>
                      <p className="text-white font-medium italic text-lg leading-relaxed">"{latestApplication.statusReason}"</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Operational History</h4>
                      <div className="glass p-6 rounded-lg border-white/5 text-slate-400 text-sm font-medium leading-relaxed min-h-[150px]">
                        {latestApplication.experience}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Character Profile</h4>
                      <div className="glass p-6 rounded-lg border-white/5 text-slate-400 text-sm font-medium leading-relaxed min-h-[150px]">
                        {latestApplication.character}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card hud-border p-20 text-center rounded-lg">
                  <FileText className="w-16 h-16 text-blue-500/20 mx-auto mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">No Active Transmission</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">Establish your presence in our community by initializing your first application link.</p>
                  <Link href="/applications"><Button className="btn-premium px-10 py-6 h-auto text-lg uppercase font-black tracking-widest">Initialize Link</Button></Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {applications.map((app, i) => (
                <div key={app.id} className="glass-card border-white/5 rounded-lg p-6 hover:bg-white/5 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border border-white/10 ${statusConfig[app.status as keyof typeof statusConfig]?.bgColor}`}>
                        {app.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                        {app.status === 'denied' && <XCircle className="w-6 h-6 text-red-500" />}
                        {app.status === 'pending' && <Clock className="w-6 h-6 text-yellow-500" />}
                      </div>
                      <div>
                        <h4 className={`font-black uppercase tracking-tight text-lg ${statusConfig[app.status as keyof typeof statusConfig]?.color}`}>
                          {statusConfig[app.status as keyof typeof statusConfig]?.label || 'Archived'}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                          ID: {app.id.slice(0, 8)} • {new Date(app.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-slate-500 px-4 py-2 uppercase font-black text-[10px] tracking-widest">
                      {app.characterName || 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
