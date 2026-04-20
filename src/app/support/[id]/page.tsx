'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import type { Ticket, TicketCategory, TicketPriority } from '@/lib/types'
import { User, Send, MessageCircle } from 'lucide-react'
import { applicationConfig } from '@/lib/config'
import { motion } from 'framer-motion'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ticketId = params?.id as string | undefined

  useEffect(() => {
    setMounted(true)
    const load = async () => {
      if (!ticketId) return
      try {
        const res = await fetch(`/api/tickets/${ticketId}`)
        if (!res.ok) {
          toast({ title: 'Error', description: 'Ticket not found', variant: 'destructive' })
          router.push('/support')
          return
        }
        const data = await res.json()
        setTicket(data)
      } catch (err) {
        console.error('Failed to load ticket', err)
      } finally {
        setLoading(false)
      }
    }
    if (status !== 'loading' && ticketId) {
      load()
    }
  }, [ticketId, status, toast, router])

  const addNote = async () => {
    if (!noteContent.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' })
        return
      }
      const updated = await res.json()
      setTicket(updated)
      setNoteContent('')
      toast({ title: 'Transmission Successful', description: 'Communication log updated.' })
    } catch (err) {
      console.error('Add note error', err)
      toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || loading || status === 'loading') return <LoadingPage text="Synchronizing Ticket Data..." />

  if (!ticket) return null

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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/support' ? 'text-white border-white/10 bg-white/5' : ''}`}>
                    {item.name}
                  </Button>
                </Link>
              ))}
              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-4 rounded-lg border border-white/5 hover:bg-white/5 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.user?.image || undefined} />
                        <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-white">{session.user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
                    <DropdownMenuItem asChild><Link href="/my-application">Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onSelect={() => signOut()} className="text-red-400">Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-10 pt-20 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[32px] border-white/5 p-6 md:p-10 shadow-2xl bg-[#0a0a0a]/80 backdrop-blur-3xl"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-blue-400/90">
              Support Ticket
            </h1>
            <Button
              onClick={() => router.push('/support')}
              className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white rounded-xl px-7 py-2.5 h-auto text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/20"
            >
              Go Back
            </Button>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 md:col-span-6 space-y-1">
              <Label className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 opacity-60">TITLE</Label>
              <p className="text-base font-bold text-white tracking-tight leading-tight">{ticket.subject}</p>
            </div>
            <div className="col-span-6 md:col-span-3 space-y-1">
              <Label className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 opacity-60">CREATED ON</Label>
              <p className="text-[11px] font-bold text-slate-300">
                {new Date(ticket.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(ticket.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
            </div>
            <div className="col-span-3 md:col-span-1.5 space-y-1">
              <Label className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 opacity-60">STATUS</Label>
              <div className="pt-0.5">
                <Badge variant="outline" className={`rounded-md px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border border-blue-500/20 bg-blue-500/5 text-blue-400`}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full mb-10" />

          {/* Original Details Section */}
          <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 rounded-xl border border-white/10">
                <AvatarImage src={''} />
                <AvatarFallback className="bg-slate-900 text-blue-400 font-black text-xs uppercase">
                  {ticket.userName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-tighter text-white">{ticket.userName}</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Original Ticket Details</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {ticket.description}
                </p>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {ticket.attachments.map((url, i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-xl border border-white/10 overflow-hidden group cursor-pointer relative">
                      <img src={url} alt="attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[8px] font-black uppercase tracking-widest">View Attachment</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Communication/Replies Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Communication History</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {ticket.notes && ticket.notes.length > 0 ? (
              <div className="space-y-6">
                {ticket.notes.map((note, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className="flex gap-6">
                    <Avatar className="h-10 w-10 rounded-lg border border-white/10 shrink-0 bg-slate-950 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-700" />
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black uppercase tracking-tighter text-white">{(note as any).authorName || (note as any).username || 'Unknown'}</span>
                        {note.isStaff && (
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 text-[8px] font-black px-1.5 py-0 rounded-sm">CREW</Badge>
                        )}
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 text-[13px] leading-relaxed">
                        {note.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">No replies yet.</p>
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div className="mt-12 pt-10 border-t border-white/5">
            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 ml-1">Send Transmission</Label>
              <div className="relative">
                <Textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Establish communication..."
                  className="bg-[#121212] border-white/5 rounded-2xl px-6 py-6 font-medium placeholder:text-slate-700 focus:border-blue-500/30 resize-none min-h-[120px]"
                />
                <Button
                  onClick={addNote}
                  disabled={submitting || !noteContent.trim()}
                  className="absolute bottom-4 right-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 rounded-xl px-6 py-2 h-auto text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Transmit'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
            <div className="flex items-center gap-4">
              <Image src={applicationConfig.website.serverLogo} alt="Logo" width={50} height={50} className="rounded-lg grayscale opacity-50" />
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-tighter text-white">{applicationConfig.website.serverName}</span>
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
