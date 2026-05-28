// Shared frontend types
export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'
export type PaymentToken = 'USDC' | 'USDT' | 'CELO' | 'cUSD' | 'STX'
export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
export type PayrollStatus = 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED' | 'CANCELLED'
export type EmployeeStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
export type SupportedChain = 'CELO' | 'STACKS' | 'BASE' | 'ETHEREUM' | 'STELLAR'

/** Stacks on-chain employee record from ayapay.clar */
export interface StacksEmployee {
  wallet: string
  salary: number
  token: string
  active: boolean
}

/** Chain metadata for display */
export interface ChainInfo {
  id: SupportedChain
  name: string
  icon: string
  color: string
  explorer: string
  status: 'live' | 'coming-soon'
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  companyId?: string
  company?: { id: string; name: string }
}

export interface Employee {
  id: string
  companyId: string
  name: string
  email: string
  walletAddress: string
  title?: string
  salary: number
  token: PaymentToken
  paymentFrequency: PaymentFrequency
  status: EmployeeStatus
  createdAt: string
}

export interface Payroll {
  id: string
  companyId: string
  employeeId: string
  employee?: Employee
  amount: number
  token: PaymentToken
  txHash?: string
  status: PayrollStatus
  chain: SupportedChain
  paymentDate: string
  executedAt?: string
  createdAt: string
}

export interface AnalyticsOverview {
  totalEmployees: number
  monthlyPayrollTotal: number
  totalPayrollSent: number
  pendingPayrolls: number
  activeEmployees: number
}
