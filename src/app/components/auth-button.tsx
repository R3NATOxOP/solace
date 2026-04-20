'use client'

import { signIn, signOut, useSession } from "next-auth/react"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { User, LogOut, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || status === "loading") {
    return (
      <div className="flex justify-center">
        <Button disabled className="rounded-lg h-12 px-6 bg-white/5 border border-white/10 text-slate-500">
          <User className="mr-2 h-4 w-4 animate-pulse" />
          Synchronizing...
        </Button>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => signOut()} className="rounded-lg h-12 px-6 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group">
          <Avatar className="h-6 w-6 mr-3 border border-white/10 group-hover:border-teal-500/50 transition-colors">
            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
            <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-black uppercase tracking-widest">{session.user?.name}</span>
          <LogOut className="ml-3 h-4 w-4 opacity-50 group-hover:opacity-100" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <Button
        onClick={() => signIn('discord')}
        className="rounded-lg h-14 px-8 bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.1)] transition-all group"
      >
        <Shield className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-black uppercase tracking-[0.2em]">Synchronize Discord</span>
      </Button>
    </div>
  )
}
