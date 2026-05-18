'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const { user } = useAuthStore()
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
            <Label>Primary Chain</Label>
            <Input defaultValue="Celo" disabled />
          </div>
          <Button>Update company</Button>
        </CardContent>
      </Card>
    </div>
  )
}
