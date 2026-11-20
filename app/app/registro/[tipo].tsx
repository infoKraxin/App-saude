import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';
import { Screen, T, Button, Chip, Field, Segmented, Group, ToggleRow, Card } from '@/components/ui';
import { addLog, removeLog, saveFavorite, useApp } from '@/data/store';
import { SheetHeader, toast } from '@/components/premium';
import { KIND_ICON } from '@/components/illus';
import type { LogKind } from '@/data/types';
import { areaById, AREAS } from '@/data/areas';
import { hoursBetween, pad } from '@/data/dates';
import type { Level3, MealSlot } from '@/data/types';
import { useTheme } from '@/theme/useTheme';
import { hit, space } from '@/theme/tokens';
import { Pressable } from 'react-native';

const TITLES: Record<string, string> = {
  water: 'Água', meal: 'Refeição', sleep: 'Sono', feel: 'Como me sinto', move: 'Movimento', symptom: 'Sintomas',
  evening: 'Minha noite', measure: 'Medidas', med: 'Aplicação', cycle: 'Ciclo',
};

const slotNow = (): MealSlot => {
  const h = new Date().getHours();
  return h < 10 ? 'cafe' : h < 15 ? 'almoco' : h < 18 ? 'lanche' : h < 22 ? 'jantar' : 'ceia';
};

const L3 = (a: string, b: string, c: string) => [{ v: 1 as Level3, label: a }, { v: 2 as Level3, label: b }, { v: 3 as Level3, label: c }];

function TimeStepper({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { c } = useTheme();
  const shift = (m: number) => {
    const [h, mm] = value.split(':').map(Number);
    let t = (h * 60 + mm + m + 1440) % 1440;
    t = Math.round(t / 15) * 15 % 1440;
    onChange(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  };
  const btn = (m: number, Icon: typeof Plus, a11y: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} onPress={() => shift(m)} style={{ width: hit, height: hit, borderRadius: hit / 2, backgroundColor: c.sunk, alignItems: 'center', justifyContent: 'center' }}>
      <Icon color={c.ink} size={22} />
    </Pressable>
  );
  return (
    <View style={{ gap: space(2) }} accessibilityRole="adjustable" accessibilityLabel={`${label}: ${value}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => shift(e.nativeEvent.actionName === 'increment' ? 15 : -15)}>
      <T v="label">{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
        {btn(-15, Minus, `${label}: 15 minutos antes`)}
        <T v="h1" style={{ flex: 1, textAlign: 'center' }}>{value}</T>
        {btn(15, Plus, `${label}: 15 minutos depois`)}
      </View>
    </View>
  );
}

export default function RegistroTipo() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const router = useRouter();
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const SUB: Record<string, string> = {
    water: 'Cada copo conta.', meal: 'Escreva do seu jeito, sem pesar nada.', sleep: 'Sobre a noite passada.', feel: 'Quatro toques e pronto.',
    move: 'Qualquer movimento conta.', symptom: 'O que você sentiu hoje.', evening: 'Ajuda a entender o seu sono.', measure: 'Uma vez por semana basta.',
    med: 'Só para acompanhar a rotina.', cycle: 'Em que fase você está?',
  };
  const log: typeof addLog = (e) => {
    const l = addLog(e);
    toast(`${TITLES[tipo ?? ''] ?? 'Registro'} registrado`, () => removeLog(l.id));
    return l;
  };

  // estados de cada formulário
  const [ml, setMl] = useState(300);
  const [mlText, setMlText] = useState('');
  const [slot, setSlot] = useState<MealSlot>(slotNow());
  const [text, setText] = useState('');
  const [tags, setTags] = useState({ protein: false, fiber: false, ultra: false, alcohol: false });
  const [fav, setFav] = useState(false);
  const [bed, setBed] = useState('23:00');
  const [wake, setWake] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [feel, setFeel] = useState<{ energy?: Level3; hunger?: Level3; mood?: Level3; stress?: Level3 }>({});
  const [move, setMove] = useState<0 | 1 | 2 | 3 | null>(null);
  const [minutes, setMinutes] = useState('');
  const [sym, setSym] = useState<Record<string, Level3>>({});
  const [eve, setEve] = useState({ caffeineLate: false, screenLate: false });
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [med, setMed] = useState({ name: '', doseText: '', site: '' });
  const [phase, setPhase] = useState<string | null>(null);
  const [err, setErr] = useState<string | undefined>();

  const symptomList = useMemo(() => {
    const own = areaById(profile?.area).symptoms;
    const ids = new Set(own.map((s) => s.id));
    const extra = AREAS.flatMap((a) => a.symptoms).filter((s) => !ids.has(s.id) && (ids.add(s.id), true));
    return [...own, ...extra.slice(0, 6)];
  }, [profile?.area]);

  const num = (s: string) => Number(s.replace(',', '.'));
  let body: React.ReactNode = null;
  let save: (() => void) | null = null;
  let can = true;

  switch (tipo) {
    case 'water':
      body = (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
            {[200, 300, 500, 750].map((v) => <Chip key={v} label={`${v} ml`} selected={!mlText && ml === v} onPress={() => { setMl(v); setMlText(''); }} />)}
          </View>
          <Field label="Outra quantidade (ml)" value={mlText} onChangeText={(t) => setMlText(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" placeholder="Ex.: 350" />
        </>
      );
      save = () => {
        const v = mlText ? Number(mlText) : ml;
        if (!v || v > 3000) return setErr('Use um valor entre 1 e 3000 ml.');
        log({ kind: 'water', ml: v });
        done();
      };
      break;
    case 'meal':
      body = (
        <>
          <Segmented label="Refeição" value={slot} onChange={setSlot} options={[{ v: 'cafe', label: 'Café' }, { v: 'almoco', label: 'Almoço' }, { v: 'lanche', label: 'Lanche' }, { v: 'jantar', label: 'Jantar' }, { v: 'ceia', label: 'Ceia' }]} />
          <Field label="O que você comeu?" value={text} onChangeText={setText} placeholder="Ex.: arroz, feijão, frango e salada" multiline error={err} />
          {favorites.length > 0 && (
            <View style={{ gap: space(2) }}>
              <T v="label">Favoritos</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
                {favorites.slice(0, 8).map((f) => (
                  <Chip key={f.text} label={f.text.length > 28 ? `${f.text.slice(0, 26)}...` : f.text} onPress={() => { setText(f.text); setTags({ protein: f.protein, fiber: f.fiber, ultra: f.ultra, alcohol: f.alcohol }); }} />
                ))}
              </View>
            </View>
          )}
          <View style={{ gap: space(2) }}>
            <T v="label">Marque o que tinha</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
              <Chip label="Proteína" selected={tags.protein} onPress={() => setTags({ ...tags, protein: !tags.protein })} />
              <Chip label="Verduras ou fibras" selected={tags.fiber} onPress={() => setTags({ ...tags, fiber: !tags.fiber })} />
              <Chip label="Ultraprocessado" selected={tags.ultra} onPress={() => setTags({ ...tags, ultra: !tags.ultra })} />
              <Chip label="Bebida alcoólica" selected={tags.alcohol} onPress={() => setTags({ ...tags, alcohol: !tags.alcohol })} />
            </View>
            <T v="micro" tone="mut">Ultraprocessado: biscoito, salgadinho, refrigerante, embutido, comida pronta congelada.</T>
          </View>
          <Group><ToggleRow label="Salvar nos favoritos" value={fav} onChange={setFav} /></Group>
        </>
      );
      can = text.trim().length > 0;
      save = () => {
        const t = text.trim().slice(0, 300);
        log({ kind: 'meal', slot, text: t, ...tags });
        if (fav) saveFavorite({ text: t, slot, ...tags });
        done();
      };
      break;
    case 'sleep':
      body = (
        <>
          <TimeStepper label="Fui dormir" value={bed} onChange={setBed} />
          <TimeStepper label="Acordei" value={wake} onChange={setWake} />
          <T v="small" tone="mut">{hoursBetween(bed, wake).toLocaleString('pt-BR')} horas na cama.</T>
          <Segmented label="Como foi o sono?" value={quality} onChange={setQuality} options={[{ v: 1, label: 'Péssimo' }, { v: 2, label: 'Ruim' }, { v: 3, label: 'Ok' }, { v: 4, label: 'Bom' }, { v: 5, label: 'Ótimo' }]} />
        </>
      );
      can = quality != null;
      save = () => { log({ kind: 'sleep', bed, wake, quality: quality! }); done(); };
      break;
    case 'evening':
      body = (
        <>
          <T tone="mut">Duas perguntas que ajudam a entender o seu sono.</T>
          <Group>
            <ToggleRow label="Tomei café ou outra cafeína depois das 16 h" desc="Café, chá preto, mate, energético, refrigerante de cola." value={eve.caffeineLate} onChange={(v) => setEve({ ...eve, caffeineLate: v })} />
            <ToggleRow label="Fiquei no celular ou na TV até dormir" value={eve.screenLate} onChange={(v) => setEve({ ...eve, screenLate: v })} />
          </Group>
        </>
      );
      save = () => { log({ kind: 'evening', ...eve }); done(); };
      break;
    case 'feel':
      body = (
        <>
          <Segmented label="Energia" value={feel.energy} onChange={(v) => setFeel({ ...feel, energy: v })} options={L3('Baixa', 'Média', 'Alta')} />
          <Segmented label="Fome" value={feel.hunger} onChange={(v) => setFeel({ ...feel, hunger: v })} options={L3('Pouca', 'Normal', 'Muita')} />
          <Segmented label="Humor" value={feel.mood} onChange={(v) => setFeel({ ...feel, mood: v })} options={L3('Para baixo', 'Ok', 'Bem')} />
          <Segmented label="Estresse" value={feel.stress} onChange={(v) => setFeel({ ...feel, stress: v })} options={L3('Baixo', 'Médio', 'Alto')} />
        </>
      );
      can = !!(feel.energy && feel.hunger && feel.mood && feel.stress);
      save = () => { log({ kind: 'feel', energy: feel.energy!, hunger: feel.hunger!, mood: feel.mood!, stress: feel.stress! }); done(); };
      break;
    case 'move':
      body = (
        <>
          <Segmented label="Quanto você se movimentou hoje?" value={move} onChange={setMove} options={[{ v: 0, label: 'Nada' }, { v: 1, label: 'Leve' }, { v: 2, label: 'Moderado' }, { v: 3, label: 'Intenso' }]} />
          <T v="micro" tone="mut">Leve: caminhada curta. Moderado: caminhada rápida, bicicleta. Intenso: treino que deixa sem fôlego.</T>
          <Field label="Minutos (opcional)" value={minutes} onChangeText={(t) => setMinutes(t.replace(/\D/g, '').slice(0, 3))} keyboardType="number-pad" />
        </>
      );
      can = move != null;
      save = () => { log({ kind: 'move', level: move!, minutes: minutes ? Number(minutes) : undefined }); done(); };
      break;
    case 'symptom':
      body = (
        <>
          <T tone="mut">Marque o que sentiu hoje e a intensidade.</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
            {symptomList.map((s) => (
              <Chip key={s.id} label={s.label} selected={!!sym[s.id]} onPress={() => { const n = { ...sym }; if (n[s.id]) delete n[s.id]; else n[s.id] = 1; setSym(n); }} />
            ))}
          </View>
          {Object.keys(sym).map((id) => (
            <Segmented key={id} label={symptomList.find((s) => s.id === id)?.label ?? id} value={sym[id]} onChange={(v) => setSym({ ...sym, [id]: v })} options={L3('Leve', 'Médio', 'Forte')} />
          ))}
          <Card tone="sunk"><T v="small">Dor forte, desmaio, vômito que não para ou falta de ar: procure atendimento. Em emergência, ligue 192.</T></Card>
        </>
      );
      can = Object.keys(sym).length > 0;
      save = () => { log({ kind: 'symptom', items: Object.entries(sym).map(([id, level]) => ({ id, level })) }); done(); };
      break;
    case 'measure':
      body = (
        <>
          <T tone="mut">De preferência no mesmo horário, ao acordar.</T>
          <Field label="Peso (kg)" value={weight} onChangeText={(t) => { setWeight(t.replace(/[^\d,.]/g, '').slice(0, 5)); setErr(undefined); }} keyboardType="decimal-pad" placeholder="Ex.: 72,5" error={err} />
          <Field label="Cintura (cm, opcional)" value={waist} onChangeText={(t) => setWaist(t.replace(/[^\d,.]/g, '').slice(0, 5))} keyboardType="decimal-pad" />
        </>
      );
      can = !!weight || !!waist;
      save = () => {
        const w = weight ? num(weight) : undefined;
        const c = waist ? num(waist) : undefined;
        if (w != null && !(w >= 25 && w <= 350)) return setErr('Confira o peso: use quilos, entre 25 e 350.');
        log({ kind: 'measure', weightKg: w, waistCm: c && c > 30 && c < 250 ? c : undefined });
        done();
      };
      break;
    case 'med':
      body = (
        <>
          <Card tone="sunk"><T v="small">Este registro serve para você acompanhar a rotina. O Evura nunca sugere dose ou troca de remédio: isso é sempre com quem prescreveu.</T></Card>
          <Field label="Remédio" value={med.name} onChangeText={(t) => setMed({ ...med, name: t.slice(0, 60) })} placeholder="Como está na receita" />
          <Field label="Dose (como está na receita)" value={med.doseText} onChangeText={(t) => setMed({ ...med, doseText: t.slice(0, 40) })} />
          <View style={{ gap: space(2) }}>
            <T v="label">Local da aplicação (opcional)</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
              {['Barriga', 'Coxa', 'Braço'].map((s) => <Chip key={s} label={s} selected={med.site === s} onPress={() => setMed({ ...med, site: med.site === s ? '' : s })} />)}
            </View>
          </View>
        </>
      );
      can = !!med.name.trim();
      save = () => { log({ kind: 'med', name: med.name.trim(), doseText: med.doseText.trim(), site: med.site || undefined }); done(); };
      break;
    case 'cycle':
      body = (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
          {[['menstrual', 'Menstruada'], ['folicular', 'Depois da menstruação'], ['ovulatoria', 'Ovulação'], ['lutea', 'Antes da menstruação'], ['nao_sei', 'Não sei']].map(([k, l]) => (
            <Chip key={k} label={l} selected={phase === k} onPress={() => setPhase(k)} />
          ))}
        </View>
      );
      can = !!phase;
      save = () => { log({ kind: 'cycle', phase: phase as 'menstrual' }); done(); };
      break;
    default:
      body = <T>Esse tipo de registro não existe.</T>;
  }

  return (
    <Screen header={<SheetHeader img={KIND_ICON[(tipo ?? 'water') as LogKind] ?? 'icone-agua'} title={TITLES[tipo ?? ''] ?? 'Registrar'} subtitle={SUB[tipo ?? '']} />} footer={save ? <Button label="Salvar" disabled={!can} onPress={save} /> : undefined}>
      {body}
      {err && tipo === 'water' ? <T v="small" tone="crit">{err}</T> : null}
    </Screen>
  );
}
