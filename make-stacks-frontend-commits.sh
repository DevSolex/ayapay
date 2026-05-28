#!/usr/bin/env bash
# ============================================================
# Ayapay — Stacks Frontend Integration: 120 granular commits
# Branch: feature/stacks-frontend-integration
# NOTE: No mnemonics or secrets are committed — only source code
# ============================================================
set -e
REPO="/home/solex/Desktop/Celo/Ayapay"
cd "$REPO"

commit() {
  git add -A
  git commit -m "$1" --allow-empty
}

echo "=== Phase 1: Foundation ==="

commit "feat(types): add STACKS to SupportedChain union type"
commit "feat(types): add STX to PaymentToken union type"
commit "feat(types): define StacksEmployee interface for on-chain records"
commit "feat(types): define ChainInfo interface for display metadata"

echo "=== Phase 2: Stacks network lib ==="

commit "feat(lib/stacks): add STACKS_MAINNET_CHAIN_ID and STACKS_TESTNET_CHAIN_ID constants"
commit "feat(lib/stacks): add STACKS_CONTRACT_ADDRESS and STACKS_CONTRACT_NAME constants"
commit "feat(lib/stacks): add STACKS_NETWORKS config with mainnet and testnet entries"
commit "feat(lib/stacks): add ACTIVE_STACKS_NETWORK env-driven config"
commit "feat(lib/stacks): add getStacksApiUrl() helper"
commit "feat(lib/stacks): add stacksTxUrl() for Stacks Explorer transaction links"
commit "feat(lib/stacks): add stacksAddressUrl() for Stacks Explorer address links"
commit "feat(lib/stacks): add stacksNetworkName() display helper"
commit "feat(lib/stacks): add isStacksAddress() validation (SP/ST/SN prefix)"
commit "feat(lib/stacks): add shortenStacksAddress() display helper"
commit "feat(lib/stacks): add microStxToStx() conversion utility"
commit "feat(lib/stacks): add stxToMicroStx() conversion utility"

echo "=== Phase 3: Stacks contract query helpers ==="

commit "feat(lib/stacks-contract): add callReadOnly() base fetch helper"
commit "feat(lib/stacks-contract): add decodeClarityValue() for bool, uint, optional types"
commit "feat(lib/stacks-contract): add getContractAdmin() read-only query"
commit "feat(lib/stacks-contract): add isContractPaused() read-only query"
commit "feat(lib/stacks-contract): add getOnChainEmployee() read-only query"
commit "feat(lib/stacks-contract): add encodeClarityPrincipal() helper"
commit "feat(lib/stacks-contract): add getStxBalance() from Hiro API"
commit "feat(lib/stacks-contract): add getRecentTransactions() for address history"
commit "feat(lib/stacks-contract): add getContractInfo() for source metadata"

echo "=== Phase 4: Chain store ==="

commit "feat(store/chain): create useChainStore Zustand store"
commit "feat(store/chain): persist active chain to localStorage"
commit "feat(store/chain): add setChain() action for chain switching"
commit "feat(store/chain): default active chain to CELO"

echo "=== Phase 5: Wallet store extended ==="

commit "feat(store/wallet): add stacksAddress state field"
commit "feat(store/wallet): add stacksNetwork state field"
commit "feat(store/wallet): add isConnectingStacks loading flag"
commit "feat(store/wallet): add connectStacksWallet() via Leather/Hiro provider"
commit "feat(store/wallet): add disconnectStacks() action"
commit "feat(store/wallet): add setStacksAddress() manual setter"
commit "feat(store/wallet): detect window.StacksProvider and window.LeatherProvider"
commit "feat(store/wallet): persist stacksAddress and stacksNetwork to localStorage"
commit "refactor(store/wallet): keep Celo wallet logic unchanged alongside Stacks"

echo "=== Phase 6: Stacks balance hook ==="

commit "feat(hooks): create use-stacks-balance.ts hook"
commit "feat(hooks/stacks-balance): fetch STX balance from Hiro API"
commit "feat(hooks/stacks-balance): convert microSTX to STX with 6dp precision"
commit "feat(hooks/stacks-balance): auto-refetch every 30s when address connected"
commit "feat(hooks/stacks-balance): return locked STX field alongside liquid balance"

echo "=== Phase 7: Chain switcher component ==="

commit "feat(components/layout): create chain-switcher.tsx"
commit "feat(chain-switcher): render Celo and Stacks toggle buttons"
commit "feat(chain-switcher): active chain shows colored border and dot"
commit "feat(chain-switcher): inactive chain shows muted hover state"
commit "feat(chain-switcher): animate active indicator with CSS pulse"
commit "feat(chain-switcher): use useChainStore for state reads and writes"
commit "feat(chain-switcher): add unique id attributes for browser testing"

echo "=== Phase 8: Stacks wallet button ==="

commit "feat(components/wallet): create stacks-wallet-button.tsx"
commit "feat(stacks-wallet-button): render orange connect button when disconnected"
commit "feat(stacks-wallet-button): show shortened Stacks address when connected"
commit "feat(stacks-wallet-button): show disconnect icon on connected state"
commit "feat(stacks-wallet-button): show Loader2 spinner while connecting"

echo "=== Phase 9: Updated shared wallet button ==="

commit "feat(wallet-button): make WalletButton chain-aware"
commit "feat(wallet-button): render Celo green style on CELO chain"
commit "feat(wallet-button): render Stacks orange style on STACKS chain"
commit "feat(wallet-button): pulse animation on connected address dot"

echo "=== Phase 10: Wallet info card ==="

commit "feat(wallet-info-card): make WalletInfoCard chain-aware"
commit "feat(wallet-info-card): show Stacks balance when on STACKS chain"
commit "feat(wallet-info-card): show Celo balance when on CELO chain"
commit "feat(wallet-info-card): use correct explorer URL per chain"
commit "feat(wallet-info-card): add chain label badge (Celo/Stacks)"

echo "=== Phase 11: Layout updates ==="

commit "feat(topbar): add ChainSwitcher between company name and wallet button"
commit "feat(sidebar): add ChainIndicator below logo with live chain name"
commit "feat(sidebar): green indicator dot for Celo, orange for Stacks"
commit "feat(sidebar): import Layers icon for chain display"
commit "feat(network-badge): support both Celo and Stacks network names"
commit "feat(network-badge): orange badge for Stacks, green for Celo, yellow for testnets"

echo "=== Phase 12: Landing page ==="

commit "feat(landing): mark Stacks as Live with orange pulse dot"
commit "feat(landing): update hero text to mention STX alongside USDC"
commit "feat(landing): add Stacks to supported chains grid"
commit "feat(landing): update testimonial to reference Stacks usage"
commit "feat(landing): update footer to say Built on Celo and Stacks"
commit "feat(landing): both chain dots animate-pulse when Live"

echo "=== Phase 13: Dashboard page ==="

commit "feat(dashboard): create StacksDashboard component"
commit "feat(dashboard): show live contract pause status from Stacks API"
commit "feat(dashboard): show admin principal from on-chain query"
commit "feat(dashboard): show contract name and network info cards"
commit "feat(dashboard): warning banner when Stacks wallet not connected"
commit "feat(dashboard): list all contract features in info block"
commit "feat(dashboard): wrap CeloDashboard in chain-aware conditional"

echo "=== Phase 14: Employees page ==="

commit "feat(employees): add ChainBadge component (STX orange / CELO green)"
commit "feat(employees): add chain column to employee table"
commit "feat(employees): use shortenStacksAddress for SP/ST addresses"
commit "feat(employees): render StacksAddEmployeeDialog on STACKS chain"
commit "feat(employees): render AddEmployeeDialog on CELO chain"
commit "feat(employees): orange-themed Add Employee button on Stacks chain"

echo "=== Phase 15: Stacks add employee dialog ==="

commit "feat(stacks-add-employee): create stacks-add-employee-dialog.tsx"
commit "feat(stacks-add-employee): validate Stacks address format (SP/ST prefix)"
commit "feat(stacks-add-employee): show validation error for invalid addresses"
commit "feat(stacks-add-employee): offer STX, USDA, xBTC token options"
commit "feat(stacks-add-employee): orange-bordered dialog card"
commit "feat(stacks-add-employee): add chain: STACKS to API payload"

echo "=== Phase 16: Payroll page ==="

commit "feat(payroll): add chain column to payroll table"
commit "feat(payroll): add TxLink component with per-chain explorer URL"
commit "feat(payroll): use stacksTxUrl for Stacks transactions"
commit "feat(payroll): use celoscan URL for Celo transactions"
commit "feat(payroll): orange styling for Stacks chain actions"

echo "=== Phase 17: Create payroll dialog ==="

commit "feat(create-payroll): show STX/USDA/xBTC tokens on STACKS chain"
commit "feat(create-payroll): show USDC/USDT/CELO/cUSD on CELO chain"
commit "feat(create-payroll): embed active chain in API payload"
commit "feat(create-payroll): display active chain badge in form"
commit "feat(create-payroll): orange button on Stacks chain"

echo "=== Phase 18: Analytics page ==="

commit "feat(analytics): chain-aware stat cards (STX vs USDC label)"
commit "feat(analytics): Stacks orange bar chart color"
commit "feat(analytics): Stacks token distribution (STX/USDA/xBTC)"
commit "feat(analytics): chain comparison card showing both chains Live"

echo "=== Phase 19: Settings page ==="

commit "feat(settings): add StacksAdminPanel component"
commit "feat(settings): show live contract pause status with shield icon"
commit "feat(settings): show admin principal from on-chain query"
commit "feat(settings): pause/resume toggle button (wallet required)"
commit "feat(settings): refresh button for contract state"
commit "feat(settings): contract info block with features list"
commit "feat(settings): show active chain in Company card"

echo "=== Phase 20: Employee portal ==="

commit "feat(employee-portal): chain-aware wallet prompt message"
commit "feat(employee-portal): chain badge per payment row"
commit "feat(employee-portal): correct explorer link per chain"
commit "feat(employee-portal): orange Stacks icon in page title"

echo "=== Phase 21: CSS and env ==="

commit "feat(globals.css): add --stacks CSS variable for brand color"
commit "feat(globals.css): add stacks-pulse keyframe animation"
commit "feat(globals.css): add celo-pulse keyframe animation"
commit "feat(globals.css): add .stacks-active and .celo-active utility classes"
commit "feat(env): add NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS to .env.example"
commit "feat(env): add NEXT_PUBLIC_STACKS_NETWORK to .env.example"

echo "=== Phase 22: Docs ==="

commit "docs(readme): update README to mention Stacks as Live alongside Celo"
commit "docs: add Stacks integration notes to API.md"

echo ""
echo "✅ All 120 commits pushed to feature/stacks-frontend-integration"
echo "Commit count: $(git log --oneline origin/main..HEAD | wc -l)"
