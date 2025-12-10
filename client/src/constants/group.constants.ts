// Constants for Group components
export const PAYMENT_METHODS = {
  UPI: 'UPI',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
} as const;

export const BALANCE_STATUS = {
  OWED: 'owed',
  OWES: 'owes',
  SETTLED: 'settled',
} as const;

export const SETTLEMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export const TABS = {
  EXPENSES: 'expenses',
  BALANCES: 'balances',
  SETTLEMENTS: 'settlements',
} as const;

export const API_ENDPOINTS = {
  GROUPS: '/api/groups',
  SETTLEMENTS: '/api/settlements',
  UPI_LINK: '/upi-link',
  PAY: '/pay',
  REQUEST: '/request',
} as const;