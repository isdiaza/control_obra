export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  category: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'one-time';
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate?: string; // YYYY-MM-DD
  startedAt?: string; // YYYY-MM-DD
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
