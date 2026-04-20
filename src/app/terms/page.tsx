'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { applicationConfig } from '@/lib/config'
import { motion } from 'framer-motion'
import { Shield, ChevronRight, FileText } from 'lucide-react'

export default function TermsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-white selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* Header */}
      <header className="relative z-50 pt-10 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="glass rounded-lg p-6 flex items-center justify-between border-white/10 shadow-2xl backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-4 group">
            <Image src={applicationConfig.website.serverLogo} alt="Logo" width={48} height={48} className="rounded-lg group-hover:scale-110 transition-transform duration-500" priority />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-tight">{applicationConfig.website.serverName}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-black opacity-80">Legal Framework</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="rounded-lg h-10 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all">Return Home</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-40">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-20">
          <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Operational Protocol</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white mb-8">Terms of <span className="text-gradient-primary">Service</span></h1>
          <p className="text-slate-400 font-medium leading-relaxed">By accessing our community infrastructure, you agree to comply with the following operational parameters.</p>
        </motion.div>

        <div className="space-y-12">
          {[
            { title: "Acceptance of Terms", content: "By utilizing this platform, you acknowledge that you have read, understood, and agreed to be bound by these protocols." },
            { title: "Community Conduct", content: "All citizens are expected to maintain the highest level of integrity and respect within the community. Violations result in immediate dossier termination." },
            { title: "Virtual Acquisitions", content: "All contributions and acquisitions are final and processed via secure gateways. No refunds are issued for digital deployments." },
            { title: "Liability", content: "Our management unit holds no liability for external disruptions or user-generated conflicts within the infrastructure." }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className="glass-card hud-border p-8 rounded-lg group hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">{item.title}</h2>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed ml-12">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-800 font-black">Official Legal Dossier v1.0.4</p>
        </div>
      </footer>
    </div>
  )
}
