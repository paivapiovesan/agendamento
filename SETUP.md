# Como configurar o Google Cloud Console

## 1. Criar projeto no Google Cloud

1. Acesse https://console.cloud.google.com
2. Clique em **"Selecionar projeto"** → **"Novo projeto"**
3. Dê um nome (ex: `meu-agendamento`) e clique em **Criar**

## 2. Ativar a API do Google Calendar

1. No menu lateral, acesse **"APIs e serviços"** → **"Biblioteca"**
2. Pesquise por **"Google Calendar API"**
3. Clique nela e depois em **"Ativar"**

## 3. Configurar tela de consentimento OAuth

1. Acesse **"APIs e serviços"** → **"Tela de consentimento OAuth"**
2. Selecione **"Externo"** e clique em **Criar**
3. Preencha:
   - Nome do app: `Meu Agendamento`
   - E-mail de suporte: seu email
   - E-mail do desenvolvedor: seu email
4. Clique em **Salvar e continuar** nas próximas etapas
5. Na etapa **"Escopos"**, adicione:
   - `https://www.googleapis.com/auth/calendar`
6. Na etapa **"Usuários de teste"**, adicione seu e-mail Google
7. Finalize clicando em **Salvar**

## 4. Criar credenciais OAuth

1. Acesse **"APIs e serviços"** → **"Credenciais"**
2. Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth"**
3. Selecione **"Aplicativo da Web"**
4. Em **"Origens JavaScript autorizadas"**, adicione:
   - `http://localhost:3000`
5. Em **"URIs de redirecionamento autorizados"**, adicione:
   - `http://localhost:3000/api/auth/callback/google`
6. Clique em **Criar**
7. Copie o **Client ID** e o **Client Secret**

## 5. Configurar o arquivo .env.local

Abra o arquivo `.env.local` na raiz do projeto e preencha:

```
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID=cole_seu_client_id_aqui
GOOGLE_CLIENT_SECRET=cole_seu_client_secret_aqui
AUTH_SECRET=cole_uma_string_aleatoria_aqui
NEXTAUTH_URL=http://localhost:3000
```

Para gerar o AUTH_SECRET, execute no terminal:
```bash
openssl rand -base64 32
```

## 6. Rodar o projeto

```bash
npm run dev
```

Acesse:
- **Página de agendamento**: http://localhost:3000
- **Painel admin**: http://localhost:3000/admin
