# Como publicar na internet

## Banco de dados — Neon.tech (gratuito)

1. Acesse https://neon.tech e crie uma conta gratuita
2. Clique em **"New Project"** → dê um nome → clique **Create**
3. Na tela seguinte copie as duas connection strings:
   - **Connection string (pooled)** → cole em `DATABASE_URL`
   - **Direct connection** → cole em `DATABASE_URL_UNPOOLED`
4. Após configurar o `.env.local` com as strings reais, rode:
   ```bash
   npx prisma migrate deploy
   ```

---

## Opção A — Vercel (mais simples, gratuito)

### 1. Subir o código no GitHub
```bash
cd /Users/rodrigopaiva/agendamento
git init
git add .
git commit -m "primeiro commit"
```
Crie um repositório em https://github.com/new e siga as instruções de push.

### 2. Deploy no Vercel
1. Acesse https://vercel.com → entre com GitHub
2. Clique **"Add New Project"** → selecione o repositório
3. Clique **Deploy** (Vercel detecta Next.js automaticamente)

### 3. Variáveis de ambiente no Vercel
No painel do projeto → **Settings → Environment Variables**, adicione:
```
DATABASE_URL          = (connection string pooled do Neon)
DATABASE_URL_UNPOOLED = (direct connection do Neon)
GOOGLE_CLIENT_ID      = (seu client ID)
GOOGLE_CLIENT_SECRET  = (seu client secret)
AUTH_SECRET           = (mesmo valor do .env.local)
NEXTAUTH_URL          = https://seu-projeto.vercel.app
```

### 4. Atualizar Google Cloud Console
Em **Credenciais → seu app OAuth**, adicione a URL do Vercel:
- Origens autorizadas: `https://seu-projeto.vercel.app`
- URI de redirecionamento: `https://seu-projeto.vercel.app/api/auth/callback/google`

---

## Opção B — Hostinger VPS (plano KVM 1 ou superior)

> Requer plano **VPS** (a partir de ~R$25/mês). Hosting compartilhado não suporta Node.js.

### 1. Acesse o VPS via SSH
```bash
ssh root@IP_DO_SEU_VPS
```

### 2. Instale Node.js e PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

### 3. Instale o Nginx
```bash
sudo apt install nginx -y
```

### 4. Faça upload do projeto
No seu Mac, envie os arquivos para o servidor:
```bash
# No seu Mac — exclui node_modules e .next
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='prisma/dev.db' \
  /Users/rodrigopaiva/agendamento/ root@IP_DO_SEU_VPS:/var/www/agendamento/
```

### 5. No servidor, configure e inicie a aplicação
```bash
cd /var/www/agendamento

# Crie o .env.local com as variáveis reais
nano .env.local

# Instale dependências, migre o banco e faça o build
npm install
npx prisma migrate deploy
npm run build

# Inicie com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure o Nginx como proxy reverso
```bash
nano /etc/nginx/sites-available/agendamento
```

Cole o conteúdo:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO_OU_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/agendamento /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 7. HTTPS com Let's Encrypt (opcional mas recomendado)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d SEU_DOMINIO
```

---

## Comparativo

| | Vercel | Hostinger VPS |
|---|---|---|
| Preço | Gratuito | ~R$25/mês |
| Configuração | 5 minutos | ~30 minutos |
| Manutenção | Zero | Você cuida do servidor |
| Performance | Excelente | Boa (depende do plano) |
| Domínio próprio | Sim (gratuito *.vercel.app) | Sim |
| SSL (HTTPS) | Automático | Manual (Let's Encrypt) |

**Recomendação:** Comece com Vercel. Se precisar de mais controle ou já tiver o VPS Hostinger, use a Opção B.
