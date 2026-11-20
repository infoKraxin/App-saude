// Cliente Supabase. Sem as variáveis EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY,
// o app roda em modo local: tudo funciona no aparelho e nada sobe (útil para testar telas).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Sessão guardada no cofre do sistema (Keystore/Keychain); na web, no localStorage.
const secure = {
  getItem: (k: string) => SecureStore.getItemAsync(k),
  setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  removeItem: (k: string) => SecureStore.deleteItemAsync(k),
};

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: Platform.OS === 'web' ? undefined : secure,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isLocalMode = () => !supabase;

export async function sendCode(email: string) {
  if (!supabase) return { error: null as string | null };
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  return { error: error ? 'Não foi possível enviar o código agora. Confira o e-mail e tente de novo em 1 minuto.' : null };
}

export async function verifyCode(email: string, token: string) {
  if (!supabase) return { error: null as string | null };
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  return { error: error ? 'Código incorreto ou vencido. Peça um novo.' : null };
}

// Plano vindo do quiz: o lead mais recente do e-mail confirmado.
export async function fetchQuizLead() {
  if (!supabase) return null;
  const { data } = await supabase.from('quiz_leads').select('*').order('created_at', { ascending: false }).limit(1);
  return data?.[0] ?? null;
}
