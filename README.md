# VolkeSpy API Backend

Este é um backend minimalista para validação de usuários, pronto para ser implantado na Vercel.

## Estrutura do Projeto

- `/api/validate.js`: Endpoint Serverless Function que valida o email do usuário.

## Como subir no GitHub (Via Upload)

1. **Crie um Repositório:**
   - Vá em [github.com/new](https://github.com/new).
   - Nomeie o repositório (ex: `volkespy-api`).
   - Clique em "Create repository".

2. **Faça o Upload:**
   - Na página do repositório criado, clique no link **"uploading an existing file"**.
   - Arraste a pasta `api` e o arquivo `README.md` para a área de upload.
   - Escreva uma mensagem de commit (ex: "Initial commit") e clique em **"Commit changes"**.

## Como fazer Deploy na Vercel

1. **Crie uma conta/Login:**
   - Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.

2. **Importe o Projeto:**
   - No Dashboard, clique em **"Add New..."** -> **"Project"**.
   - Na lista "Import Git Repository", encontre o repositório `volkespy-api` que você acabou de criar e clique em **"Import"**.

3. **Configure e Deploy:**
   - Na tela de configuração ("Configure Project"), você pode deixar tudo como padrão.
   - Clique em **"Deploy"**.
   - Aguarde alguns segundos. Quando terminar, você receberá uma URL do seu projeto (ex: `https://volkespy-api.vercel.app`).

## Como Testar

Você pode testar o endpoint usando o comando `curl` no seu terminal. Substitua `URL_DA_SUA_API` pela URL gerada pela Vercel.

### 1. Testar Email Válido

```bash
curl -X POST https://URL_DA_SUA_API/api/validate \
     -H "Content-Type: application/json" \
     -d '{"email": "teste@volke.com"}'
```
**Resposta esperada:**
```json
{"active":true,"plan":"mensal","expires_at":"2026-12-31"}
```

### 2. Testar Email Inválido

```bash
curl -X POST https://URL_DA_SUA_API/api/validate \
     -H "Content-Type: application/json" \
     -d '{"email": "email_errado@exemplo.com"}'
```
**Resposta esperada:**
```json
{"active":false,"reason":"inactive"}
```

### 3. Testar Sem Email

```bash
curl -X POST https://URL_DA_SUA_API/api/validate \
     -H "Content-Type: application/json" \
     -d '{}'
```
**Resposta esperada:**
```json
{"active":false,"reason":"missing_email"}
```
