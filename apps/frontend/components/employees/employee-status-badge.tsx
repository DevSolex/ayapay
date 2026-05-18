import { Badge } from '@/components/ui/badge'
import type { EmployeeStatus } from '@/types'

const variantMap: Record<EmployeeStatus, 'success' | 'warning' | 'destructive'> = {
  ACTIVE:     'success',
  SUSPENDED:  'warning',
  TERMINATED: 'destructive',
}

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus
}

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return <Badge variant={variantMap[status]}>{status}</Badge>
}
