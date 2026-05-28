'use client'

import { Wallet, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { useWalletStore } from '@/store/wallet'
import { useChainStore } from '@/store/chain'
import { useCeloBalance } from '@/hooks/use-celo-balance'
import { useStacksBalance } from '@/hooks/use-stacks-balance'
import { addressUrl } from '@/lib/celo'
import { stacksAddressUrl, shortenStacksAddress } from '@/lib/stacks'

export function WalletInfoCard() {
  const { address, network, chainId, stacksAddress, stacksNetwork } = useWalletStore()
  const { activeChain } = useChainStore()
  const { data: celoBalances, isLoading: celoLoading } = useCeloBalance()
  const { data: stacksBalances, isLoading: stacksLoading } = useStacksBalance(stacksAddress)

  const isStacks = activeChain === 'STACKS'
  const walletAddress = isStacks ? stacksAddress : address
  const walletNetwork = isStacks ? stacksNetwork : network
  const isLoading = isStacks ? stacksLoading : celoLoading

  if (!walletAddress) return null

  const explorerUrl = isStacks
    ? stacksAddressUrl(walletAddress)
    : addressUrl(walletAddress, chainId ?? 44787)

  const balances = isStacks
    ? stacksBalances
      ? { STX: stacksBalances.STX, 'Locked STX': stacksBalances.locked }
      : null
    : celoBalances

  return (
    <Card className={isStacks ? 'border-orange-500/20' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className={`w-4 h-4 ${isStacks ? 'text-orange-400' : ''}`} />
          Connected Wallet
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            isStacks
              ? 'bg-orange-500/10 text-orange-400'
              : 'bg-green-500/10 text-green-400'
          }`}>
            {isStacks ? 'Stacks' : 'Celo'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground truncate">{walletAddress}</span>
          <CopyButton value={walletAddress} />
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        {walletNetwork && (
          <p className="text-xs text-muted-foreground">Network: <span className="text-foreground font-medium">{walletNetwork}</span></p>
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
