# 🎬 SCRIPTS & COMMANDS - Garagem.Com

## 🚀 Comandos Principais

### Setup Inicial
```bash
npm install              # Instalar dependências (primeira vez)
npm run db:push         # Criar banco de dados
npm run db:seed         # Popular dados de teste
```

### Desenvolvimento
```bash
npm run dev             # Iniciar servidor em http://localhost:3000
npm run build           # Build otimizado para produção
npm start              # Rodar servidor de produção
```

### Database
```bash
npm run db:push         # Sincronizar schema Prisma
npm run db:generate     # Regenerar Prisma client
npm run db:seed         # Repopular dados (limpa antes)
npm run db:studio       # Abrir Prisma Studio (GUI visual)
```

### Qualidade
```bash
npm run lint            # Verificar erros com ESLint
npm audit              # Verificar vulnerabilidades
npm outdated           # Ver dependências desatualizadas
```

---

## 📋 Script Shell (Automação)

### start.sh (Bash/Git Bash)
```bash
#!/bin/bash
echo "🚀 Garagem.Com - Setup Automático"
echo "1️⃣  Instalando dependências..."
npm install
echo "2️⃣  Criando banco de dados..."
npm run db:push
echo "3️⃣  Populando dados de teste..."
npm run db:seed
echo "4️⃣  Iniciando servidor..."
npm run dev
echo "✅ Servidor rodando em http://localhost:3000"
```

**Usar**:
```bash
bash start.sh
```

### install.bat (Command Prompt / PowerShell)
```batch
@echo off
echo 🚀 Garagem.Com - Instalacao
echo 1 - Instalando...
call npm install
echo 2 - Banco de dados...
call npm run db:push
echo 3 - Dados de teste...
call npm run db:seed
echo.
echo ✅ Instalacao completa!
echo Rode: npm run dev
pause
```

**Usar**:
```bash
install.bat
```

---

## 🔄 Workflow Completo

### Primeira Vez (Setup Completo)
```bash
# 1. Abra Git Bash ou CMD
cd C:\Users\Maycon\Desktop\Garagem.Com-system

# 2. Instale dependências
npm install

# 3. Configure banco
npm run db:push
npm run db:seed

# 4. Inicie servidor
npm run dev

# 5. Abra no navegador
http://localhost:3000
```

### Desenvolvimento Diário
```bash
npm run dev              # Inicia servidor
# Modifique código
# Servidor recarrega automaticamente
Ctrl+C                  # Para o servidor
```

### Antes de Fazer Push
```bash
npm run lint            # Verifica erros
npm audit              # Verifica segurança
npm run build          # Testa build
```

### Deploy em Produção
```bash
npm run build          # Build otimizado
npm start             # Inicia servidor prod
# Ou fazer deploy via Vercel, AWS, etc
```

---

## ⚙️ Variáveis de Ambiente

### .env.local (Desenvolvimento)
```bash
# Database
DATABASE_URL="file:./dev.db"

# App
NEXT_PUBLIC_API_URL="http://localhost:3000"

# WhatsApp (Evolution API)
WHATSAPP_API_URL="https://seu-servidor.com"
WHATSAPP_API_KEY="sua_chave_api"
WHATSAPP_INSTANCE_NAME="seu_numero"

# Pagamento (Mercado Pago)
MERCADO_PAGO_ACCESS_TOKEN="seu_token"
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="sua_chave_publica"
```

### .env.production (Produção)
```bash
# Database (usar PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# App
NEXT_PUBLIC_API_URL="https://seu-dominio.com"

# Resto igual ao development
```

---

## 🧪 Testando APIs

### Com curl
```bash
# GET Produtos
curl http://localhost:3000/api/products

# POST Pedido
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João",
    "customerPhone": "11999999999",
    "orderType": "DELIVERY",
    "paymentMethod": "PIX",
    "items": [],
    "subtotal": 97,
    "deliveryTax": 5,
    "total": 102
  }'
```

### Com Postman
1. Importe `API_REFERENCE.md` (tem collection JSON)
2. Crie requisições
3. Teste endpoints

### Com JavaScript
```javascript
// Fetch API
const products = await fetch('/api/products')
  .then(r => r.json())

// Axios
const products = await axios.get('/api/products')
```

---

## 🐛 Debug

### Console Logs
```bash
# No arquivo TypeScript
console.log('[PRODUCTS]', products)

# Ver no terminal
npm run dev
```

### Prisma Studio
```bash
npm run db:studio
# Abre http://localhost:5555
# GUI visual do banco de dados
```

### VS Code Debugger
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 🧹 Limpeza

### Remover Cache
```bash
npm cache clean --force
rm -rf .next
rm -rf node_modules
```

### Remover Banco
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Reset Completo
```bash
rm -rf node_modules package-lock.json .next prisma/dev.db
npm install
npm run db:push
npm run db:seed
npm run dev
```

---

## 📦 Dependency Management

### Ver dependências
```bash
npm list                # Árvore de deps
npm outdated           # Desatualizadas
npm audit             # Vulnerabilidades
```

### Atualizar
```bash
npm update            # Atualizar todas
npm update express    # Atualizar específica
npm audit fix        # Corrigir vulnerabilidades
```

### Remover
```bash
npm uninstall express
npm uninstall -D @types/node  # Dev dependency
```

---

## 🚀 Deploy (Vercel)

### Setup
```bash
npm install -g vercel
vercel
```

### Env Variables
```bash
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_API_URL
vercel env add MERCADO_PAGO_ACCESS_TOKEN
```

### Deploy
```bash
vercel --prod
```

---

## 🔗 URLs Importantes

### Desenvolvimento
```
Home:        http://localhost:3000
Cardápio:    http://localhost:3000/customer
PDV:         http://localhost:3000/dashboard
Cozinha:     http://localhost:3000/kitchen
Admin:       http://localhost:3000/admin
Configurar:  http://localhost:3000/admin/settings
Prisma:      http://localhost:5555 (npm run db:studio)
```

### Produção (exemplo)
```
Home:        https://seu-dominio.com
Cardápio:    https://seu-dominio.com/customer
PDV:         https://seu-dominio.com/dashboard
Admin:       https://seu-dominio.com/admin
```

---

## 📊 Performance

### Build Size
```bash
npm run build
# Verá tamanho dos bundles
```

### Performance Monitoring
```bash
npm run build -- --debug
```

---

## 🆘 Troubleshooting Rápido

```bash
# Porta ocupada
npm run dev -- -p 3001

# Prisma não funciona
npm run db:generate

# Dependências quebradas
rm -rf node_modules && npm install

# Banco corrompido
rm prisma/dev.db && npm run db:push && npm run db:seed

# Build falha
rm -rf .next && npm run build
```

---

## 📋 Checklist de Execução

- [ ] Abrir Git Bash/CMD
- [ ] Navegar para C:\Users\Maycon\Desktop\Garagem.Com-system
- [ ] `npm install` ✅
- [ ] `npm run db:push` ✅
- [ ] `npm run db:seed` ✅
- [ ] `npm run dev` ✅
- [ ] Abrir http://localhost:3000 ✅
- [ ] Sistema rodando! 🎉

---

## 🎯 Próximo Passo

```bash
# Se ainda não fez
npm install && npm run db:push && npm run db:seed && npm run dev

# Se já fez
npm run dev
```

Acesse: http://localhost:3000

---

**Versão**: 0.1.0
**Data**: 14/08/2026
**Completo**: ✅ Sim
