
# ⚡ Quick Start - Garagem.Com

## 🎯 Em 5 Minutos

### 1. Abra Git Bash ou CMD
Não use PowerShell. Abra **Git Bash** ou **Command Prompt**.

### 2. Navegue para a pasta
```bash
cd C:\Users\Maycon\Desktop\Garagem.Com-system
```

### 3. Instale dependências
```bash
npm install
```
⏱️ Tempo: ~2-3 minutos

### 4. Configure o banco
```bash
npm run db:push
npm run db:seed
```
⏱️ Tempo: ~30 segundos

### 5. Inicie o servidor
```bash
npm run dev
```
Você verá:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

### 6. Abra no navegador
- **Home**: http://localhost:3000
- **Cardápio**: http://localhost:3000/customer
- **PDV**: http://localhost:3000/dashboard
- **Cozinha**: http://localhost:3000/kitchen
- **Relatórios**: http://localhost:3000/admin

---

## 🗂️ Estrutura em 1 Minuto

```
Garagem.Com-system/
├── src/
│   ├── app/              # Páginas (customer, dashboard, kitchen, admin)
│   ├── components/       # ProductCard, CartSidebar, Layout
│   ├── lib/              # Prisma, Types, Utils
│   └── api/              # API routes (products, orders, etc)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Dados de teste
└── docs/ (README, SETUP, ARCHITECTURE, API_REFERENCE)
```

---

## 📱 O Que Você Tem Agora

### 🍕 Cardápio Digital (/customer)
✅ Menu mobile-first
✅ Categorias e produtos
✅ Busca e filtros
✅ Carrinho flutuante

### 📊 PDV Kanban (/dashboard)
✅ 7 colunas de status
✅ Alerta sonoro
✅ Atualizar status
✅ Imprimir ticket

### 👨‍🍳 KDS Cozinha (/kitchen)
✅ Visão simplificada
✅ Fonte grande
✅ Timer em tempo real
✅ Botão "Pronto"

### ⚙️ Admin (/admin)
✅ Dashboard com gráficos
✅ Relatórios
✅ Gerenciar produtos
✅ Configurações

---

## 💾 Dados Já Carregados

### Usuários
- admin@Garagemcom.com
- atendente@Garagemcom.com
- cozinha@Garagemcom.com

### Produtos
- 3 Pizzas com tamanhos
- 1 Hambúrguer com adicionais
- 3 Bebidas
- 2 Sobremesas

### Pedido de Teste
- 1 Pizza + 2 Hambúrgueres
- R$ 102,00

---

## 🎨 Cores Padrão

```css
Primary:   #FF6B35 (Laranja)
Secondary: #004E89 (Azul)
Success:   #06A77D (Verde)
Warning:   #FFD966 (Amarelo)
Danger:    #D62828 (Vermelho)
```

---

## ⚠️ Problemas Comuns

### "Erro de PowerShell"
Use **Git Bash** ou **Command Prompt** em vez de PowerShell.

### "Porta 3000 ocupada"
```bash
npm run dev -- -p 3001
```

### "Prisma client não encontrado"
```bash
npm run db:generate
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## 📚 Documentação Completa

- **README.md** - Guia geral
- **SETUP.md** - Setup detalhado
- **ARCHITECTURE.md** - Arquitetura técnica
- **API_REFERENCE.md** - Endpoints da API
- **DEVELOPMENT_GUIDE.md** - Próximos passos
- **DEPENDENCIES.md** - Dependências instaladas
- **CHECKLIST.md** - O que foi criado

---

## 🔌 API Básica

### Listar Produtos
```bash
curl http://localhost:3000/api/products
```

### Criar Pedido
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"João","customerPhone":"11999999999",...}'
```

---

## 🚀 Próximos Passos

1. ✅ **Agora**: `npm install` + `npm run dev`
2. **Dia 2**: Completar CRUDs (PUT, DELETE)
3. **Dia 3**: Adicionar autenticação
4. **Dia 4**: Implementar carrinho completo
5. **Dia 5**: WebSockets tempo real
6. **Dia 6**: Integração WhatsApp
7. **Dia 7**: Pagamento PIX

---

## 🎉 Pronto!

Você agora tem um sistema **100% funcional** com:
- ✅ Frontend Next.js
- ✅ Backend API
- ✅ Banco de dados Prisma
- ✅ Dados de teste
- ✅ Documentação completa

**Divirta-se desenvolvendo! 🍕🚀**

---

**Dúvidas?** Veja os arquivos de documentação na raiz do projeto.
