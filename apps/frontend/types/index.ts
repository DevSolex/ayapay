// Shared frontend types
export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'
export type PaymentToken = 'USDC' | 'USDT' | 'CELO' | 'cUSD'
export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
export type PayrollStatus = 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED' | 'CANCELLED'
export type EmployeeStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
export type SupportedChain = 'CELO' | 'BASE' | 'ETHEREUM' | 'STELLAR'

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
