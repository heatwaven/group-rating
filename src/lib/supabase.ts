import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } },
);

export type Category = 'food' | 'cafe' | 'bar' | 'streetfood' | 'other';
export type Group = {
  id: string; name: string; description: string | null; is_public: boolean; invite_code: string; owner_id: string;
  emoji: string; category: Category; allow_member_invite: boolean; max_members: number | null;
};
export type GroupWithCount = Group & { group_members: { count: number }[] };
export type Item = { id: string; group_id: string; name: string };
export type Rating = {
  id: string; item_id: string; user_id: string; stars: number; comment: string | null; created_at: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
};

export const memberCount = (g: GroupWithCount) => g.group_members?.[0]?.count ?? 0;
