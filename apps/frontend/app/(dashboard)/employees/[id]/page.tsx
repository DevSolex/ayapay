'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { Employee, Payroll } from '@/types'

interface EmployeeWithPayrolls extends Employee {
  payrolls: Payroll[]
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  EXECUTED: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
  APPROVED: 'secondary',
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>()
  const toast = useToast()

  const { data: employee, isLoading } = useQuery<EmployeeWithPayrolls>({
    queryKey: ['employee', id],
    queryFn: async () => (await api.get(`/employees/${id}`)).data.data,
  })

  function copyAddress() {
    if (!employee) return
    navigator.clipboard.writeText(employee.walletAddress)
    toast({ title: 'Address copied', variant: 'success' })
  }

  if (isLoading) return <div className="h-64 bg-muted rounded-lg animate-pulse" />
  if (!employee) return <p className="text-muted-foreground">Employee not found.</p>

  const totalEarned = employee.payrolls
    .filter((p) => p.status === 'EXECUTED')
    .reduce((s, p) => s + Number(p.amount), 0)

  const executedCount = employee.payrolls.filter((p) => p.status === 'EXECUTED').length

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/employees" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {employee.name[0]}
              </div>
              <div>
                <CardTitle className="text-xl">{employee.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
                {employee.title && <p className="text-xs text-muted-foreground mt-0.5">{employee.title}</p>}
              </div>
            </div>
            <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'warning'}>{employee.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Salary</p>
              <p className="font-semibold text-base">{formatCurrency(employee.salary, employee.token)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Payment Frequency</p>
              <p className="font-medium capitalize">{employee.paymentFrequency.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Total Earned</p>
              <p className="font-semibold text-green-500">{formatCurrency(totalEarned, employee.token)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Payments Made</p>
              <p className="font-medium">{executedCount}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm">{shortenAddress(employee.walletAddress, 8)}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
                <a
                  href={`https://alfajores.celoscan.io/address/${employee.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {employee.payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No payments yet
                  </TableCell>
                </TableRow>
              ) : (
                employee.payrolls.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(p.amount), p.token)}</TableCell>
                    <TableCell>{p.token}</TableCell>
                    <TableCell><Badge variant={statusVariant[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.txHash ? (
                        <a
                          href={`https://alfajores.celoscan.io/tx/${p.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary underline"
                        >
                          {p.txHash.slice(0, 10)}...
                        </a>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
