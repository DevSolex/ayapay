'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, CheckCircle, XCircle, Zap, ExternalLink, Layers } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useChainStore } from '@/store/chain'
import { stacksTxUrl } from '@/lib/stacks'
import type { Payroll } from '@/types'
import { CreatePayrollDialog } from '@/components/payroll/create-payroll-dialog'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  EXECUTED: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
  APPROVED: 'outline',
}

function TxLink({ txHash, chain }: { txHash: string; chain?: string }) {
  const isStacks = chain === 'STACKS'
  const url = isStacks
    ? stacksTxUrl(txHash)
    : `https://alfajores.celoscan.io/tx/${txHash}`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="hover:text-primary underline inline-flex items-center gap-1">
      {txHash.slice(0, 8)}...
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

export default function PayrollPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()
  const { activeChain } = useChainStore()
  const isStacks = activeChain === 'STACKS'

  const { data: payrolls = [], isLoading } = useQuery<Payroll[]>({
    queryKey: ['payrolls', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      return (await api.get(`/payroll${params}`)).data.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      toast({ title: 'Payroll approved', variant: 'success' })
    },
  })

  const executeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/${id}/execute`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      const ok = res.data?.success
      toast({
        title: ok ? 'Payment executed' : 'Payment failed',
        description: ok ? `Tx: ${res.data?.data?.txHash?.slice(0, 12)}...` : res.data?.error,
        variant: ok ? 'success' : 'destructive',
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/payroll/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      toast({ title: 'Payroll cancelled' })
    },
  })

  const bulkMutation = useMutation({
    mutationFn: () => api.post('/payroll/bulk-execute'),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      const { succeeded, failed } = res.data?.data ?? {}
      toast({
        title: 'Bulk execution complete',
        description: `${succeeded} succeeded, ${failed} failed`,
        variant: failed > 0 ? 'default' : 'success',
      })
    },
  })

  const pending = payrolls.filter((p) => p.status === 'PENDING' || p.status === 'APPROVED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Payroll
            {isStacks && <Layers className="w-5 h-5 text-orange-400" />}
          </h1>
          <p className="text-muted-foreground">{pending} pending payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => bulkMutation.mutate()}
            disabled={bulkMutation.isPending || pending === 0}
            className={isStacks ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' : ''}
          >
            <Zap className="w-4 h-4 mr-2" />
            {bulkMutation.isPending ? 'Running...' : 'Bulk Execute'}
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className={isStacks ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
          >
            <Plus className="w-4 h-4 mr-2" /> New Payroll
          </Button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'EXECUTED', 'FAILED'].map((s) => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
            onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </Button>
        ))}
      </div>

      <Card className={isStacks ? 'border-orange-500/20' : ''}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tx Hash</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    No payrolls found. Create your first payroll to get started.
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.employee?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.employee?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(p.amount), p.token)}</TableCell>
                    <TableCell>{p.token}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        p.chain === 'STACKS' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {p.chain}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell><Badge variant={statusVariant[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.txHash ? <TxLink txHash={p.txHash} chain={p.chain} /> : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.status === 'PENDING' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Approve"
                            onClick={() => approveMutation.mutate(p.id)}>
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          </Button>
                        )}
                        {p.status === 'APPROVED' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Execute"
                            onClick={() => executeMutation.mutate(p.id)} disabled={executeMutation.isPending}>
                            <Play className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        )}
                        {(p.status === 'PENDING' || p.status === 'APPROVED') && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Cancel"
                            onClick={() => cancelMutation.mutate(p.id)}>
                            <XCircle className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreatePayrollDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
