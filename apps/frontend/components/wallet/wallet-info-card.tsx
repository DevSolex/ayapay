'use client'

import { Wallet, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { useWalletStore } from '@/store/wallet'
import { useCeloBalance } from '@/hooks/use-celo-balance'
import { addressUrl } from '@/lib/celo'

export function WalletInfoCard() {
  const { address, network, chainId } = useWalletStore()
  const { data: balances, isLoading } = useCeloBalance()

  if (!address) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Connected Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground truncate">{address}</span>
          <CopyButton value={address} />
          <a
            href={addressUrl(address, chainId ?? 44787)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        {network && (
          <p className="text-xs text-muted-foreground">Network: <span className="text-foreground font-medium">{network}</span></p>
        )}
        {isLoading ? (
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        ) : balances && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(balances).map(([token, balance]) => (
              <div key={token} className="text-xs">
                <span className="text-muted-foreground">{token}: </span>
                <span className="font-medium">{parseFloat(balance ?? '0').toFixed(4)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
