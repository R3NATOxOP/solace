'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlayCircle, Users, Clock, CheckCircle2, AlertCircle, Shield, Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationConfig } from '@/lib/config';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QueueStatus {
  queueLength: number;
  playerCount: number;
  maxPlayers: number;
  availableSlots: number;
  serverOnline: boolean;
}

export default function ConnectPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchQueueStatus = async () => {
      try {
        const response = await fetch('/api/fivem/queue-status');
        const result = await response.json();
        if (result.success) {
          setQueueStatus(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch queue status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to connect to the server.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const response = await fetch('/api/fivem/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Connection Token Generated!",
          description: "Launching FiveM... Please wait.",
        });

        setTimeout(() => {
          window.location.href = data.connectUrl;
        }, 1000);

        setTimeout(() => {
          setIsConnecting(false);
        }, 3000);
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to generate connection token.",
          variant: "destructive",
        });
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  if (!mounted || status === 'loading' || loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
      </div>
    );
  }

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
                  Secure Interface
                </span>
              </div>
            </Link>
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

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 pt-32 pb-40">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-400 uppercase tracking-[0.4em] px-4 py-2 bg-teal-500/5 mb-6">
            Establishing Connection
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none uppercase text-white mb-6">
            Enter the <br />
            <span className="text-gradient-primary">Multiverse</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Join the most immersive roleplay network via secure operational links.</p>
        </motion.div>

        <div className="grid gap-8">
          {/* Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Status', value: queueStatus?.serverOnline ? 'Online' : 'Offline', icon: Zap, color: queueStatus?.serverOnline ? 'text-teal-400' : 'text-red-400' },
              { label: 'Players', value: `${queueStatus?.playerCount || 0}/${queueStatus?.maxPlayers || 32}`, icon: Users, color: 'text-white' },
              { label: 'Queue', value: queueStatus?.queueLength || 0, icon: Clock, color: 'text-yellow-400' },
              { label: 'Available', value: queueStatus?.availableSlots || 0, icon: CheckCircle2, color: 'text-teal-400' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <div className="glass-card hud-border p-6 rounded-lg text-center group">
                  <s.icon className={`w-5 h-5 mx-auto mb-4 ${s.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`text-xl font-black uppercase tracking-tighter ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connection Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-card hud-border p-12 rounded-lg text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                <PlayCircle className="w-16 h-16 text-teal-500/20 mx-auto mb-8 group-hover:scale-110 group-hover:text-teal-500 transition-all" />
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Initialize Session</h2>
                <p className="text-slate-400 mb-10 max-w-md mx-auto">Click below to generate a unique session token and launch the server application.</p>
                
                {session ? (
                  <Button 
                    onClick={handleConnect} 
                    disabled={isConnecting || !queueStatus?.serverOnline}
                    className="btn-premium px-16 py-8 h-auto text-xl uppercase font-black tracking-widest w-full md:w-auto"
                  >
                    {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Connect to Server"}
                  </Button>
                ) : (
                  <Button onClick={() => signIn('discord')} className="rounded-lg px-16 py-8 h-auto text-xl uppercase font-black tracking-widest bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-all w-full md:w-auto">
                    Login to Connect
                  </Button>
                )}

                {!queueStatus?.serverOnline && (
                  <p className="mt-6 text-xs font-black uppercase tracking-widest text-red-500/60 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Server is currently offline
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Protocol Card */}
          <div className="glass-card hud-border p-10 rounded-lg">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 mb-8 ml-1">Connection Protocols</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Secure Link', desc: 'Each session is protected by an encrypted, single-use token.' },
                { title: 'Priority Queue', desc: 'Discord roles and community standing affect queue placement.' },
                { title: 'Crash Recovery', desc: '3-minute window to rejoin without losing queue position.' },
                { title: 'VIP Channels', desc: 'Subscribers benefit from high-speed operational bandwidth.' },
              ].map((p, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  <div>
                    <h4 className="font-black uppercase text-sm mb-1">{p.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  );
}
