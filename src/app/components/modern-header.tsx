'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, User, LogOut, Shield, Zap } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import dynamic from 'next/dynamic'

const AdminButton = dynamic(() => import('./admin-button'), {
  loading: () => <div className="h-10 w-10" />,
})

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

export default function ModernHeader() {
  const { data: session } = useSession()
  const discordUser = (session as ExtendedSession)?.discord

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="glass rounded-lg flex h-20 items-center justify-between px-8 border-white/10 shadow-2xl backdrop-blur-2xl max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-4 group">
          <Image 
            src={applicationConfig.website.serverLogo} 
            alt="Logo" 
            width={48} 
            height={48} 
            className="rounded-lg group-hover:scale-110 transition-transform duration-500" 
            priority 
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase leading-tight text-white">
              {applicationConfig.website.serverName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-black opacity-80">
              Limitless Stories
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-2">
          {[
            { name: 'Dashboard', href: '/' },
            { name: 'Rules', href: '/rules' },
            { name: 'About', href: '/about' },
            { name: 'Announcements', href: '/announcements' },
            { name: 'Shop', href: '/pricing' },
            { name: 'Applications', href: '/applications' },
            { name: 'Support', href: '/support' },
          ].map((item) => (
            <Link key={item.name} href={item.href}>
              <Button variant="ghost" className="rounded-lg h-10 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {discordUser ? (
            <>
              <Link href="/apply">
                <Button className="h-10 px-6 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Apply
                </Button>
              </Link>
              <AdminButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer border border-white/10 hover:border-teal-500/50 transition-all">
                    <AvatarImage src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} alt={discordUser.username} />
                    <AvatarFallback className="bg-slate-900 text-teal-400 font-black">{discordUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-white/10">
                  <div className="px-4 py-3 flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-white">{discordUser.username}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Verified Citizen</span>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                    <Link href="/my-application" className="flex items-center w-full">
                      <Zap className="mr-2 h-4 w-4 text-teal-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">My Status</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => signOut()} className="focus:bg-red-500/10 text-red-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => signIn('discord')} 
              className="h-12 px-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(20,184,166,0.1)]"
            >
              <Shield className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
