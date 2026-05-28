'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { useChainStore } from '@/store/chain'
import { useWalletStore } from '@/store/wallet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { isContractPaused, getContractAdmin } from '@/lib/stacks-contract'
import { Layers, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'

function StacksAdminPanel() {
  const { stacksAddress } = useWalletStore()
  const toast = useToast()

  const { data: paused, isLoading: pausedLoading, refetch } = useQuery({
    queryKey: ['stacks-paused'],
    queryFn: isContractPaused,
    refetchInterval: 30_000,
  })

  const { data: admin, isLoading: adminLoading } = useQuery({
    queryKey: ['stacks-admin'],
    queryFn: getContractAdmin,
  })

  function handlePauseToggle() {
    if (!stacksAddress) {
      toast({ title: 'Wallet required', description: 'Connect your Stacks wallet to manage the contract.', variant: 'destructive' })
      return
    }
    toast({
      title: `Contract ${paused ? 'Resume' : 'Pause'} — Action Required`,
      description: 'Open your Leather/Hiro wallet to sign the transaction.',
    })
  }

  return (
    <Card className="border-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" />
          Stacks Contract Admin
        </CardTitle>
        <CardDescription>Manage the deployed ayapay.clar smart contract on Stacks mainnet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stacksAddress && (
          <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 text-orange-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Connect your Stacks wallet to enable admin actions.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Contract Status</p>
            {pausedLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <div className={`font-semibold flex items-center gap-2 ${paused ? 'text-red-400' : 'text-green-400'}`}>
                {paused ? <ShieldX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {paused ? 'Paused' : 'Active'}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Admin Principal</p>
            {adminLoading ? (
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-xs font-mono truncate">{admin ? String(admin).slice(0, 20) + '...' : '—'}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseToggle}
            disabled={!stacksAddress || pausedLoading}
            className={paused
              ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
              : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
            }
          >
            {paused ? <ShieldCheck className="w-4 h-4 mr-2" /> : <ShieldX className="w-4 h-4 mr-2" />}
            {paused ? 'Resume Contract' : 'Pause Contract'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        <div className="pt-2 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Contract Info</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Name: <span className="font-mono text-foreground">ayapay.clar</span></p>
            <p>Network: <span className="text-orange-400">Stacks Mainnet</span></p>
            <p>Features: Employee CRUD · STX payments · SIP-010 tokens · Batch payroll</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { activeChain } = useChainStore()
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and company settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue={user?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input defaultValue={user?.role} disabled />
            </div>
            <Button type="submit">{saved ? 'Saved!' : 'Save changes'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
          <CardDescription>Your company details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input defaultValue={user?.company?.name} />
          </div>
          <div className="space-y-2">
            <Label>Active Chain</Label>
            <Input defaultValue={activeChain} disabled />
          </div>
          <Button>Update company</Button>
        </CardContent>
      </Card>

      {/* Stacks admin panel always visible */}
      <StacksAdminPanel />
    </div>
  )
}
