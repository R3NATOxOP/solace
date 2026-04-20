'use client'

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Mail, Hash } from 'lucide-react'

interface DiscordUser {
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

export interface ProfileCardProps {
  profile?: DiscordUser
  className?: string
}

export default function ProfileCard({ profile, className }: ProfileCardProps) {
  const { data: session } = useSession()
  const userData = profile || (session as { discord?: DiscordUser })?.discord

  if (!userData) {
    return null
  }

  const { id, username, avatar, banner, accentColor, verified, email, createdAt } = userData
  const avatarUrl = avatar 
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` 
    : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`
  const bannerUrl = banner 
    ? `https://cdn.discordapp.com/banners/${id}/${banner}.png?size=480` 
    : null

  return (
    <Card className={`w-full overflow-hidden glass-card hud-border rounded-lg ${className}`}>
      <CardHeader className="p-0">
        <div 
          className="h-32 bg-slate-900/50 relative overflow-hidden" 
          style={{ 
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: accentColor ? `#${accentColor.toString(16).padStart(6, '0')}` : undefined
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 relative px-8 pb-10">
        <div className="flex justify-center -mt-12 mb-6">
          <div className="p-1 rounded-full bg-[#0a0a0a] border-4 border-white/5 shadow-2xl relative">
            <Avatar className="h-24 w-24 border-2 border-teal-500/30">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className="text-2xl font-black bg-slate-900 text-teal-400">
                {username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#0a0a0a]" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">{username}</h2>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Hash className="w-3 h-3 text-teal-400" />
            <span>ID: {id}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 group hover:border-teal-500/30 transition-all">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</span>
            </div>
            <span className="text-sm font-bold text-white truncate max-w-[150px]">{email || 'Restricted'}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 group hover:border-teal-500/30 transition-all">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</span>
            </div>
            <span className="text-sm font-bold">
              {verified ? (
                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/10 text-slate-500 text-[8px] font-black uppercase tracking-[0.2em]">
                  Unverified
                </Badge>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 group hover:border-teal-500/30 transition-all">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chronology</span>
            </div>
            <span className="text-sm font-bold text-white">
              {new Date(createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
