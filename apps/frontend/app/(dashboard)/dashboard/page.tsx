'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, DollarSign, Clock, TrendingUp, AlertTriangle, ShieldCheck, Zap, Layers } from 'lucide-react'
import api from '@/lib/api'
import { StatCard } from '@/components/dashboard/stat-card'
import { PayrollTrendChart } from '@/components/dashboard/payroll-trend-chart'
import { WalletInfoCard } from '@/components/wallet/wallet-info-card'
import { formatCurrency } from '@/lib/utils'
import { useChainStore } from '@/store/chain'
import { useWalletStore } from '@/store/wallet'
import { isContractPaused, getContractAdmin } from '@/lib/stacks-contract'
import type { AnalyticsOverview } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalyticsData extends AnalyticsOverview {
  trend: { month: string; total: number }[]
}

function StacksDashboard() {
  const { stacksAddress } = useWalletStore()

  const { data: paused, isLoading: pausedLoading } = useQuery({
    queryKey: ['stacks-paused'],
    queryFn: isContractPaused,
    refetchInterval: 60_000,
  })

  const { data: admin, isLoading: adminLoading } = useQuery({
    queryKey: ['stacks-admin'],
    queryFn: getContractAdmin,
    refetchInterval: 300_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6 text-orange-400" />
          Stacks Dashboard
        </h1>
        <p className="text-muted-foreground">Live data from the ayapay.clar contract on Stacks mainnet</p>
      </div>

      {!stacksAddress && (
        <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/5 text-orange-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Connect your Stacks wallet (Leather / Hiro) to interact with the contract.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-orange-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contract Status</CardTitle>
            <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            {pausedLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className={`text-2xl font-bold ${paused ? 'text-red-400' : 'text-green-400'}`}>
                {paused ? 'Paused' : 'Active'}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">On-chain contract state</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contract</CardTitle>
            <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold font-mono truncate text-orange-400">ayapay.clar</div>
            <p className="text-xs text-muted-foreground mt-1">Stacks Mainnet</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admin</CardTitle>
            <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-sm font-mono truncate text-muted-foreground">{admin ? String(admin).slice(0, 16) + '...' : '—'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Contract admin principal</p>
          </CardContent>
        </Card>
      </div>

      <WalletInfoCard />

      <div className="p-6 rounded-lg border border-orange-500/20 bg-orange-500/5 space-y-2">
        <h3 className="font-semibold text-orange-400">Stacks Contract Features</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Employee management (add / update / remove)</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Pay via SIP-010 fungible tokens</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Native STX payments</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Batch STX payroll (up to 100 recipients)</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Emergency pause / resume controls</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />On-chain event logging for all mutations</li>
        </ul>
      </div>
    </div>
  )
}

function CeloDashboard() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview')
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Celo payroll operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.totalEmployees ?? 0} description={`${data?.activeEmployees ?? 0} active`} icon={Users} />
        <StatCard title="Monthly Payroll" value={formatCurrency(data?.monthlyPayrollTotal ?? 0, 'USDC')} description="This month" icon={DollarSign} />
        <StatCard title="Total Sent" value={formatCurrency(data?.totalPayrollSent ?? 0, 'USDC')} description="All time" icon={TrendingUp} />
        <StatCard title="Pending Payrolls" value={data?.pendingPayrolls ?? 0} description="Awaiting execution" icon={Clock} />
      </div>

      {data?.trend && <PayrollTrendChart data={data.trend} />}
      <WalletInfoCard />
    </div>
  )
}

export default function DashboardPage() {
  const { activeChain } = useChainStore()
  return activeChain === 'STACKS' ? <StacksDashboard /> : <CeloDashboard />
}
