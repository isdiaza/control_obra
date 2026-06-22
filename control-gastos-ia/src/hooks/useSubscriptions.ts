import { useState, useEffect, useCallback, useMemo } from 'react';
import { dbService } from '@/lib/dbService';
import { Subscription } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dbService.getSubscriptions();
      setSubscriptions(data);
    } catch (err: unknown) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las herramientas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      if (user) {
        fetchSubscriptions();
      } else {
        setSubscriptions([]);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user, fetchSubscriptions]);

  const addSubscription = async (
    subData: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    setError(null);
    try {
      const newSub = await dbService.createSubscription(subData);
      setSubscriptions(prev => [newSub, ...prev]);
      return newSub;
    } catch (err: unknown) {
      console.error('Error creating subscription:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el registro.');
      throw err;
    }
  };

  const updateSubscription = async (
    id: string,
    subData: Partial<Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => {
    setError(null);
    try {
      const updated = await dbService.updateSubscription(id, subData);
      setSubscriptions(prev => prev.map(s => (s.id === id ? updated : s)));
      return updated;
    } catch (err: unknown) {
      console.error('Error updating subscription:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el registro.');
      throw err;
    }
  };

  const deleteSubscription = async (id: string) => {
    setError(null);
    try {
      await dbService.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting subscription:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el registro.');
      throw err;
    }
  };

  // ==========================================
  // KPI CALCULATIONS (Unified in MXN, converting USD if needed)
  // ==========================================
  const conversionRate = 18; // 1 USD = 18 MXN (Fixed rate for WOW dashboard unifications)

  const stats = useMemo(() => {
    let activeCount = 0;
    let totalMonthlyMXN = 0;
    const categorySpend: Record<string, number> = {};
    let highestCategory = 'Ninguna';
    let highestSpend = 0;

    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;

      activeCount++;

      // Convert cost to monthly equivalent
      const costInOriginalCurrency = sub.cost;
      let monthlyCost = costInOriginalCurrency;

      if (sub.billingCycle === 'yearly') {
        monthlyCost = costInOriginalCurrency / 12;
      } else if (sub.billingCycle === 'weekly') {
        monthlyCost = costInOriginalCurrency * 4.33;
      } else if (sub.billingCycle === 'one-time') {
        monthlyCost = 0; // One-time costs don't count towards recurring monthly budgets
      }

      // Convert to MXN
      const monthlyCostMXN = sub.currency === 'USD' ? monthlyCost * conversionRate : monthlyCost;
      totalMonthlyMXN += monthlyCostMXN;

      // Add to category metrics
      const category = sub.category || 'Otros';
      categorySpend[category] = (categorySpend[category] || 0) + monthlyCostMXN;
    });

    // Find highest category of spend
    Object.entries(categorySpend).forEach(([cat, spend]) => {
      if (spend > highestSpend) {
        highestSpend = spend;
        highestCategory = cat;
      }
    });

    return {
      activeCount,
      totalMonthlyMXN,
      totalYearlyMXN: totalMonthlyMXN * 12,
      highestCategory,
      highestCategorySpendMXN: highestSpend,
      categorySpend,
    };
  }, [subscriptions]);

  return {
    subscriptions,
    loading,
    error,
    stats,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refresh: fetchSubscriptions,
  };
};
