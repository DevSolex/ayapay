'use client'

import { useQuery } from '@tanstack/react-query'
import { DollarSign, Calendar, Wallet, TrendingUp } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useWalletStore } from '@/store/wallet'
import { StatCard } from '@/components/dashboard/stat-card'
import { WalletButton } from '@/components/wallet/wallet-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payroll } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  EXECUTED: 'success', PENDING: 'warning', FAILED: 'destructive', CANCELLED: 'secondary', APPROVED: 'secondary',
}

export default function EmployeePortalPage() {
  const { user } = useAuthStore()
  const { address } = useWalletStore()

  const { data: payrolls = [] } = useQuery<Payroll[]>({
    queryKey: ['my-payrolls'],
    queryFn: async () => (await api.get('/payroll')).data.data,
  })

  const totalEarned = payrolls.filter(p => p.status === 'EXECUTED').reduce((s, p) => s + Number(p.amount), 0)
  const nextPayment = payrolls.find(p => p.status === 'PENDING' || p.status === 'APPROVED')
  const lastPayment = payrolls.find(p => p.status === 'EXECUTED')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Your payroll overview</p>
        </div>
        <WalletButton />
      </div>

      {!address && (
        <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm">
          Connect your wallet to receive payments directly to your Celo address.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Earned" value={formatCurrency(totalEarned, 'USDC')} icon={TrendingUp} />
        <StatCard title="Last Payment" value={lastPayment ? formatCurrency(Number(lastPayment.amount), lastPayment.token) : '—'} icon={DollarSign} />
        <StatCard title="Next Payment" value={nextPayment ? formatDate(nextPayment.paymentDate) : 'None scheduled'} icon={Calendar} />
        <StatCard title="Wallet" value={address ? `${address.slice(0, 6)}...` : 'Not connected'} icon={Wallet} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No payments yet</TableCell></TableRow>
              ) : payrolls.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.paymentDate)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(p.amount), p.token)}</TableCell>
                  <TableCell>{p.token}</TableCell>
                  <TableCell><Badge variant={statusVariant[p.status]}>{p.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.txHash ? `${p.txHash.slice(0, 10)}...` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
