import { cn } from '@/lib/utils'

type Status = 'online' | 'offline' | 'pending' | 'error'

const statusColors: Record<Status, string> = {
  online: 'bg-green-400',
  offline: 'bg-gray-400',
  pending: 'bg-yellow-400',
  error: 'bg-red-400',
}

interface StatusDotProps {
  status: Status
  label?: string
  className?: string
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-2 h-2 rounded-full', statusColors[status])} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  )
}
