# 🆘 TROUBLESHOOTING - Garagem.com

## ⚠️ Problemas Comuns e Soluções

---

## 1️⃣ PowerShell - "Execução de scripts foi desabilitada"

### Erro
```
O arquivo C:\Program Files\nodejs\npx.ps1 não pode ser carregado porque 
a execução de scripts foi desabilitada neste sistema
```

### Solução
**NÃO use PowerShell.** Use um destes:
- ✅ **Git Bash** (melhor opção)
- ✅ **Command Prompt (CMD)**
- ✅ **Windows Terminal**

### Como Usar
```bash
# Abra Git Bash no projeto
Clique direito → Git Bash Here

# OU abra CMD
Windows + R → cmd → Enter
cd C:\Users\Maycon\Desktop\Garagem.com-system
```

---

## 2️⃣ Porta 3000 Já Está Sendo Usada

### Erro
```
Port 3000 is already in use
```

### Solução 1: Usar outra porta
```bash
npm run dev -- -p 3001
```
Acesse: http://localhost:3001

### Solução 2: Liberar porta 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Git Bash
lsof -i :3000
kill -9 <PID>
```

---

## 3️⃣ npm install Falha

### Erro
```
npm ERR! code E500
npm ERR! 500 Internal Server Error
```

### Solução
```bash
# Limpar cache
npm cache clean --force

# Tentar novamente
npm install

# Se ainda falhar
rm -rf node_modules package-lock.json
npm install
```

---

## 4️⃣ Prisma Client Não Encontrado

### Erro
```
Error: @prisma/client could not find the generated Prisma Client
```

### Solução
```bash
npm run db:generate
```

Se não funcionar:
```bash
npm install
npm run db:generate
npm run db:push
```

---

## 5️⃣ Database Lock

### Erro
```
database is locked
SQLITE_IOERR_LOCK
```

### Solução
```bash
# Remover banco bloqueado
rm prisma/dev.db

# Recrear
npm run db:push
npm run db:seed
```

---

## 6️⃣ Erro ao fazer Seed

### Erro
```
Error: UNIQUE constraint failed: User.email
```

### Solução
```bash
# Limpar e reciar banco
rm prisma/dev.db

# Regenerar schema
npm run db:push

# Fazer seed novamente
npm run db:seed
```

---

## 7️⃣ Module Not Found

### Erro
```
Module not found: Can't resolve '@/components/product-card'
```

### Solução
```bash
# Limpar next cache
rm -rf .next

# Reinstalar
rm -rf node_modules
npm install

# Tentar dev novamente
npm run dev
```

---

## 8️⃣ TypeScript Error

### Erro
```
Type 'string' is not assignable to type 'number'
```

### Solução
1. Verifique o arquivo com erro
2. Verifique tipos em `src/lib/types.ts`
3. Use `npm run lint` para ver erros

```bash
npm run lint
```

---

## 9️⃣ CORS Error

### Erro
```
Access to XMLHttpRequest blocked by CORS policy
```

### Solução
Adicione ao `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}
```

---

## 🔟 Arquivo Não Encontrado

### Erro
```
ENOENT: no such file or directory, open '...'
```

### Solução
1. Verifique se o arquivo existe
2. Verifique o path (maiúsculas/minúsculas)
3. Recrie o arquivo manualmente

```bash
# Recrie arquivo
touch src/app/page.tsx
```

---

## 1️⃣1️⃣ npm audit Vulnerabilidades

### Aviso
```
found X vulnerabilities
```

### Solução
```bash
# Ver vulnerabilidades
npm audit

# Corrigir automaticamente
npm audit fix

# Forçar correção
npm audit fix --force
```

---

## 1️⃣2️⃣ Build Falha

### Erro
```
Build failed
```

### Solução
```bash
# Limpar cache
rm -rf .next

# Verificar erros
npm run lint

# Fazer build novamente
npm run build
```

---

## 1️⃣3️⃣ API Retorna 404

### Erro
```
404 Not Found - GET /api/products
```

### Solução
1. Verifique se arquivo existe em `src/app/api/products/route.ts`
2. Verifique método HTTP (GET, POST)
3. Reinicie servidor: `npm run dev`

```bash
# Verificar arquivo
ls src/app/api/products/
```

---

## 1️⃣4️⃣ Servidor Não Inicia

### Erro
```
Error: listen EADDRINUSE :::3000
```

### Solução
```bash
# Porta 3000 ocupada (ver problema 2)
npm run dev -- -p 3001
```

---

## 1️⃣5️⃣ Node Modules Corrompido

### Erro
```
Module not found
ENOENT errors
```

### Solução NUCLEAR (funciona sempre)
```bash
# Remova tudo
rm -rf node_modules
rm package-lock.json

# Reinstale
npm install

# Verifique
npm list

# Tente dev
npm run dev
```

---

## 🔍 Checklist de Troubleshooting

- [ ] Usando Git Bash ou CMD (não PowerShell)?
- [ ] npm install rodou com sucesso?
- [ ] npm run db:push rodou com sucesso?
- [ ] npm run db:seed rodou com sucesso?
- [ ] Servidor está rodando? (`npm run dev`)
- [ ] Está acessando http://localhost:3000?
- [ ] Consola do navegador sem erros?
- [ ] Terminal do servidor sem erros?

---

## 🛠️ Comandos Úteis

### Verificação
```bash
node --version          # Verificar Node
npm --version           # Verificar NPM
npm list                # Listar pacotes
npm audit              # Verificar vulnerabilidades
```

### Limpeza
```bash
npm cache clean --force # Limpar cache npm
rm -rf .next            # Limpar cache Next
rm -rf node_modules     # Remover node_modules
```

### Database
```bash
npm run db:studio       # Abrir Prisma Studio (GUI)
npm run db:generate     # Regenerar Prisma client
npm run db:push         # Sync schema
npm run db:seed         # Popular dados
```

### Desenvolvimento
```bash
npm run dev             # Iniciar dev
npm run build           # Build produção
npm start              # Servidor produção
npm run lint           # Verificar linting
```

---

## 📞 Se Nada Funcionar

1. **Reinicie seu computador** (resolve 50% dos problemas!)
2. **Abra pasta com Git Bash**
3. **Rode o comando NUCLEAR**:
   ```bash
   rm -rf node_modules package-lock.json .next
   npm install
   npm run db:push
   npm run db:seed
   npm run dev
   ```

4. **Se AINDA não funcionar**, verifique:
   - Node.js instalado? (`node -v`)
   - Git instalado? (`git -v`)
   - Pasta correta? (`pwd`)
   - Arquivo package.json existe? (`ls package.json`)

---

## 📚 Leia Também

- QUICKSTART.md - Setup rápido
- SETUP.md - Setup detalhado
- README.md - Documentação completa
- API_REFERENCE.md - Problemas com API

---

## 🎯 Próxima Ação

Após resolver o problema:
```bash
npm run dev
```

Abra: http://localhost:3000

**Boa sorte! 🚀**

---

**Versão**: 0.1.0
**Atualizado**: 14/08/2026
**Status**: ✅ Completo
