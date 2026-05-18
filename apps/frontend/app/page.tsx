import Link from 'next/link'
import { ArrowRight, Zap, Globe, Shield, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Zap, title: 'Instant Payments', desc: 'Pay your team in seconds, not days. No bank delays.' },
  { icon: Globe, title: 'Global Reach', desc: 'Pay anyone, anywhere in the world with stablecoins.' },
  { icon: Shield, title: 'Transparent & Secure', desc: 'Every payment recorded on-chain. Full audit trail.' },
  { icon: Clock, title: 'Automated Payroll', desc: 'Set it and forget it. Monthly payroll runs automatically.' },
]

const chains = [
  { name: 'Celo', status: 'Live', color: 'text-green-400' },
  { name: 'Base', status: 'Coming Soon', color: 'text-gray-400' },
  { name: 'Ethereum', status: 'Coming Soon', color: 'text-gray-400' },
]

const testimonials = [
  { name: 'Sarah K.', role: 'CTO, RemoteFirst', text: 'AyaPay cut our payroll processing time from 3 days to 30 seconds.' },
  { name: 'David M.', role: 'Founder, DAO Labs', text: 'Finally a payroll tool built for Web3 teams. Our contributors love it.' },
  { name: 'Amara O.', role: 'HR Lead, TechAfrica', text: 'No more currency conversion headaches. We pay in USDC on Celo and everyone is happy.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">AyaPay</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link href="/register"><Button size="sm">Get started</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm text-muted-foreground mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Now live on Celo Alfajores Testnet
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Crypto Payroll for<br />
          <span className="text-primary">Global Teams</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Pay your remote team in USDC, USDT, CELO, or cUSD. Instant, borderless, and fully transparent on the Celo blockchain.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">View demo</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why AyaPay?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-lg border bg-card space-y-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Chains */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Multi-Chain Support</h2>
        <p className="text-muted-foreground mb-10">Built on Celo, expanding to more chains soon.</p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {chains.map(({ name, status, color }) => (
            <div key={name} className="flex items-center gap-2 px-4 py-2 rounded-full border">
              <span className={`font-semibold ${color}`}>{name}</span>
              <span className="text-xs text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Loved by teams worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text }) => (
            <div key={name} className="p-6 rounded-lg border bg-card space-y-4">
              <p className="text-sm text-muted-foreground">&ldquo;{text}&rdquo;</p>
              <div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to modernize payroll?</h2>
        <p className="text-muted-foreground mb-8">Join hundreds of companies paying their teams in crypto on Celo.</p>
        <Link href="/register">
          <Button size="lg" className="gap-2">
            Get started free <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 AyaPay. Built on Celo. MIT License.</p>
      </footer>
    </div>
  )
}
