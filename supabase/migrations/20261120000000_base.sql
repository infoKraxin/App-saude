-- Evura: base do banco (fase 0).
-- Regra de ouro: RLS ligada em TODA tabela. Cada pessoa só lê e escreve o que é dela.
-- Tabelas de conhecimento (evidências) e de operação são escritas só pela equipe (service_role).


-- ---------------------------------------------------------------- pessoa
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  area text not null default 'emag' check (area in ('emag','cane','intes','horm','sono','ener','mass','long')),
  extra_areas text[] not null default '{}',
  motive text not null default '',
  event_name text,
  event_date date,
  birth_year int check (birth_year between 1900 and 2100),
  sex text check (sex in ('f','m','na')),
  height_cm numeric(5,1),
  start_weight_kg numeric(5,1),
  goal_weight_kg numeric(5,1),
  safety jsonb not null default '{"pregnant":false,"breastfeeding":false,"eatingDisorder":false}',
  hypotheses text[] not null default '{}',
  trial_start date,
  from_quiz boolean not null default false,
  cycle_tracking boolean not null default false,
  uses_pen boolean not null default false,
  prefs jsonb not null default '{}',
  public_nick text unique check (char_length(public_nick) between 3 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cada aceite e cada revogação ficam registrados, com a versão do texto mostrado.
create table public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('health','ai','community','analytics','marketing','research')),
  granted boolean not null,
  text_version text not null,
  created_at timestamptz not null default now()
);
create index on public.consents (user_id, kind, created_at desc);

create table public.device_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android','ios','web')),
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);

-- ---------------------------------------------------------------- quiz → app
-- Escrita só pela função quiz-lead (service_role). Lida pela própria pessoa ao entrar com o mesmo e-mail.
create table public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  area text,
  answers jsonb not null default '{}',
  hypotheses text[] not null default '{}',
  utm jsonb not null default '{}',
  consent_text_version text not null,
  claimed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.quiz_leads (lower(email), created_at desc);

-- ---------------------------------------------------------------- registros
-- Uma tabela para todos os tipos: o app gera o id, `payload` segue o tipo de `kind`
-- (ver app/src/data/types.ts). Apagar é lógico e vence editar.
create table public.logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('water','meal','sleep','evening','feel','symptom','measure','move','med','cycle')),
  day date not null,
  at timestamptz not null,
  source text not null default 'manual' check (source in ('manual','health_connect','foto')),
  payload jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);
create index on public.logs (user_id, day);

-- ---------------------------------------------------------------- conhecimento
create table public.evidence_cards (
  id text primary key,
  area text[] not null,
  claim text not null,
  population text not null,
  effect text not null,
  strength text not null check (strength in ('A','B','C')),
  ref_url text not null check (ref_url ~ '^https?://'),
  reviewed_by text not null,
  reviewed_at date not null,
  expires_at date generated always as (reviewed_at + 365) stored,
  status text not null default 'draft' check (status in ('draft','approved','expired')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- resultados
create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  kind text not null default 'daily' check (kind in ('daily','day7','weekly')),
  package jsonb not null,          -- o que o motor entregou (sem nome nem e-mail)
  text jsonb,                      -- o que a IA escreveu, depois do validador
  fallback boolean not null default false, -- true = texto-modelo do motor
  engine_version text not null,
  prompt_version text,
  model text,
  created_at timestamptz not null default now(),
  unique (user_id, day, kind)
);

create table public.report_feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.daily_reports(id) on delete cascade,
  finding_id text not null,
  useful boolean not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- comunidade
create table public.groups (
  id text primary key,
  area text,
  name text not null,
  rules text not null,
  invite_only boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.memberships (
  group_id text not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted_rules_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references public.groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'review' check (status in ('review','published','removed')),
  created_at timestamptz not null default now()
);
create index on public.posts (group_id, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'review' check (status in ('review','published','removed')),
  created_at timestamptz not null default now()
);

create table public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('forca','tambem','util')),
  primary key (post_id, user_id, kind)
);

create table public.post_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null check (reason in ('ofensa','risco','venda','saude_perigosa','spam','outro')),
  note text check (char_length(note) <= 300),
  status text not null default 'open' check (status in ('open','actioned','dismissed')),
  created_at timestamptz not null default now(),
  check (post_id is not null or comment_id is not null)
);

create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  muted_only boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.moderation_actions (
  id bigint generated always as identity primary key,
  moderator text not null,
  target_kind text not null,
  target_id text not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- assinatura
create table public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'trial' check (plan in ('trial','mensal','trimestral','anual','expired')),
  active_until timestamptz,
  source text not null default 'trial',
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id text primary key,                 -- id do gateway
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  plan text not null,
  status text not null,
  raw jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- operação
create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  note text
);

create table public.engine_params (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  requested_at timestamptz not null default now(),
  done_at timestamptz
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  topic text not null check (topic in ('duvida','problema','sugestao','privacidade','assinatura')),
  body text not null check (char_length(body) between 1 and 2000),
  app_context jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target_user uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ================================================================ RLS
alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.device_tokens enable row level security;
alter table public.quiz_leads enable row level security;
alter table public.logs enable row level security;
alter table public.evidence_cards enable row level security;
alter table public.daily_reports enable row level security;
alter table public.report_feedback enable row level security;
alter table public.groups enable row level security;
alter table public.memberships enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.post_reports enable row level security;
alter table public.blocks enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.feature_flags enable row level security;
alter table public.engine_params enable row level security;
alter table public.deletion_requests enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_log enable row level security;

-- dono lê e escreve o que é seu
create policy own_profile on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy own_consents_read on public.consents for select to authenticated using (user_id = auth.uid());
create policy own_consents_insert on public.consents for insert to authenticated with check (user_id = auth.uid()); -- só acrescenta, nunca edita
create policy own_tokens on public.device_tokens for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_logs on public.logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_reports on public.daily_reports for select to authenticated using (user_id = auth.uid());
create policy own_feedback on public.report_feedback for insert to authenticated with check (user_id = auth.uid());
create policy own_entitlement on public.entitlements for select to authenticated using (user_id = auth.uid());
create policy own_deletion on public.deletion_requests for insert to authenticated with check (user_id = auth.uid());
create policy own_deletion_read on public.deletion_requests for select to authenticated using (user_id = auth.uid());
create policy own_tickets on public.support_tickets for insert to authenticated with check (user_id = auth.uid());
create policy own_tickets_read on public.support_tickets for select to authenticated using (user_id = auth.uid());

-- lead do quiz: a pessoa lê os leads do próprio e-mail confirmado
create policy quiz_lead_mine on public.quiz_leads for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- conhecimento: só fichas aprovadas e dentro da validade
create policy evidence_read on public.evidence_cards for select to authenticated
  using (status = 'approved' and expires_at >= current_date);

create policy flags_read on public.feature_flags for select to anon, authenticated using (true);

-- comunidade
create or replace function public.is_member(g text) returns boolean
  language sql stable security definer set search_path = public as
  $$ select exists (select 1 from memberships where group_id = g and user_id = auth.uid()) $$;

create or replace function public.blocked_between(other uuid) returns boolean
  language sql stable security definer set search_path = public as
  $$ select exists (select 1 from blocks
       where (blocker_id = auth.uid() and blocked_id = other)
          or (blocker_id = other and blocked_id = auth.uid() and not muted_only)) $$;

create policy groups_read on public.groups for select to authenticated using (true);
create policy membership_own on public.memberships for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy posts_read on public.posts for select to authenticated
  using (is_member(group_id) and (author_id = auth.uid() or (status = 'published' and not blocked_between(author_id))));
create policy posts_write on public.posts for insert to authenticated
  with check (author_id = auth.uid() and is_member(group_id) and status = 'review');
create policy posts_delete_own on public.posts for delete to authenticated using (author_id = auth.uid());

create policy comments_read on public.comments for select to authenticated
  using (exists (select 1 from posts p where p.id = post_id and is_member(p.group_id))
         and (author_id = auth.uid() or (status = 'published' and not blocked_between(author_id))));
create policy comments_write on public.comments for insert to authenticated
  with check (author_id = auth.uid() and status = 'review'
              and exists (select 1 from posts p where p.id = post_id and is_member(p.group_id)));
create policy comments_delete_own on public.comments for delete to authenticated using (author_id = auth.uid());

create policy reactions_rw on public.reactions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reports_insert on public.post_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy blocks_own on public.blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- sem política = sem acesso para usuários: moderation_actions, subscriptions, engine_params, audit_log.

-- ================================================================ gatilhos
create or replace function public.touch_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;
create trigger t_profiles before update on public.profiles for each row execute function public.touch_updated_at();

-- Apagar vence editar: um registro apagado não volta por uma edição atrasada de outro aparelho.
create or replace function public.logs_delete_wins() returns trigger language plpgsql as
$$ begin
  if old.deleted and not new.deleted and new.updated_at <= old.updated_at then
    new.deleted := true;
  end if;
  if new.updated_at < old.updated_at then
    return old; -- edição mais antiga que a guardada é ignorada
  end if;
  return new;
end $$;
create trigger t_logs_merge before update on public.logs for each row execute function public.logs_delete_wins();

-- Conta nova ganha perfil e teste de 7 dias.
create or replace function public.on_new_user() returns trigger
  language plpgsql security definer set search_path = public as
$$ begin
  insert into profiles (id, trial_start) values (new.id, current_date) on conflict do nothing;
  insert into entitlements (user_id, plan, active_until, source)
    values (new.id, 'trial', now() + interval '7 days', 'trial') on conflict do nothing;
  return new;
end $$;
create trigger t_new_user after insert on auth.users for each row execute function public.on_new_user();

-- ================================================================ dados iniciais
insert into public.feature_flags (key, enabled, note) values
  ('community', false, 'Decisão 10: por convite no beta'),
  ('ai_text', false, 'Liga a redação pela Groq; desligado = texto-modelo do motor'),
  ('meal_photo', false, 'Fase 2: foto com IA de visão'),
  ('health_connect', false, 'Liga após aprovação da Play');

insert into public.engine_params (key, value) values
  ('thresholds', '{"minFraco":5,"minConsistente":10,"minEffect":0.5,"confounderGap":0.4}');

insert into public.groups (id, area, name, rules) values
  ('boas-vindas', null, 'Boas-vindas', 'Respeito sempre. Sem números de peso, sem antes e depois, sem venda e sem dica de dieta extrema. Dose e remédio, só com quem prescreveu.'),
  ('emag', 'emag', 'Emagrecimento', 'Respeito sempre. Sem números de peso, sem antes e depois, sem venda e sem dica de dieta extrema.'),
  ('cane', 'cane', 'Canetas', 'Respeito sempre. Não falamos de dose, compra ou troca de remédio: isso é com quem prescreveu. Sem venda.');
