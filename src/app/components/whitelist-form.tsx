'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import AuthButton from './auth-button'
import ProfileCard from './profile-card'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Shield, Send, Clock, CheckCircle2, AlertCircle, FileText, Zap, ChevronRight, XCircle, Sparkles, Eye, AlertTriangle } from 'lucide-react'
import { applicationConfig, getMinimumAge } from '@/lib/config'
import { isUserBanned, isUserBlacklisted } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

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

interface ExtendedSession {
  discord?: DiscordUser
}

const generateFormSchema = () => {
  return z.object({})
}

const formSchema = generateFormSchema()

const generateDefaultValues = () => {
  return {}
}

const CharacterCount = ({ current, required }: { current: number; required: number }) => (
  <span className={`text-[10px] font-black uppercase tracking-widest ${current >= required ? 'text-blue-400' : 'text-slate-600'}`}>
    {current} / {required}
  </span>
)

export default function WhitelistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [reapplyInfo, setReapplyInfo] = useState<{ canReapply: boolean, daysRemaining?: number, message?: string } | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<z.infer<typeof formSchema> | null>(null)
  const [appTypes, setAppTypes] = useState<any[]>([])
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const [selectedType, setSelectedType] = useState<string>(typeParam || 'whitelist')
  const [customValues, setCustomValues] = useState<Record<string, any>>({})
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/admin/application-types')
      if (response.ok) {
        const list = await response.json()
        setAppTypes(list || [])
        if (list?.length > 0 && !typeParam) {
          const firstEnabled = list.find((t: any) => t.enabled !== false)
          if (firstEnabled) setSelectedType(firstEnabled.id)
          else setSelectedType(list[0].id)
        }
      }
    } catch { console.error('Failed to fetch types') }
  }

  useEffect(() => {
    const checkReapply = async () => {
      if ((session as ExtendedSession)?.discord?.id) {
        try {
          const response = await fetch(`/api/applications/reapply?type=${encodeURIComponent(selectedType)}`)
          if (response.ok) setReapplyInfo(await response.json())
        } catch { console.error('Failed check') }
      }
    }
    if (mounted) checkReapply()
  }, [session, mounted, selectedType])

  useEffect(() => {
    const type = appTypes.find(t => t.id === selectedType)
    const initial: Record<string, any> = {}
      ; (type?.fields || []).forEach((f: any) => initial[f.id] = f.type === 'checkbox' ? false : '')
    setCustomValues(initial)
    setCustomErrors({})
  }, [selectedType, appTypes])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: generateDefaultValues(),
  })

  useEffect(() => {
    if (mounted && session) {
      fetch('/api/applications/drafts')
        .then(res => res.ok ? res.json() : null)
        .then(draft => {
          if (draft?.formData) {
            form.reset(draft.formData)
            setLastSaved(new Date(draft.updatedAt))
          }
        })
    }
  }, [mounted, session, form])

  useEffect(() => {
    if (!(session as ExtendedSession)?.discord?.id) return
    const saveDraft = async () => {
      const values = form.getValues()
      if (!Object.values(values).some(v => v && v !== '')) return
      try {
        const res = await fetch('/api/applications/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: values, custom: customValues, selectedType }),
        })
        if (res.ok) setLastSaved(new Date())
      } catch { console.error('Save failed') }
    }
    const interval = setInterval(saveDraft, 30000)
    return () => clearInterval(interval)
  }, [session, form, customValues, selectedType])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const type = appTypes.find(t => t.id === selectedType)
    const errs: Record<string, string> = {}
      ; (type?.fields || []).forEach((f: any) => {
        if (f.required) {
          const val = customValues[f.id]
          if (f.type !== 'checkbox' && (!val || String(val).trim() === '')) errs[f.id] = 'Field required'
        }
      })
    setCustomErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast({ title: 'Operational Failure', description: 'Missing required field data.', variant: 'destructive' })
      return
    }
    setPreviewData(values)
    setShowPreview(true)
  }

  const handleFinalSubmit = async () => {
    if (!previewData || !(session as ExtendedSession)?.discord) return
    setIsSubmitting(true)
    const discordId = (session as ExtendedSession)?.discord?.id
    if (!discordId) { setIsSubmitting(false); return }

    const banned = await isUserBanned(discordId)
    const blacklisted = await isUserBlacklisted(discordId)
    if (banned || blacklisted) {
      toast({ title: 'Restricted Access', description: 'Your credentials have been flagged.', variant: 'destructive' })
      setIsSubmitting(false); setShowPreview(false); return
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...previewData, applicationType: selectedType, discord: (session as ExtendedSession)?.discord, custom: customValues }),
      })
      
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        toast({ title: 'Transmission Successful', description: 'Your dossier has been uploaded.' })
        form.reset(); setShowPreview(false)
        // Clear draft after success
        fetch('/api/applications/drafts', { method: 'DELETE' }).catch(() => {})
      } else {
        throw new Error(data.error || 'Failed to upload dossier.')
      }
    } catch (err: any) {
      toast({ 
        title: 'Transmission Error', 
        description: err.message || 'An unexpected error occurred during transmission.', 
        variant: 'destructive' 
      })
    } finally { setIsSubmitting(false) }
  }

  if (!mounted) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">

      <div className="max-w-5xl mx-auto space-y-12 pb-40">
        {session ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="bg-[#0a0a0a] border border-white/10 p-8 md:p-16 rounded-[32px] shadow-2xl relative overflow-hidden">
                {/* Header Branding */}
                <div className="mb-20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-blue-400 leading-none">
                      {appTypes.find(t => t.id === selectedType)?.name || "Application"} Portal
                    </h2>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                    Complete all required sectors for community synchronization.
                  </p>
                </div>
                <div className="space-y-20">
                  {(() => {
                    const type = appTypes.find(t => t.id === selectedType)
                    if (type && type.enabled === false) {
                      return (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 md:p-20 text-center bg-red-500/5 border border-red-500/20 rounded-3xl">
                          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8">
                            <AlertTriangle className="w-10 h-10" />
                          </div>
                          <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Registration Closed</h3>
                          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                            {type.description || "This registration portal is currently offline. Please monitor community announcements for reopening schedules."}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400/60">
                            <Clock className="w-4 h-4" />
                            <span>Operational Resume: TBD</span>
                          </div>
                        </motion.div>
                      )
                    }

                    const allCustomFields = type?.fields || []

                    return (
                      <>
                        <div className="space-y-12">
                          <div className="grid gap-12">
                            {allCustomFields.map((f: any, fIdx: number) => {
                              const qIndex = fIdx + 1
                              return (
                                <div key={f.id} className="space-y-4">
                                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                                    <span className="text-blue-500 font-black mr-2">{qIndex}.</span>
                                    <span className="leading-relaxed">{f.label} {f.required && <span className="text-red-500 ml-1">*</span>}</span>
                                  </label>
                                  {f.type === 'textarea' ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        placeholder={f.placeholder || "Enter your response..."}
                                        className="min-h-[160px] bg-black border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all rounded-xl text-white placeholder:text-slate-700 text-sm py-5 px-6"
                                        value={customValues[f.id] || ''}
                                        onChange={(e) => setCustomValues(p => ({ ...p, [f.id]: e.target.value }))}
                                      />
                                      {f.minLength && (
                                        <div className="flex justify-end">
                                          <CharacterCount current={customValues[f.id]?.length || 0} required={f.minLength} />
                                        </div>
                                      )}
                                    </div>
                                  ) : f.type === 'checkbox' ? (
                                    <div className="space-y-3">
                                      {['Yes', 'No'].map((option) => (
                                        <div
                                          key={option}
                                          onClick={() => setCustomValues(p => ({ ...p, [f.id]: option === 'Yes' }))}
                                          className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer ${(option === 'Yes' && customValues[f.id] === true) || (option === 'No' && customValues[f.id] === false) ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-black border-white/10 text-slate-500 hover:border-white/20'}`}
                                        >
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${(option === 'Yes' && customValues[f.id] === true) || (option === 'No' && customValues[f.id] === false) ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                                            {((option === 'Yes' && customValues[f.id] === true) || (option === 'No' && customValues[f.id] === false)) && <CheckCircle2 className="w-3 h-3 text-black" />}
                                          </div>
                                          <span className="text-sm font-bold uppercase tracking-tight">{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : f.type === 'select' ? (
                                    <select
                                      className="w-full h-14 bg-black border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all rounded-xl text-white text-sm px-6 appearance-none cursor-pointer"
                                      value={customValues[f.id] || ''}
                                      onChange={(e) => setCustomValues(p => ({ ...p, [f.id]: e.target.value }))}
                                    >
                                      <option value="" disabled className="text-slate-700">Select an option...</option>
                                      {(f.options || []).map((opt: string) => (
                                        <option key={opt} value={opt} className="bg-[#0a0a0a] text-white py-2">
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <Input
                                      type={f.type === 'number' ? 'number' : 'text'}
                                      placeholder={f.placeholder || "Enter your response..."}
                                      className="h-14 bg-black border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all rounded-xl text-white placeholder:text-slate-700 text-sm px-6"
                                      value={customValues[f.id] || ''}
                                      onChange={(e) => setCustomValues(p => ({ ...p, [f.id]: f.type === 'number' ? (e.target.value ? parseInt(e.target.value) : '') : e.target.value }))}
                                    />
                                  )}
                                  {customErrors[f.id] && <p className="text-[10px] font-black uppercase text-red-500">{customErrors[f.id]}</p>}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="pt-12 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              onClick={async () => {
                                if (!(session as ExtendedSession)?.discord?.id) return
                                try {
                                  await fetch('/api/applications/drafts', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ custom: customValues, selectedType }),
                                  })
                                  toast({ title: 'Draft Saved', description: 'Your progress has been encrypted.' })
                                } catch { toast({ title: 'Save Failed', variant: 'destructive' }) }
                              }}
                              variant="ghost"
                              className="px-8 h-12 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                            >
                              Save Progress
                            </Button>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const type = appTypes.find(t => t.id === selectedType)
                              const errs: Record<string, string> = {}
                                ; (type?.fields || []).forEach((f: any) => {
                                  if (f.required) {
                                    const val = customValues[f.id]
                                    if (f.type !== 'checkbox' && (val === undefined || val === null || String(val).trim() === '')) {
                                      errs[f.id] = 'This field is required'
                                    }
                                    if (f.minLength && String(val || '').length < f.minLength) {
                                      errs[f.id] = `Minimum ${f.minLength} characters required`
                                    }
                                  }
                                })
                              setCustomErrors(errs)
                              if (Object.keys(errs).length > 0) {
                                toast({ title: 'Operational Failure', description: 'Missing required field data.', variant: 'destructive' })
                                return
                              }
                              setPreviewData(customValues)
                              setShowPreview(true)
                            }}
                            disabled={isSubmitting || (reapplyInfo && !reapplyInfo.canReapply)}
                            className="px-10 h-12 rounded-xl bg-blue-500 text-black hover:bg-blue-400 font-black uppercase tracking-widest transition-all shadow-xl"
                          >
                            Submit Application
                          </Button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/10 p-20 text-center rounded-[32px]">
            <Shield className="w-20 h-20 text-blue-500/20 mx-auto mb-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Authentication Required</h2>
            <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">To establish your registry within the community, please synchronize your Discord credentials.</p>
            <Button onClick={() => signIn('discord')} className="px-12 h-16 rounded-2xl bg-blue-500 text-black hover:bg-blue-400 font-black uppercase tracking-widest text-lg shadow-xl">Synchronize Now</Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card hud-border w-full max-w-5xl rounded-lg max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-8 md:p-10 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">Dossier <span className="text-gradient-primary">Review</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Verification Stage Protocol</p>
                </div>
                <Button variant="ghost" onClick={() => setShowPreview(false)} className="w-12 h-12 rounded-full border border-white/10 p-0 text-slate-500 hover:text-white"><XCircle className="w-6 h-6" /></Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
                {(() => {
                  const type = appTypes.find(t => t.id === selectedType)
                  return (type?.fields || []).map((f: any) => (
                    <div key={f.id} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{f.label}</p>
                      <p className="text-white font-medium whitespace-pre-wrap">{previewData[f.id] === true ? 'Yes' : previewData[f.id] === false ? 'No' : previewData[f.id] || 'N/A'}</p>
                    </div>
                  ))
                })()}
              </div>

              <div className="p-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                <Button variant="ghost" onClick={() => setShowPreview(false)} className="h-16 flex-1 rounded-lg border border-white/10 font-black uppercase tracking-widest text-slate-500 hover:text-white">Abort & Refine</Button>
                <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="btn-premium h-16 flex-1 flex items-center justify-center">
                  {isSubmitting ? <Clock className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5 mr-3" /> Transmit Dossier</>}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
