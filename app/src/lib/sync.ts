// Fila de sincronização: sobe os registros não enviados em lotes. O servidor resolve conflitos
// (edição mais recente vence, apagar vence editar; ver gatilho logs_delete_wins).
import { getState, setState } from '../data/store';
import { supabase } from './supabase';

let running = false;

export async function syncNow(): Promise<{ sent: number; error?: string }> {
  if (!supabase || running) return { sent: 0 };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { sent: 0 };
  running = true;
  try {
    const pending = getState().logs.filter((l) => !l.synced);
    let sent = 0;
    for (let i = 0; i < pending.length; i += 200) {
      const batch = pending.slice(i, i + 200);
      const rows = batch.map(({ id, kind, day, at, source, deleted, updatedAt, synced: _s, ...payload }) => ({
        id, kind, day, at, source, deleted: !!deleted, updated_at: updatedAt, payload, user_id: auth.user!.id,
      }));
      const { error } = await supabase.from('logs').upsert(rows, { onConflict: 'id' });
      if (error) return { sent, error: 'Sem conexão com o servidor. Seus registros estão salvos no aparelho e sobem depois.' };
      // só marca como enviado se não foi editado durante o envio
      const sentAt = new Map(batch.map((b) => [b.id, b.updatedAt]));
      setState((s) => ({ ...s, logs: s.logs.map((l) => (sentAt.get(l.id) === l.updatedAt ? { ...l, synced: true } : l)) }));
      sent += batch.length;
    }
    return { sent };
  } finally {
    running = false;
  }
}
