import { supabase, isSupabaseConfigured } from './supabase';
import { Subscription } from '../types';

interface DatabaseSubscription {
  id: string;
  user_id: string;
  name: string;
  category: string;
  cost: string | number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'one-time';
  status: 'active' | 'paused' | 'cancelled';
  next_billing_date?: string;
  started_at?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Mock DB Key Constants
const MOCK_USERS_KEY = 'ia_expenses_mock_users';
const MOCK_CURRENT_USER_KEY = 'ia_expenses_mock_current_user';
const MOCK_SUBS_KEY = 'ia_expenses_mock_subscriptions';

interface MockUser {
  id: string;
  email: string;
  password?: string; // in a real app, do not store plain passwords, but for a local storage mock it is fine
  fullName: string;
}

// Log configuration status
if (!isSupabaseConfigured) {
  console.warn(
    'Supabase no está configurado (falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY). Usando Base de Datos local (LocalStorage).'
  );
}

export const dbService = {
  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================
  async signUp(email: string, password: string, fullName: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      return data.user;
    } else {
      // LocalStorage Mock
      const users: MockUser[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('El correo ya está registrado.');
      }
      const newUser: MockUser = {
        id: `usr_${Date.now()}`,
        email,
        password,
        fullName,
      };
      users.push(newUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      
      // Auto login
      localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(newUser));
      return { id: newUser.id, email: newUser.email, user_metadata: { full_name: newUser.fullName } };
    }
  },

  async signIn(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    } else {
      // LocalStorage Mock
      const users: MockUser[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!user) {
        throw new Error('Credenciales inválidas o correo no registrado.');
      }
      localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user));
      return { id: user.id, email: user.email, user_metadata: { full_name: user.fullName } };
    }
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(MOCK_CURRENT_USER_KEY);
    }
  },

  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || 'Usuario',
        avatarUrl: user.user_metadata?.avatar_url,
      };
    } else {
      const userJson = localStorage.getItem(MOCK_CURRENT_USER_KEY);
      if (!userJson) return null;
      const user: MockUser = JSON.parse(userJson);
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      };
    }
  },

  // ==========================================
  // SUBSCRIPTIONS (CRUD) METHODS
  // ==========================================
  async getSubscriptions(): Promise<Subscription[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Map database snake_case keys to camelCase
      return (data || []).map((sub: DatabaseSubscription) => ({
        id: sub.id,
        userId: sub.user_id,
        name: sub.name,
        category: sub.category,
        cost: Number(sub.cost),
        currency: sub.currency,
        billingCycle: sub.billing_cycle,
        status: sub.status,
        nextBillingDate: sub.next_billing_date,
        startedAt: sub.started_at,
        description: sub.description,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      }));
    } else {
      // LocalStorage Mock
      const allSubs: Subscription[] = JSON.parse(localStorage.getItem(MOCK_SUBS_KEY) || '[]');
      // Filter subscriptions belonging to current mock user
      const userSubs = allSubs.filter(sub => sub.userId === user.id);
      
      // If empty and it's a new user, seed with some high-quality mock data for a WOW experience!
      if (userSubs.length === 0) {
        const seededSubs: Subscription[] = [
          {
            id: `sub_1`,
            userId: user.id,
            name: 'ChatGPT Plus',
            category: 'Generación de Texto',
            cost: 20.00,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'active',
            nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startedAt: '2026-01-10',
            description: 'Acceso prioritario y GPT-4o para redacción y análisis.',
          },
          {
            id: `sub_2`,
            userId: user.id,
            name: 'GitHub Copilot',
            category: 'Asistente de Código',
            cost: 10.00,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'active',
            nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startedAt: '2026-02-15',
            description: 'Autocompletado y sugerencias de código IA.',
          },
          {
            id: `sub_3`,
            userId: user.id,
            name: 'Midjourney',
            category: 'Generación de Imágenes',
            cost: 30.00,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'active',
            nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startedAt: '2026-03-01',
            description: 'Plan estándar para generación de imágenes conceptuales.',
          },
          {
            id: `sub_4`,
            userId: user.id,
            name: 'Claude Pro',
            category: 'Generación de Texto',
            cost: 20.00,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'paused',
            nextBillingDate: undefined,
            startedAt: '2026-04-01',
            description: 'Modelos Claude 3.5 Sonnet para análisis avanzado de código.',
          },
          {
            id: `sub_5`,
            userId: user.id,
            name: 'Cursor AI',
            category: 'Asistente de Código',
            cost: 20.00,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'active',
            nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startedAt: '2026-05-10',
            description: 'Editor de código optimizado con IA.',
          },
          {
            id: `sub_6`,
            userId: user.id,
            name: 'Vercel Pro',
            category: 'Desarrollo / Hosting',
            cost: 20.00,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'active',
            nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startedAt: '2026-01-20',
            description: 'Hosting y pipelines CI/CD de producción.',
          }
        ];
        
        const remainingSubs = allSubs.filter(sub => sub.userId !== user.id);
        const finalSubs = [...remainingSubs, ...seededSubs];
        localStorage.setItem(MOCK_SUBS_KEY, JSON.stringify(finalSubs));
        return seededSubs;
      }
      return userSubs;
    }
  },

  async createSubscription(subData: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado.');

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          name: subData.name,
          category: subData.category,
          cost: subData.cost,
          currency: subData.currency,
          billing_cycle: subData.billingCycle,
          status: subData.status,
          next_billing_date: subData.nextBillingDate || null,
          started_at: subData.startedAt || null,
          description: subData.description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        category: data.category,
        cost: Number(data.cost),
        currency: data.currency,
        billingCycle: data.billing_cycle,
        status: data.status,
        nextBillingDate: data.next_billing_date,
        startedAt: data.started_at,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      // LocalStorage Mock
      const allSubs: Subscription[] = JSON.parse(localStorage.getItem(MOCK_SUBS_KEY) || '[]');
      const newSub: Subscription = {
        ...subData,
        id: `sub_${Date.now()}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allSubs.push(newSub);
      localStorage.setItem(MOCK_SUBS_KEY, JSON.stringify(allSubs));
      return newSub;
    }
  },

  async updateSubscription(
    id: string,
    subData: Partial<Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Subscription> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado.');

    if (isSupabaseConfigured && supabase) {
      // Map camelCase keys back to snake_case for PostgreSQL
      const mappedData: Record<string, unknown> = {};
      if (subData.name !== undefined) mappedData.name = subData.name;
      if (subData.category !== undefined) mappedData.category = subData.category;
      if (subData.cost !== undefined) mappedData.cost = subData.cost;
      if (subData.currency !== undefined) mappedData.currency = subData.currency;
      if (subData.billingCycle !== undefined) mappedData.billing_cycle = subData.billingCycle;
      if (subData.status !== undefined) mappedData.status = subData.status;
      if (subData.nextBillingDate !== undefined) mappedData.next_billing_date = subData.nextBillingDate || null;
      if (subData.startedAt !== undefined) mappedData.started_at = subData.startedAt || null;
      if (subData.description !== undefined) mappedData.description = subData.description || null;
      mappedData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('subscriptions')
        .update(mappedData)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure security check
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        category: data.category,
        cost: Number(data.cost),
        currency: data.currency,
        billingCycle: data.billing_cycle,
        status: data.status,
        nextBillingDate: data.next_billing_date,
        startedAt: data.started_at,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      // LocalStorage Mock
      const allSubs: Subscription[] = JSON.parse(localStorage.getItem(MOCK_SUBS_KEY) || '[]');
      const subIndex = allSubs.findIndex(sub => sub.id === id && sub.userId === user.id);
      if (subIndex === -1) throw new Error('Suscripción no encontrada.');
      
      const updatedSub: Subscription = {
        ...allSubs[subIndex],
        ...subData,
        updatedAt: new Date().toISOString(),
      };
      
      allSubs[subIndex] = updatedSub;
      localStorage.setItem(MOCK_SUBS_KEY, JSON.stringify(allSubs));
      return updatedSub;
    }
  },

  async deleteSubscription(id: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado.');

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure security check
      
      if (error) throw error;
      return true;
    } else {
      // LocalStorage Mock
      const allSubs: Subscription[] = JSON.parse(localStorage.getItem(MOCK_SUBS_KEY) || '[]');
      const subIndex = allSubs.findIndex(sub => sub.id === id && sub.userId === user.id);
      if (subIndex === -1) throw new Error('Suscripción no encontrada.');
      
      allSubs.splice(subIndex, 1);
      localStorage.setItem(MOCK_SUBS_KEY, JSON.stringify(allSubs));
      return true;
    }
  },
};
