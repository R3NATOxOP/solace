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
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { FileText, User, LogOut, Users, Calendar, Award, Target, Heart, Sparkles, Shield, Zap } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import Image from 'next/image'
import AdminButton from '../components/admin-button'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export default function About() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    { label: 'Active Players', value: '500+', icon: Users },
    { label: 'Server Uptime', value: '99.9%', icon: Zap },
    { label: 'Founded', value: '2024', icon: Calendar },
    { label: 'Community Hub', value: '10k+', icon: Heart }
  ]

  const features = [
    {
      title: 'Immersive Roleplay',
      description: 'Experience the most realistic FiveM roleplay environment with custom scripts, detailed character systems, and engaging storylines.',
      icon: Target
    },
    {
      title: 'Active Community',
      description: 'Join a welcoming community of dedicated roleplayers who respect the craft and create memorable experiences together.',
      icon: Users
    },
    {
      title: 'Regular Events',
      description: 'Participate in weekly events, competitions, and special roleplay scenarios that keep the server fresh and exciting.',
      icon: Calendar
    },
    {
      title: 'Quality Assurance',
      description: 'Our dedicated staff team ensures fair play, resolves issues quickly, and maintains the highest standards of roleplay.',
      icon: Award
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-white selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full opacity-30" />
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
                Community Hub
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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/about' ? 'text-white border-white/10' : ''}`}>
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
              Community Core
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-white mb-8">
              Operational <br />
              <span className="text-gradient-primary">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Discover the infrastructure, philosophy, and history behind the most immersive FiveM roleplay network.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-32">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="glass-card hud-border p-8 rounded-lg text-center group hover:translate-y-[-4px] transition-all duration-500">
                <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mx-auto mb-6 border border-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-black tracking-tighter mb-1 uppercase">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest font-black text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8 leading-tight">
              A Legacy of <span className="text-teal-400">Pure Adrenaline</span>
            </h2>
            <div className="space-y-6 text-slate-400 font-medium leading-relaxed text-lg">
              <p>Established in 2024, our platform emerged from a singular vision: to bridge the gap between technical excellence and profound character-driven narratives.</p>
              <p>We operate on the principle that the most memorable digital experiences are forged through collaboration and uncompromising quality. Every line of code and every community guideline is optimized to empower your creative agency.</p>
              <p>Today, our network serves as a benchmark for high-fidelity roleplay, constantly evolving through active community feedback and technological innovation.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="glass-card hud-border aspect-square rounded-lg flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <Shield className="w-40 h-40 text-teal-500/20 group-hover:text-teal-500/40 transition-colors duration-700 group-hover:scale-110 transition-transform" />
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="glass-card hud-border p-10 rounded-lg group hover:bg-white/5 transition-all duration-500 h-full">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-14 h-14 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">{f.title}</h3>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
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