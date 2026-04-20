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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, User, LogOut, Megaphone, Sparkles, ShoppingBag, MessageCircle, Shield, Zap } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { applicationConfig } from '@/lib/config'
import { usePermissions } from '@/hooks/use-permissions'
import dynamic from 'next/dynamic'

// Lazy load non-critical components
const AdminButton = dynamic(() => import('./components/admin-button'), {
  loading: () => <div className="h-10 w-10" />,
})
const FiveMConnectCard = dynamic(() => import('./components/fivem-connect-card'), {
  ssr: false,
  loading: () => <Card className="h-32 animate-pulse bg-muted" />,
})

interface Announcement {
  id: string
  title: string
  content: string
  type: 'maintenance' | 'event' | 'important' | 'update' | 'community'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  updatedAt?: string
  createdBy: string
  createdById: string
}

type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: string
  banner: string
  accentColor: number | null
  verified: boolean
  email: string
  createdAt: string
}

interface ExtendedSession {
  discord?: DiscordUser
}

export default function Home() {
  const { data: session } = useSession()
  const { permissions } = usePermissions()
  const discordUser = (session as ExtendedSession)?.discord
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements')
        if (response.ok) {
          const data = await response.json()
          setAnnouncements(data)
          const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]')
          setDismissedAnnouncements(dismissed)
          const newHighPriorityAnnouncement = data.find(
            (ann: Announcement) => ann.priority === 'high' && !dismissed.includes(ann.id)
          )
          if (newHighPriorityAnnouncement) setShowAnnouncementModal(true)
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
      }
    }
    const timer = setTimeout(fetchAnnouncements, 500)
    return () => clearTimeout(timer)
  }, [mounted])

  const handleDismissAnnouncement = (announcementId: string) => {
    const updated = [...dismissedAnnouncements, announcementId]
    setDismissedAnnouncements(updated)
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(updated))
    const nextAnnouncement = announcements.find((ann) => ann.priority === 'high' && !updated.includes(ann.id))
    if (!nextAnnouncement) setShowAnnouncementModal(false)
  }

  const currentAnnouncement = announcements.find((ann) => ann.priority === 'high' && !dismissedAnnouncements.includes(ann.id))

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return '🔧'; case 'event': return '🎉'; case 'important': return '⚠️';
      case 'update': return '🆕'; case 'community': return '💬'; default: return '📢';
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-orange-500'; case 'event': return 'bg-purple-500';
      case 'important': return 'bg-red-500'; case 'update': return 'bg-blue-500';
      case 'community': return 'bg-green-500'; default: return 'bg-gray-500';
    }
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* Announcement Modal */}
      {mounted && (
        <Dialog open={showAnnouncementModal && !!currentAnnouncement} onOpenChange={setShowAnnouncementModal}>
          <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${getTypeColor(currentAnnouncement?.type || 'important')}`}>
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl">
                    {getAnnouncementIcon(currentAnnouncement?.type || 'important')} {currentAnnouncement?.title}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-base text-foreground mt-4 whitespace-pre-wrap">
                {currentAnnouncement?.content}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                className="border-white/10 hover:border-blue-500/50 bg-slate-800/30 text-white"
                onClick={() => currentAnnouncement && handleDismissAnnouncement(currentAnnouncement.id)}
              >
                Don&apos;t Show Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
                  <Button variant="ghost" className="rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    {item.name}
                  </Button>
                </Link>
              ))}
              <AdminButton />
              {mounted && discordUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-4 rounded-lg border border-white/5 hover:bg-white/5">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : undefined} />
                        <AvatarFallback>{discordUser.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">{discordUser.username}</span>
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

      {/* Main Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-40">
        <div className="flex flex-col lg:flex-row gap-20 items-start justify-between">
          {/* Left Side: Hero Text */}
          <div className="flex-1 space-y-12 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex flex-col">
                <span className="text-blue-400 text-xs font-black uppercase tracking-[0.4em] mb-4">
                  SOLACE
                </span>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-white">
                  Join a City <br /> Built on <br />
                  <span className="text-gradient-primary">Pure Adrenaline</span>
                </h1>
              </div>

              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                Craft unforgettable stories, partner with dedicated departments, and experience a truly custom framework tuned for cinematic roleplay.
              </p>

            </motion.div>

            {/* Feature Cards below hero */}
            <div suppressHydrationWarning className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mounted && [
                { icon: <Zap className="w-5 h-5" />, title: "Custom Framework", sub: "Built for performance" },
                { icon: <User className="w-5 h-5" />, title: "Active Community", sub: "Staff & players synced" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass p-5 rounded-lg border-white/5 flex items-center gap-4 hover:border-blue-500/30 transition-all cursor-default"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">{item.title}</span>
                    <span className="text-sm font-bold text-white tracking-tight">{item.sub}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Server Status Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-[400px]"
          >
            <div className="glass-card rounded-lg p-8 border-white/10 shadow-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white">Current Server Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <FiveMConnectCard />
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-slate-500">
                    <span>Performance</span>
                    <span className="text-blue-400">Stable</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '94%' }}
                      className="h-full bg-blue-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* About Section (Simplified like screenshot) */}
      <section className="bg-white/[0.02] border-t border-white/5 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-16 text-gradient-primary">
            About {applicationConfig.website.serverName.split(' ')[0]}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mounted && [
              { icon: <Shield className="w-8 h-8" />, title: "Ironclad Security", desc: "Advanced protection systems to ensure your experience remains uninterrupted and fair." },
              { icon: <ShoppingBag className="w-8 h-8" />, title: "Elite Economy", desc: "A player-driven financial ecosystem where your business decisions shape the city's future." },
              { icon: <MessageCircle className="w-8 h-8" />, title: "Voice First", desc: "Proximity-based communication that brings realism to every interaction and negotiation." },
            ].map((feature, i) => (
              <div key={i} className="glass p-10 rounded-lg border-white/5 hover:border-blue-500/20 transition-all duration-500">
                <div className="text-blue-400 mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
            <div className="flex items-center gap-4">
              <Image src={applicationConfig.website.serverLogo} alt="Logo" width={50} height={50} className="rounded-lg grayscale opacity-50" suppressHydrationWarning />
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-black">
              &copy; {mounted ? new Date().getFullYear() : '2026'} {applicationConfig.website.serverName}. All rights reserved.
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-800 font-black">
              Crafted for Excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
