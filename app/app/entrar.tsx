import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, T, Field, Button, Card } from '@/components/ui';
import { fetchQuizLead, isLocalMode, sendCode, verifyCode } from '@/lib/supabase';
import { setState } from '@/data/store';
import { leadToProfile, readLocalQuiz } from '@/lib/quizLead';
import { space } from '@/theme/tokens';

const okEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [wait, setWait] = useState(0);
  const local = isLocalMode();

  // Quem acabou de fazer o quiz já chega com o e-mail preenchido.
  useEffect(() => { readLocalQuiz().then((q) => q?.email && setEmail((e) => e || String(q.email))); }, []);

  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const finish = async () => {
    const lead = (await fetchQuizLead().catch(() => null)) ?? (await readLocalQuiz());
    const base = leadToProfile(lead, email.trim().toLowerCase());
    setState((s) => ({ ...s, profile: { ...base, ...(s.profile ?? {}), email: email.trim().toLowerCase(), onboarded: false } }));
    router.replace('/plano');
  };

  const send = async () => {
    if (!okEmail(email)) return setError('Digite um e-mail válido, como nome@email.com.');
    setBusy(true);
    setError(undefined);
    if (local) {
      setBusy(false);
      return finish();
    }
    const r = await sendCode(email.trim().toLowerCase());
    setBusy(false);
    if (r.error) return setError(r.error);
    setStep('code');
    setWait(60);
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return setError('O código tem 6 números.');
    setBusy(true);
    const r = await verifyCode(email.trim().toLowerCase(), code);
    setBusy(false);
    if (r.error) return setError(r.error);
    finish();
  };

  return (
    <Screen back title={step === 'email' ? 'Entrar' : 'Digite o código'}>
      {step === 'email' ? (
        <>
          <T v="h1" accessibilityRole="header" center>Qual é o seu e-mail?</T>
          <T tone="mut" center>Use o mesmo do quiz e o seu plano já aparece pronto. Você recebe um código, sem senha para lembrar.</T>
          <Field label="E-mail" value={email} onChangeText={(t) => { setEmail(t); setError(undefined); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="nome@email.com" error={error} onSubmitEditing={send} returnKeyType="send" />
          <Button label={busy ? 'Enviando...' : local ? 'Continuar' : 'Enviar código'} onPress={send} disabled={busy} />
          {local && (
            <Card tone="sunk">
              <T v="small" weight="semi">Modo local</T>
              <T v="small" tone="mut">O servidor ainda não está configurado nesta versão. Seus dados ficam só neste aparelho.</T>
            </Card>
          )}
        </>
      ) : (
        <>
          <T v="h1" accessibilityRole="header" center>Enviamos um código</T>
          <T tone="mut" center>Para {email.trim()}. Confira também a caixa de spam.</T>
          <Field label="Código de 6 números" value={code} onChangeText={(t) => { setCode(t.replace(/\D/g, '').slice(0, 6)); setError(undefined); }} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" error={error} onSubmitEditing={verify} />
          <Button label={busy ? 'Conferindo...' : 'Entrar'} onPress={verify} disabled={busy} />
          <View style={{ gap: space(2) }}>
            <Button kind="ghost" label={wait ? `Reenviar em ${wait} s` : 'Reenviar código'} disabled={!!wait} onPress={send} />
            <Button kind="ghost" label="Trocar e-mail" onPress={() => { setStep('email'); setCode(''); }} />
          </View>
        </>
      )}
    </Screen>
  );
}
