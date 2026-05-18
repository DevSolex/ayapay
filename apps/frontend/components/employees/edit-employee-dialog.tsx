'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Employee } from '@/types'

interface Props { employee: Employee | null; onClose: () => void }

const TOKENS = ['USDC', 'USDT', 'CELO', 'cUSD']
const FREQUENCIES = ['WEEKLY', 'BIWEEKLY', 'MONTHLY']

export function EditEmployeeDialog({ employee, onClose }: Props) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', title: '', salary: '', token: 'USDC', paymentFrequency: 'MONTHLY' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        title: employee.title ?? '',
        salary: String(employee.salary),
        token: employee.token,
        paymentFrequency: employee.paymentFrequency,
      })
      setError('')
    }
  }, [employee])

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.put(`/employees/${employee!.id}`, { ...data, salary: parseFloat(data.salary) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: 'Employee updated', variant: 'success' })
      onClose()
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Update failed')
    },
  })

  function set(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })) }

  if (!employee) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-semibold">Edit Employee</h2>
        <p className="text-sm text-muted-foreground">{employee.email}</p>
        {error && <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2">
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Title</Label>
            <Input placeholder="Engineer" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Salary</Label>
            <Input type="number" min="0" value={form.salary} onChange={(e) => set('salary', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Token</Label>
            <Select value={form.token} onValueChange={(v) => set('token', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TOKENS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Payment Frequency</Label>
            <Select value={form.paymentFrequency} onValueChange={(v) => set('paymentFrequency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
