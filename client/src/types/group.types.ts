// Types for Group-related components
export interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  status: 'owed' | 'owes' | 'settled';
}

export interface Settlement {
  _id: string;
  fromUserId: { _id: string; name: string; email: string };
  toUserId: { _id: string; name: string; email: string };
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: Date;
  createdAt: string;
}

export interface GroupMember {
  userId: { 
    _id: string; 
    name: string; 
    email: string; 
    upiId?: string; 
    phoneNumber?: string 
  };
  role: string;
}

export interface GroupExpense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  userId: { _id: string; name: string };
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  expenses: GroupExpense[];
}

export type TabType = 'expenses' | 'balances' | 'settlements' | 'members';