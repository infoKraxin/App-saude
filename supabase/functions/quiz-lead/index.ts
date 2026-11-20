// Recebe o plano do quiz e grava em quiz_leads. Chamada pelo quiz web (sem login).
// No primeiro login do app com o mesmo e-mail, o plano carrega pronto (promessa 1 do quiz).
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (automáticas), ALLOWED_ORIGINS (vírgula).
import { createClient } from 'npm:@supabase/supabase-js@2';

const AREAS = ['emag', 'cane', 'intes', 'horm', 'sono', 'ener', 'mass', 'long'];
const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const hits = new Map<string, { n: number; t: number }>();

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && (allowed.length === 0 || allowed.includes(origin)) ? origin : allowed[0] ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
});

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const h = { ...cors(origin), 'content-type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response(null, { headers: h });
  if (req.method !== 'POST') return new Response('{"erro":"método"}', { status: 405, headers: h });
  if (allowed.length && (!origin || !allowed.includes(origin))) return new Response('{"erro":"origem"}', { status: 403, headers: h });

  // limite simples por IP: 10 envios por 10 minutos
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'x';
  const now = Date.now();
  const hit = hits.get(ip);
  if (hit && now - hit.t < 600_000) {
    if (++hit.n > 10) return new Response('{"erro":"limite"}', { status: 429, headers: h });
  } else hits.set(ip, { n: 1, t: now });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('{"erro":"json"}', { status: 400, headers: h });
  }
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return new Response('{"erro":"email"}', { status: 400, headers: h });
  if (body.consent !== true) return new Response('{"erro":"consentimento"}', { status: 400, headers: h });
  const area = AREAS.includes(String(body.area)) ? String(body.area) : null;
  const answers = typeof body.answers === 'object' && body.answers ? body.answers : {};
  if (JSON.stringify(answers).length > 20_000) return new Response('{"erro":"tamanho"}', { status: 413, headers: h });
  const hyps = Array.isArray(body.hypotheses) ? body.hypotheses.map(String).slice(0, 3) : [];
  const utm = typeof body.utm === 'object' && body.utm ? body.utm : {};

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { error } = await db.from('quiz_leads').insert({
    email, area, answers, hypotheses: hyps, utm, consent_text_version: String(body.consentVersion ?? 'quiz-v1'),
  });
  if (error) return new Response('{"erro":"gravar"}', { status: 500, headers: h });
  return new Response('{"ok":true}', { headers: h });
});
