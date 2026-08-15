# 🚀 Guia de Setup - Garagem.com System

## Importante: Restrição de Execução do PowerShell

Se encontrar erro: "execução de scripts foi desabilitada neste sistema", use **Git Bash** ou **CMD** em vez do PowerShell.

## Passos para Setup Completo

### 1. Abra o Terminal no VS Code

**Opção A: Usar Git Bash** (Recomendado)
```bash
# Abra o terminal VS Code (Ctrl + `)
# No dropdown, selecione "Git Bash" em vez de PowerShell
```

**Opção B: Usar CMD**
```bash
# Abra o terminal VS Code (Ctrl + `)
# No dropdown, selecione "Command Prompt" em vez de PowerShell
```

### 2. Instale as dependências

```bash
npm install
```

Isso vai instalar todos os pacotes listados em `package.json`:
- Next.js
- React
- TypeScript
- Prisma
- Tailwind CSS
- Lucide Icons
- React Hook Form
- E outras dependências

**Tempo estimado**: 3-5 minutos (depende da conexão)

### 3. Configure o Banco de Dados

```bash
# Criar/sincronizar o schema
npm run db:push

# Popular com dados de teste (Seed)
npm run db:seed
```

Isso vai:
- Criar o arquivo `prisma/dev.db` (SQLite)
- Criar todas as tabelas
- Inserir dados de exemplo (usuários, produtos, pedidos, etc.)

### 4. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor vai iniciar em: **http://localhost:3000**

Você vai ver algo como:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local
```

### 5. Acesse o Sistema

Abra no navegador e acesse as seguintes páginas:

#### 🏠 **Home/Menu Principal**
- URL: http://localhost:3000
- Mostra todos os módulos do sistema

#### 🍕 **Cardápio Digital (Cliente)**
- URL: http://localhost:3000/customer
- Interface mobile-first
- Visualizar produtos
- Carrinho de compras

#### 📊 **PDV Dashboard (Atendimento)**
- URL: http://localhost:3000/dashboard
- Quadro Kanban de pedidos
- 7 colunas de status
- Som de notificação ativado

#### 👨‍🍳 **KDS - Cozinha**
- URL: http://localhost:3000/kitchen
- Visão simplificada
- Fonte grande
- Timer em tempo real

#### ⚙️ **Configurações**
- URL: http://localhost:3000/admin/settings
- Gerenciar produtos
- Configurar entrega
- Métodos de pagamento
- Horários

#### 📈 **Relatórios & Análises**
- URL: http://localhost:3000/admin
- Dashboard de vendas
- Gráficos de faturamento
- Produtos mais vendidos

---

## Dados de Teste Já Inseridos

Após executar `npm run db:seed`, você terá:

### ✅ Usuários
- Admin: admin@Garagemcom.com
- Atendente: atendente@Garagemcom.com
- Cozinha: cozinha@Garagemcom.com

### ✅ Negócio
- Nome: Pizzaria & Delivery Garagem.com
- Taxa de entrega: R$ 5,00
- 3 Zonas de entrega (Centro, Zona Leste, Zona Oeste)

### ✅ Produtos
- **Pizzas**: Mozzarella, Calabresa, Pepperoni
- **Lanches**: Hambúrguer com adicionais
- **Bebidas**: Refrigerante, Suco, Cerveja
- **Sobremesas**: Brownie, Sorvete

### ✅ Clientes
- João Silva (11999999999)
- Maria Santos (11988888888)

### ✅ Exemplo de Pedido
- 1 Pizza Mozzarella Grande + 2 Hambúrgueres
- Status: CONFIRMADO
- Valor: R$ 102,00

---

## Estrutura de Arquivos Criados

```
Garagem.com-system/
├── src/
│   ├── app/
│   │   ├── api/              # APIs (produtos, pedidos)
│   │   ├── admin/            # Admin e relatórios
│   │   ├── customer/         # Cardápio
│   │   ├── dashboard/        # PDV Kanban
│   │   ├── kitchen/          # KDS
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Home
│   │   └── globals.css       # Estilos globais
│   ├── components/           # Componentes React
│   │   ├── layout.tsx
│   │   ├── product-card.tsx
│   │   └── cart-sidebar.tsx
│   ├── lib/
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── types.ts          # Tipos TypeScript
│   │   └── utils.ts          # Funções utilitárias
│   └── hooks/                # React Hooks
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   └── seed.js               # Dados de teste
├── package.json              # Dependências
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local
├── .gitignore
└── README.md
```

---

## Scripts NPM Disponíveis

```bash
# Desenvolvimento
npm run dev           # Inicia servidor de desenvolvimento

# Build
npm run build         # Build para produção
npm start            # Inicia servidor de produção

# Lint
npm run lint         # Verifica erros de código

# Database
npm run db:push      # Sincroniza schema com banco
npm run db:generate  # Gera cliente Prisma
npm run db:seed      # Popula com dados de teste
npm run db:studio    # Abre Prisma Studio (GUI visual)
```

---

## Solução de Problemas

### ❌ "node_modules não encontrado"
```bash
npm install
```

### ❌ "Erro no Prisma"
```bash
# Regenerar cliente Prisma
npm run db:generate

# Sincronizar schema
npm run db:push
```

### ❌ "Porta 3000 já em uso"
```bash
# Mudar porta
npm run dev -- -p 3001
```

### ❌ "Cannot find module '@/'..."
- Certifique-se que `tsconfig.json` tem `"@/*": ["./src/*"]`

---

## Próximas Etapas

### 1️⃣ Personalização
- Alterar cores em `tailwind.config.ts`
- Mudar textos e logos
- Adicionar seu negócio real

### 2️⃣ Integração WhatsApp
- Instalar Evolution API ou Z-API
- Adicionar credenciais em `.env.local`
- Implementar envio de mensagens

### 3️⃣ Pagamentos
- Integrar Mercado Pago
- Gerar QR Code PIX
- Processar pagamentos

### 4️⃣ Deploy
- Vercel (recomendado para Next.js)
- AWS
- Railway
- Render

---

## Arquivos de Configuração Importantes

### `.env.local`
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
WHATSAPP_API_KEY=""
MERCADO_PAGO_PUBLIC_KEY=""
```

### `tailwind.config.ts`
- Cores customizadas
- Fontes
- Temas

### `tsconfig.json`
- Alias de importação (`@/*`)
- Configurações TypeScript

---

## Dúvidas?

1. Consulte o README.md
2. Verifique a documentação Next.js: https://nextjs.org
3. Verifique Prisma: https://www.prisma.io/docs/
4. Verifique Tailwind: https://tailwindcss.com/docs

---

**Sucesso! 🚀 Você agora tem um sistema completo de gestão de restaurantes!**
