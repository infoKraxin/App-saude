import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
const db = new PGlite();
const q = (s, p) => db.query(s, p);
await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
grant usage on schema auth to anon, authenticated;
`);
await db.exec(fs.readFileSync(new URL("../migrations/20261120000000_base.sql", import.meta.url),'utf8'));
await db.exec(`grant usage on schema public to anon, authenticated; grant all on all tables in schema public to authenticated, anon; grant all on all sequences in schema public to authenticated; grant execute on all functions in schema public to authenticated;`);
const A='11111111-1111-1111-1111-111111111111', B='22222222-2222-2222-2222-222222222222';
await q(`insert into auth.users values ($1,'a@x.com'),($2,'b@x.com')`,[A,B]);
let fail=0; const ok=(c,m)=>{console.log((c?'OK  ':'FALHA ')+m); if(!c)fail++;};
const as = async (u, fn) => { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${u}',false); select set_config('request.jwt.claims','{"email":"${u===A?'a@x.com':'b@x.com'}"}',false);`); try { return await fn(); } finally { await db.exec('reset role'); } };
ok((await q('select count(*)::int c from profiles')).rows[0].c===2,'gatilho cria perfil para cada conta nova');
ok((await q('select plan from entitlements where user_id=$1',[A])).rows[0].plan==='trial','gatilho cria teste de 7 dias');
await as(A, ()=>q(`insert into logs (id,user_id,kind,day,at,payload) values ('a1',$1,'water','2026-11-20',now(),'{"ml":300}')`,[A]));
ok((await as(B, ()=>q('select * from logs'))).rows.length===0,'B não lê registros de A');
ok((await as(A, ()=>q('select * from logs'))).rows.length===1,'A lê os próprios registros');
let err=null; try{ await as(B, ()=>q(`insert into logs (id,user_id,kind,day,at,payload) values ('b1',$1,'water','2026-11-20',now(),'{}')`,[A])); }catch(e){err=e} ok(!!err,'B não grava registro em nome de A');
await as(B, ()=>q(`update logs set payload='{"ml":9}' where id='a1'`)); ok((await q(`select payload->>'ml' m from logs where id='a1'`)).rows[0].m==='300','B não edita registro de A');
ok((await as(B, ()=>q('select * from profiles'))).rows.length===1,'B vê só o próprio perfil');
await q(`insert into quiz_leads (email,area,consent_text_version) values ('A@x.com','emag','v1'),('b@x.com','sono','v1')`);
const la=(await as(A, ()=>q('select email from quiz_leads'))).rows; ok(la.length===1 && la[0].email==='A@x.com','lead do quiz casa pelo e-mail (sem diferenciar maiúsculas) e só o dono vê');
err=null; try{ await as(A, ()=>q(`insert into quiz_leads (email,consent_text_version) values ('z@x.com','v1')`)); }catch(e){err=e} ok(!!err,'usuário não grava lead direto (só a função)');
await as(A, ()=>q(`update entitlements set plan='anual'`)); ok((await q('select plan from entitlements where user_id=$1',[A])).rows[0].plan==='trial','usuário não muda a própria assinatura');
// comunidade
await as(A, ()=>q(`insert into memberships (group_id,user_id) values ('emag',$1)`,[A]));
await as(B, ()=>q(`insert into memberships (group_id,user_id) values ('emag',$1)`,[B]));
await as(A, ()=>q(`insert into posts (group_id,author_id,body) values ('emag',$1,'oi')`,[A]));
ok((await as(B, ()=>q('select * from posts'))).rows.length===0,'post em revisão não aparece para outros');
await q(`update posts set status='published'`);
ok((await as(B, ()=>q('select * from posts'))).rows.length===1,'post publicado aparece para membros');
await as(B, ()=>q(`insert into blocks (blocker_id,blocked_id) values ($1,$2)`,[B,A]));
ok((await as(B, ()=>q('select * from posts'))).rows.length===0,'bloqueio esconde posts');
err=null; try{ await as(B, ()=>q(`insert into posts (group_id,author_id,body,status) values ('emag',$1,'x','published')`,[B])); }catch(e){err=e} ok(!!err,'ninguém publica sem passar pela revisão');
err=null; try{ await as(B, ()=>q(`insert into posts (group_id,author_id,body) values ('cane',$1,'x')`,[B])); }catch(e){err=e} ok(!!err,'não posta em grupo do qual não é membro');
ok((await as(A, ()=>q('select * from audit_log'))).rows.length===0 && (await as(A, ()=>q('select * from subscriptions'))).rows.length===0,'tabelas internas fechadas');
// apagar vence editar
await as(A, ()=>q(`update logs set deleted=true, updated_at=now() where id='a1'`));
await as(A, ()=>q(`update logs set deleted=false, updated_at=now()-interval '1 hour' where id='a1'`));
ok((await q(`select deleted from logs where id='a1'`)).rows[0].deleted===true,'edição atrasada não ressuscita registro apagado');
// todas as tabelas com RLS
const no=(await q(`select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity`)).rows; ok(no.length===0,'RLS ligada em todas as tabelas '+JSON.stringify(no));
console.log(fail? `\n${fail} falha(s)`:'\nTodos os testes de RLS passaram'); process.exit(fail?1:0);
