'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { shopConfig, applicationConfig, type ShopProduct } from '@/lib/config'
import { Check, Zap, Package, FileText, User, LogOut, ShoppingBag, Sparkles, Crown, Gift, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut, signIn } from 'next-auth/react'
import AdminButton from '@/app/components/admin-button'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

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

export default function PricingPage() {
  const { data: session } = useSession()
  const discordUser = (session as ExtendedSession)?.discord
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<ShopProduct[]>(shopConfig.products)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coins' | 'premium' | 'cosmetic' | 'bundle'>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [shopEnabled, setShopEnabled] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const loadProducts = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          fetch('/api/shop/products'),
          fetch('/api/shop/settings')
        ])
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data)
        }
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          setShopEnabled(settings.enabled ?? true)
        }
      } catch (error) {
        console.warn('Failed to fetch shop data, using config fallback:', error)
        setProducts(shopConfig.products)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  if (!mounted) return <LoadingPage text="Loading shop..." />
  if (loading) return <LoadingPage text="Loading shop..." />

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'All Items', icon: '📦' },
    { id: 'coins', label: 'Coins', icon: '💰' },
    { id: 'premium', label: 'Premium', icon: '⭐' },
    { id: 'bundle', label: 'Bundles', icon: '🎁' },
  ] as const

  const handlePurchase = async (productId: string) => {
    if (!session?.user?.email) {
      toast({ title: 'Not Signed In', description: 'Please sign in to make a purchase', variant: 'destructive' })
      return
    }
    setProcessingId(productId)
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId: session.user.email }),
      })
      if (response.ok) {
        const { orderId } = await response.json()
        window.location.href = `/api/payments/approve?orderId=${orderId}`
      } else {
        toast({ title: 'Error', description: 'Failed to create order. Please try again.', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast({ title: 'Error', description: 'An error occurred. Please try again.', variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
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
                suppressHydrationWarning
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
                  <Button variant="ghost" className={`rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all ${item.href === '/pricing' ? 'text-white border-white/10' : ''}`}>
                    {item.name}
                  </Button>
                </Link>
              ))}
              {mounted && discordUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-4 rounded-lg border border-white/5 hover:bg-white/5">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : undefined} />
                        <AvatarFallback>{discordUser.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">{discordUser.username}</span>
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
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex flex-col">
            <span className="text-teal-400 text-xs font-black uppercase tracking-[0.4em] mb-4">
              Premium Marketplace
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-white mb-8">
              Upgrade Your <br />
              <span className="text-gradient-primary">Experience</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Acquire coins, elite status, and exclusive collections to define your legacy in our world.
            </p>
          </div>
        </motion.div>

        {/* Shop Disabled Message */}
        {!shopEnabled && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mb-12">
            <div className="glass-card hud-border p-12 text-center rounded-lg">
              <ShoppingBag className="w-20 h-20 text-teal-500 mx-auto mb-6 opacity-50" />
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Transmission Interrupted</h3>
              <p className="text-slate-400 mb-8 font-medium">The marketplace is currently undergoing secure protocol updates.</p>
              <Link href="/"><Button className="btn-premium px-8 py-6 h-auto text-lg uppercase font-black tracking-widest">Return Home</Button></Link>
            </div>
          </motion.div>
        )}

        {shopEnabled && (
          <>
            {/* Category Filter */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-4 mb-16">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-500 ${selectedCategory === cat.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {selectedCategory === cat.id && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-teal-500/10 border border-teal-500/30 rounded-lg shadow-[0_0_20px_rgba(20,184,166,0.2)]" />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-xl group-hover:scale-125 transition-transform">{cat.icon}</span>
                    {cat.label}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className={`glass-card hud-border h-full flex flex-col relative rounded-lg overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${product.highlighted ? 'border-teal-500/50 shadow-[0_0_40px_rgba(20,184,166,0.15)]' : ''}`}>
                    {product.highlighted && (
                      <div className="absolute top-0 right-0 z-20">
                        <div className="bg-teal-500 text-white px-6 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                          <Crown className="w-3 h-3" />
                          Priority Selection
                        </div>
                      </div>
                    )}

                    <div className="h-48 relative flex items-center justify-center border-b border-white/5">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
                      <div className="relative z-10 text-8xl group-hover:scale-110 transition-transform duration-700 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{product.icon}</div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="mb-6">
                        <h3 className="text-2xl font-black text-white tracking-tighter mb-2 group-hover:text-teal-400 transition-colors uppercase">{product.name}</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">{product.description}</p>
                      </div>

                      <div className="mb-8 pb-8 border-b border-white/5">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-white tracking-tighter">${(product.price * (1 - (product.discountPercent ?? 0) / 100)).toFixed(2)}</span>
                          {product.discountPercent && (
                            <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest">-{product.discountPercent}%</span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 mb-8">
                        <ul className="space-y-4">
                          {product.features?.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 group/feature">
                              <Check className="mt-1 h-3 w-3 text-teal-500" />
                              <span className="text-sm text-slate-300 font-medium group-hover/feature:text-white transition-colors">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => handlePurchase(product.id)}
                        disabled={processingId === product.id}
                        className="btn-premium w-full py-8 h-auto text-base uppercase font-black tracking-widest shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                      >
                        {processingId === product.id ? 'Processing...' : 'Acquire Now'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Info Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="h-7 w-7" />, title: "Instant Deployment", desc: "Automated fulfillment protocols ensure items are deployed immediately after verification." },
            { icon: <Shield className="h-7 w-7" />, title: "Secure Operations", desc: "All acquisitions are processed via encrypted gateways with full protection guaranteed." },
            { icon: <Package className="h-7 w-7" />, title: "Priority Support", desc: "Dedicated support channels are open 24/7 for all premium account holders." },
          ].map((info, i) => (
            <div key={i} className="glass-card hud-border p-8 rounded-lg hover:translate-y-[-8px] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-lg bg-teal-500/10 flex items-center justify-center mb-6 border border-teal-500/20 group-hover:scale-110 transition-transform text-teal-400">{info.icon}</div>
              <h3 className="text-xl font-black text-white tracking-tighter mb-3 uppercase">{info.title}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{info.desc}</p>
            </div>
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
