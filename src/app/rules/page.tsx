'use client'

import React, { useEffect, useState } from 'react'
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
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import Image from 'next/image'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'

const AdminButton = dynamic(() => import('../components/admin-button'), {
  loading: () => <div className="h-10 w-10" />,
})

interface RuleCategory {
  id: string
  title: string
  rules: string[]
}

export default function Rules() {
  const { data: session } = useSession()
  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules')
      if (!res.ok) throw new Error('Failed to fetch rules')
      const data = await res.json()
      const categories = data?.categories ?? data
      setRuleCategories(categories)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setIsLoading(false)
    }
  }

  if (!mounted || isLoading) return <LoadingPage text="Synchronizing Rules..." />

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-blue-200">
      {/* Cinematic Background Glows - Deep Blue Theme */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full opacity-30" />
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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/rules' ? 'text-white border-white/10' : ''}`}>
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

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-40">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 rounded-[32px] p-8 md:p-16 shadow-2xl">
          {ruleCategories.map((category, catIndex) => (
            <div key={category.id} className={catIndex !== 0 ? 'mt-12' : ''}>
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight uppercase">
                {category.title}
              </h2>

              <div className="space-y-6">
                {category.rules.map((rule, ruleIndex) => {
                  const [title, ...descParts] = rule.split('.')
                  const description = descParts.join('.')

                  return (
                    <div key={ruleIndex} className="space-y-1">
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        {title}{description ? '.' : ''}
                      </h3>
                      {description && (
                        <p className="text-slate-400 font-medium leading-relaxed text-sm">
                          {description.trim()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          
          <div className="mt-12 pt-8 border-t border-white/5 italic text-slate-500 text-xs text-center">
            If you have an issue, open a ticket to discuss it with server staff rather than impacting morale negatively.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-16 px-6 relative z-10">
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