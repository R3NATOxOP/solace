'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { Ticket, TicketCategory, TicketPriority } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { AlertCircle, Ticket as TicketIcon, ChevronLeft, Send, X } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'
import { applicationConfig } from '@/lib/config'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function NewTicketPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TicketCategory>('general')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState<{ name: string; base64: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    Array.from(selectedFiles).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFiles(prev => [...prev, { name: file.name, base64: reader.result as string }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const submit = async () => {
    if (!subject || !description) {
      toast({ title: 'Missing fields', description: 'Please provide subject and description', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          category,
          priority,
          attachments: files.map(f => f.base64)
        }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to submit ticket', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Ticket established and transmitting...' })
      router.push('/support')
    } catch (err) {
      console.error('Submit error', err)
      toast({ title: 'Error', description: 'Failed to submit ticket', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || status === 'loading') return <LoadingPage text="Initializing interface..." />

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
                      <span className="text-xs font-bold">{session.user?.name}</span>
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

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-10 pt-20 pb-40">
        {status === 'unauthenticated' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass p-12 text-center rounded-[32px] border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl">
              <AlertCircle className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-50" />
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Connection Required</h3>
              <p className="text-slate-400 mb-8 font-medium">You must be authenticated to initialize a support link.</p>
              <Button onClick={() => signIn('discord')} className="bg-blue-600 hover:bg-blue-500 px-10 py-6 h-auto text-lg uppercase font-black tracking-widest rounded-xl">Initialize Session</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[32px] border-white/5 p-6 md:p-10 shadow-2xl bg-[#0a0a0a]/80 backdrop-blur-3xl"
          >
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-blue-400 mb-6">
                New Support Ticket
              </h1>
              <div className="h-px bg-white/5 w-full mb-8" />
            </div>

            <div className="space-y-6">
              {/* Top Row: Title, Category */}
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Title"
                    className="bg-[#121212] border-white/5 rounded-xl h-14 px-6 font-bold placeholder:text-slate-700 focus:border-blue-500/30"
                  />
                </div>
                <div className="md:col-span-4">
                  <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-[#121212] border border-white/5 rounded-xl h-14 px-6 text-sm font-bold outline-none focus:border-blue-500/30 hover:bg-white/[0.05] transition-all appearance-none cursor-pointer text-slate-400">
                    <option value="general" className="bg-slate-950">General Support</option>
                    <option value="suggestion" className="bg-slate-950">Suggestions</option>
                    <option value="banappeal" className="bg-slate-950">Ban Appeal</option>
                    <option value="billing" className="bg-slate-950">Billing</option>
                    <option value="bug" className="bg-slate-950">Bug Report</option>
                    <option value="discord" className="bg-slate-950">Discord Access</option>
                    <option value="other" className="bg-slate-950">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 ml-1">Describe your issue</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Share as much detail as possible so our team can help."
                  rows={8}
                  className="bg-[#121212] border-white/5 rounded-xl px-6 py-6 font-medium placeholder:text-slate-700 focus:border-blue-500/30 resize-none min-h-[180px] leading-relaxed"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 ml-1">Attachments (optional)</Label>

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={onFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="bg-[#121212] border-white/5 hover:bg-white/5 text-slate-400 rounded-xl px-6 py-3 h-auto flex items-center gap-2 text-xs font-bold transition-all"
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px]">📎</div>
                    Add Files
                  </Button>

                  {files.map((file, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 group">
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <span className="text-xs leading-none">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-6 flex items-center justify-end gap-3 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/support')}
                  className="bg-[#1a1a1a] border border-white/5 hover:bg-white/5 text-slate-400 rounded-xl px-8 py-3 h-auto text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 rounded-xl px-8 py-3 h-auto text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
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
