# Guia de Acoes Manuais de Seguranca - Matheus de Castro

Este documento lista as acoes que devem ser realizadas diretamente nos paineis externos (Groq Cloud e Supabase Dashboard), pois dependem de suas credenciais de proprietario.

---

## 1. Rotacao Imediata da Chave Groq API (Groq Cloud)
As chaves anteriores foram expostas no historico e precisam ser revogadas:
1. Acesse: https://console.groq.com/keys
2. Localize e **DELETE** as chaves antigas (as que comecam com `gsk_DZG1...` e `gsk_IvjK...`).
3. Clique em **Create API Key**, de o nome de `portfolio-alomyr-prod` e copie a nova chave gerada.

---

## 2. Aplicar a Migracao SQL de Blindagem RLS no Supabase
Para travar todas as permissoes do banco e garantir que apenas sua conta tenha poder de gravacao:
1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/yssvioekuramkvztoyom/sql
2. Abra uma nova aba de consulta SQL no **SQL Editor**.
3. Copie e cole todo o conteudo do arquivo local:
   `supabase/migrations/20261112_harden_security_rls.sql`
4. Clique em **Run** (Executar).
5. O script ira:
   - Criar a funcao de seguranca `public.is_admin()` que valida seu e-mail (`matheus.vsf.castro.25@gmail.com`) e seu usuario GitHub (`matheus-dcastro`).
   - Bloquear insercoes, alteracoes e delecoes em todas as tabelas para qualquer pessoa nao autorizada.
   - Bloquear uploads e delecoes nao autorizadas no bucket de Storage `documents`.
   - Limpar qualquer chave salva anteriormente na tabela `agent_configs`. ok feito aqui

---

## 3. Configurar a Nova Chave nos Secrets do Supabase
A chave da Groq agora deve residir exclusivamente no cofre em nuvem do Supabase, sem nunca trafegar para o navegador: ok feito aqui

### Opcao A (Via Dashboard - Recomendado):
1. Acesse: https://supabase.com/dashboard/project/yssvioekuramkvztoyom/settings/functions
2. Na secao **Edge Functions Secrets**, clique em **Add new secret**.
3. Nome: `GROQ_API_KEY`
4. Valor: cole sua nova chave gerada no Passo 1.
5. Salve.

### Opcao B (Via Terminal CLI):
```bash
npx supabase secrets set GROQ_API_KEY=sua-nova-chave-aqui
```

---

## 4. Deploy da Edge Function do Chat (`chat-qwen`) ok feito
Para que o assistente Alomyr funcione com inferencia 100% serverless:
```bash
npx supabase login
npx supabase link --project-ref yssvioekuramkvztoyom
npx supabase functions deploy chat-qwen
```

---

## 5. Desativar Criacao de Novos Usuarios no Supabase Auth ja esta feito ja esta confi isso aqui 
Para impedir que qualquer terceiro crie contas na sua instancia do Supabase:
1. Acesse: https://supabase.com/dashboard/project/yssvioekuramkvztoyom/auth/users
2. Va em **Authentication > Configuration > Providers > Email**.
3. Desmarque a opcao: **"Enable Signups"** (ou "Allow new users to sign up").
4. Salve as alteracoes. Dessa forma, somente o seu usuario atual conseguira efetuar login.

---

## 6. Revisao do Curriculo PDF (Nivel 4 - Opcional, feito por voce)
Conforme combinado, a revisao de dados sensiveis no PDF do curriculo (`public/Matheus Vinicius Silva Freire de Castro.pdf`) sera feita diretamente por voce:
- Recomendacao: Se achar prudente, remover o telefone celular pessoal `(84) 99879-1139` e manter como canais publicos de contato o LinkedIn e o E-mail.
