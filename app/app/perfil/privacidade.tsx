import React, { useState } from 'react';
import { Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, T, Group, ToggleRow, Row, Button, Card } from '@/components/ui';
import { exportData, setProfile, useApp, wipeAll } from '@/data/store';
import { supabase } from '@/lib/supabase';

export default function Privacidade() {
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const nLogs = useApp((s) => s.logs.length);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (!p) return null;
  const now = () => new Date().toISOString();
  const set = (k: 'ai' | 'analytics' | 'marketing' | 'community', v: boolean) => setProfile({ consents: { ...p.consents, [k]: v ? now() : undefined } });

  const doExport = async () => {
    const data = exportData();
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      a.download = 'evura-meus-dados.json';
      a.click();
      setMsg('Arquivo baixado.');
    } else {
      await Share.share({ title: 'Meus dados do Evura', message: data });
    }
  };

  const doDelete = async () => {
    if (supabase) await supabase.from('deletion_requests').insert({}).then(() => supabase!.auth.signOut());
    await wipeAll();
    router.replace('/boas-vindas');
  };

  return (
    <Screen back title="Privacidade e dados">
      <T tone="mut">Seus dados de saúde não são vendidos, não vão para anúncios e não treinam IA.</T>
      <Group title="Consentimentos" note="O primeiro é necessário para o app funcionar. Para retirá-lo, exclua a conta.">
        <Row label="Usar meus dados de saúde para gerar relatórios" value={p.consents.health ? 'Ativo' : 'Inativo'} />
        <ToggleRow label="Resumo sem nome para a IA escrever os textos" value={!!p.consents.ai} onChange={(v) => set('ai', v)} />
        <ToggleRow label="Medir o uso do app" desc="Sem dados de saúde." value={!!p.consents.analytics} onChange={(v) => set('analytics', v)} />
        <ToggleRow label="Novidades por e-mail" value={!!p.consents.marketing} onChange={(v) => set('marketing', v)} />
      </Group>
      <Group title="Seus dados">
        <Row label="O que guardamos" desc={`${nLogs} registros, seu perfil e suas preferências. ${supabase ? 'Guardados no aparelho e no servidor no Brasil.' : 'Guardados só neste aparelho.'}`} />
        <Row label="Exportar meus dados" desc="Arquivo com tudo que você registrou." onPress={doExport} />
      </Group>
      {msg && <T v="small" tone="mut" accessibilityLiveRegion="polite">{msg}</T>}
      <Group title="Excluir">
        <Row label="Excluir minha conta e meus dados" danger onPress={() => setConfirm(true)} />
      </Group>
      {confirm && (
        <Card style={{ borderWidth: 2 }}>
          <T weight="semi">Excluir tudo?</T>
          <T v="small">Seus registros, relatórios e perfil serão apagados deste aparelho agora e do servidor em até 30 dias. Isso não tem volta. Se você tem assinatura, cancele antes em Plano e assinatura.</T>
          <Button kind="danger" label="Excluir definitivamente" onPress={doDelete} />
          <Button kind="ghost" label="Manter minha conta" onPress={() => setConfirm(false)} />
        </Card>
      )}
      <Button kind="ghost" label="Política de privacidade e termos" onPress={() => router.push('/legal')} />
    </Screen>
  );
}
