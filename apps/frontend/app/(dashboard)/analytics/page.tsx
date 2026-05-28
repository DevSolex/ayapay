'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { Users, DollarSign, TrendingUp, Clock, Layers } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useChainStore } from '@/store/chain'

const CELO_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const STACKS_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa']

export default function AnalyticsPage() {
  const { activeChain } = useChainStore()
  const isStacks = activeChain === 'STACKS'

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data.data,
  })

  const celoTokenData = [
    { name: 'USDC', value: 65 },
    { name: 'USDT', value: 20 },
    { name: 'CELO', value: 10 },
    { name: 'cUSD', value: 5 },
  ]

  const stacksTokenData = [
    { name: 'STX', value: 75 },
    { name: 'USDA', value: 20 },
    { name: 'xBTC', value: 5 },
  ]

  const tokenData = isStacks ? stacksTokenData : celoTokenData
  const colors = isStacks ? STACKS_COLORS : CELO_COLORS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Analytics
          {isStacks && <Layers className="w-5 h-5 text-orange-400" />}
        </h1>
        <p className="text-muted-foreground">
          {isStacks ? 'Stacks payroll insights' : 'Celo payroll insights'} and spending overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.totalEmployees ?? 0} icon={Users} />
        <StatCard title="Monthly Payroll" value={formatCurrency(data?.monthlyPayrollTotal ?? 0, isStacks ? 'STX' : 'USDC')} icon={DollarSign} />
        <StatCard title="Total Sent" value={formatCurrency(data?.totalPayrollSent ?? 0, isStacks ? 'STX' : 'USDC')} icon={TrendingUp} />
        <StatCard title="Pending" value={data?.pendingPayrolls ?? 0} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <Card className={isStacks ? 'border-orange-500/20' : ''}>
          <CardHeader>
            <CardTitle className="text-base">Monthly Payroll (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.trend ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Total']}
                />
                <Bar
                  dataKey="total"
                  fill={isStacks ? '#f97316' : 'hsl(217.2 91.2% 59.8%)'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token distribution pie chart */}
        <Card className={isStacks ? 'border-orange-500/20' : ''}>
          <CardHeader>
            <CardTitle className="text-base">
              Token Distribution — {isStacks ? 'Stacks' : 'Celo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tokenData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {tokenData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Chain comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chain Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${!isStacks ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="font-medium text-sm">Celo</span>
                <span className="text-xs text-muted-foreground ml-auto">Live</span>
              </div>
              <p className="text-xs text-muted-foreground">USDC · cUSD · USDT · CELO</p>
              <p className="text-xs text-muted-foreground mt-1">EVM compatible · Alfajores testnet</p>
            </div>
            <div className={`p-4 rounded-lg border ${isStacks ? 'border-orange-500/30 bg-orange-500/5' : 'border-border'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="font-medium text-sm">Stacks</span>
                <span className="text-xs text-muted-foreground ml-auto">Live</span>
              </div>
              <p className="text-xs text-muted-foreground">STX · USDA · xBTC</p>
              <p className="text-xs text-muted-foreground mt-1">Clarity smart contracts · Mainnet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
