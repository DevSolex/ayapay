'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useChainStore } from '@/store/chain'
import type { Employee } from '@/types'

interface Props { open: boolean; onClose: () => void }

const CELO_TOKENS = ['USDC', 'USDT', 'CELO', 'cUSD']
const STACKS_TOKENS = ['STX', 'USDA', 'xBTC']
const EMPTY = { employeeId: '', amount: '', token: 'USDC', paymentDate: '' }

export function CreatePayrollDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { activeChain } = useChainStore()
  const isStacks = activeChain === 'STACKS'
  const tokens = isStacks ? STACKS_TOKENS : CELO_TOKENS
  const [form, setForm] = useState({ ...EMPTY, token: tokens[0] })
  const [error, setError] = useState('')

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees-active'],
    queryFn: async () => (await api.get('/employees?status=ACTIVE')).data.data,
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/payroll', {
        ...data,
        amount: parseFloat(data.amount),
        paymentDate: new Date(data.paymentDate).toISOString(),
        chain: activeChain,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      toast({ title: 'Payroll created', description: 'Payment entry is pending approval.', variant: 'success' })
      onClose()
      setForm({ ...EMPTY, token: tokens[0] })
      setError('')
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create payroll')
    },
  })

  function set(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })) }

  function onEmployeeChange(id: string) {
    const emp = employees.find((e) => e.id === id)
    setForm((p) => ({ ...p, employeeId: id, amount: emp ? String(emp.salary) : p.amount, token: emp ? emp.token : p.token }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-card border rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl ${
        isStacks ? 'border-orange-500/20' : ''
      }`}>
        <div>
          <h2 className="text-lg font-semibold">Create Payroll</h2>
          {isStacks && <p className="text-xs text-orange-400 mt-0.5">Stacks chain · STX or SIP-010 tokens</p>}
        </div>
        {error && <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Employee</Label>
            <Select value={form.employeeId} onValueChange={onEmployeeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} — {e.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Amount</Label>
              <Input type="number" min="0" placeholder={isStacks ? '10' : '5000'} value={form.amount}
                onChange={(e) => set('amount', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Token</Label>
              <Select value={form.token} onValueChange={(v) => set('token', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tokens.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Payment Date</Label>
            <Input type="datetime-local" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} />
          </div>
          <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isStacks ? 'bg-orange-400' : 'bg-green-400'}`} />
            Chain: <span className="font-medium text-foreground">{activeChain}</span>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => { onClose(); setError('') }}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.employeeId || !form.amount || !form.paymentDate}
            className={isStacks ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
          >
            {mutation.isPending ? 'Creating...' : 'Create Payroll'}
          </Button>
        </div>
      </div>
    </div>
  )
}
