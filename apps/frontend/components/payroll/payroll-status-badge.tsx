import { Badge } from '@/components/ui/badge'
import type { PayrollStatus } from '@/types'

const variantMap: Record<PayrollStatus, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  EXECUTED:  'success',
  PENDING:   'warning',
  APPROVED:  'outline',
  FAILED:    'destructive',
  CANCELLED: 'secondary',
}

interface PayrollStatusBadgeProps {
  status: PayrollStatus
}

export function PayrollStatusBadge({ status }: PayrollStatusBadgeProps) {
  return <Badge variant={variantMap[status]}>{status}</Badge>
}
