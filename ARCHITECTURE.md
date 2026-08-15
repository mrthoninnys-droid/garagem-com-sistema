# 🏗️ Arquitetura do Sistema - Garagem.Com

## Visão Geral

O Garagem.Com é um sistema Full Stack construído com Next.js 14, que combina cliente e servidor em uma única aplicação. Usa Prisma ORM para gerenciar o banco de dados (SQLite em dev, PostgreSQL em prod).

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Garagem.Com SYSTEM                         │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   NAVEGADOR (WEB)   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼───┐            ┌────▼───┐            ┌────▼───┐
   │CUSTOMER │            │DASHBOARD│           │ KITCHEN │
   │(Menu)   │            │ (PDV)   │           │ (KDS)   │
   └──────────┘            └──────────┘           └──────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   NEXT.JS 14       │
                    │  (App Router)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼───────┐        ┌─────▼────┐        ┌───────▼───┐
   │   API      │        │ Server   │        │ Static    │
   │  Routes    │        │Components│        │  Files    │
   │ (Backend)  │        │          │        │           │
   └────┬────────┘        └──────────┘        └───────────┘
        │
        └────────────┬─────────────────┐
                     │                 │
            ┌────────▼────────┐   ┌────▼──────────┐
            │  PRISMA ORM     │   │ Middleware    │
            │  (Data Layer)   │   │ (Auth, Log)   │
            └────────┬────────┘   └───────────────┘
                     │
        ┌────────────▼────────────┐
        │   DATABASE              │
        │  SQLite (Dev) /         │
        │  PostgreSQL (Prod)      │
        └─────────────────────────┘
```

## Camadas da Arquitetura

### 1. **Camada de Apresentação (Frontend)**

**Tecnologias**: React 18, TypeScript, Tailwind CSS

**Componentes**:
- **Pages** (Páginas Next.js)
  - `/customer` - Interface do cardápio
  - `/dashboard` - PDV Kanban
  - `/kitchen` - KDS
  - `/admin` - Relatórios
  
- **Components** (Componentes Reutilizáveis)
  - `ProductCard` - Card de produto
  - `CartSidebar` - Sidebar do carrinho
  - `Layout` - Layout principal
  - Componentes de formulário

**Estado**:
- Zustand (gerenciamento global de estado)
- React Query (estado assíncrono)
- React Hook Form (formulários)

### 2. **Camada de API (Backend)**

**Tecnologias**: Next.js API Routes, TypeScript

**Endpoints**:

#### Produtos
```
GET    /api/products               - Listar produtos
GET    /api/products/[id]          - Obter produto
POST   /api/products               - Criar produto
PUT    /api/products/[id]          - Atualizar produto
DELETE /api/products/[id]          - Deletar produto
```

#### Pedidos
```
GET    /api/orders                 - Listar pedidos
GET    /api/orders/[id]            - Obter pedido
POST   /api/orders                 - Criar pedido
PUT    /api/orders/[id]            - Atualizar pedido
PUT    /api/orders/[id]/status     - Mudar status
```

#### Categorias
```
GET    /api/categories             - Listar categorias
POST   /api/categories             - Criar categoria
```

#### Clientes
```
GET    /api/customers              - Listar clientes
POST   /api/customers              - Criar/atualizar cliente
```

#### Pagamentos
```
POST   /api/payments/pix           - Gerar PIX
POST   /api/payments/process       - Processar pagamento
```

### 3. **Camada de Dados (Database)**

**ORM**: Prisma

**Entidades Principais**:

```typescript
Business          // Informações do negócio
├── BusinessHours   // Horários de funcionamento
├── DeliveryZone    // Zonas de entrega
└── Category        // Categorias de produtos
    └── Product     // Produtos
        └── OptionGroup   // Grupos de opções
            └── OptionItem // Itens de opção

Order              // Pedidos
├── Customer        // Cliente
├── OrderItem       // Itens do pedido
│   └── OrderItemOption  // Opções selecionadas
├── Payment         // Pagamento
├── OrderStatusHistory   // Histórico de status
└── Notification    // Notificações
```

**Database**:
- SQLite para desenvolvimento
- PostgreSQL para produção

## Fluxo de Dados

### 1️⃣ Fluxo de um Pedido

```
┌─────────────────────────────────────────────────────────┐
│ CLIENTE VÊ CARDÁPIO (GET /api/products)                │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ CLIENTE SELECIONA PRODUTOS + OPÇÕES                    │
│ (Carrinho local - Zustand/LocalStorage)               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ CLIENTE CLICA "CHECKOUT"                               │
│ Preenche: Nome, Telefone, Endereço, Pagamento         │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ POST /api/orders (Criar pedido)                        │
│ - Validar dados                                        │
│ - Criar Order em banco                                │
│ - Criar OrderItems                                     │
│ - Processar pagamento                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ ATENDENTE VÊ PEDIDO NO DASHBOARD                       │
│ GET /api/orders (Status: PENDING)                      │
│ Alerta sonoro dispara                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ ATENDENTE AVANÇA STATUS                                │
│ PUT /api/orders/[id]/status → CONFIRMED               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ COZINHA VÊ PEDIDO NA KDS                               │
│ GET /api/orders (Status: CONFIRMED/PREPARING)         │
│ Tempo começa a rodar                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ COZINHA MARCA "PRONTO"                                 │
│ PUT /api/orders/[id]/status → READY                   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ ATENDENTE AVANÇA: SHIPPED ou DELIVERED                 │
│ PUT /api/orders/[id]/status → SHIPPED/DELIVERED       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ CLIENTE RECEBE NOTIFICAÇÃO                             │
│ (WhatsApp em produção)                                 │
│ "Seu pedido foi entregue! Obrigado!"                  │
└─────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas Detalhada

```
Garagem.Com-system/
│
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes (Backend)
│   │   │   ├── products/
│   │   │   │   └── route.ts        # GET, POST produtos
│   │   │   ├── orders/
│   │   │   │   ├── route.ts        # GET, POST pedidos
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts    # GET, PUT pedido
│   │   │   │       └── status/
│   │   │   │           └── route.ts # PUT mudar status
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   ├── customers/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── payments/
│   │   │       ├── pix/
│   │   │       │   └── route.ts
│   │   │       └── process/
│   │   │           └── route.ts
│   │   │
│   │   ├── customer/               # Cardápio Digital
│   │   │   ├── page.tsx            # Home do cardápio
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # Detalhes do produto
│   │   │   └── layout.tsx
│   │   │
│   │   ├── dashboard/              # PDV Atendimento
│   │   │   ├── page.tsx            # Kanban de pedidos
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx        # Lista de pedidos
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Detalhes do pedido
│   │   │   └── layout.tsx
│   │   │
│   │   ├── kitchen/                # KDS Cozinha
│   │   │   └── page.tsx            # Tela da cozinha
│   │   │
│   │   ├── admin/                  # Administrativo
│   │   │   ├── page.tsx            # Dashboard relatórios
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx        # Configurações
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── delivery/
│   │   │   │   ├── payment/
│   │   │   │   └── hours/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── checkout/               # Checkout
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── page.tsx                # Home / Menu principal
│   │   └── globals.css             # Estilos globais
│   │
│   ├── components/                 # Componentes Reutilizáveis
│   │   ├── layout.tsx              # Layout wrapper
│   │   ├── product-card.tsx
│   │   ├── cart-sidebar.tsx
│   │   ├── kanban-card.tsx
│   │   ├── order-modal.tsx
│   │   ├── product-modal.tsx
│   │   ├── payment-methods.tsx
│   │   ├── form/
│   │   │   ├── login-form.tsx
│   │   │   ├── product-form.tsx
│   │   │   └── checkout-form.tsx
│   │   └── common/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── card.tsx
│   │
│   ├── lib/                        # Utilitários e Configurações
│   │   ├── prisma.ts               # Cliente Prisma
│   │   ├── types.ts                # Tipos TypeScript
│   │   ├── utils.ts                # Funções utilitárias
│   │   ├── constants.ts            # Constantes
│   │   └── validations.ts          # Schemas Zod
│   │
│   ├── hooks/                      # React Hooks Customizados
│   │   ├── useCart.ts              # Hook do carrinho
│   │   ├── useOrders.ts            # Hook de pedidos
│   │   ├── useProducts.ts          # Hook de produtos
│   │   └── useAuth.ts              # Hook de autenticação
│   │
│   ├── context/                    # React Context (opcional)
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   └── middleware.ts               # Middleware Next.js
│
├── prisma/
│   ├── schema.prisma               # Schema do banco
│   ├── seed.js                     # Script seed
│   └── migrations/                 # Histórico de migrações
│
├── public/
│   ├── images/                     # Imagens estáticas
│   ├── icons/                      # Ícones
│   └── uploads/                    # Uploads de usuários
│
├── tests/                          # Testes (próximo)
│   ├── api/
│   ├── components/
│   └── utils/
│
├── .env.local                      # Variáveis de ambiente
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── SETUP.md
├── ARCHITECTURE.md                 # Este arquivo
└── install.bat
```

## Fluxo de Requisições (Request/Response)

### Exemplo: Listar Produtos

```typescript
// 1. CLIENTE (Frontend)
const response = await fetch('/api/products?categoryId=1&take=10');
const data = await response.json();

// 2. SERVIDOR (API Route)
// src/app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  
  // 3. BANCO DE DADOS (Prisma)
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true },
    include: { category: true, optionGroups: true }
  });
  
  // 4. RESPOSTA (JSON)
  return NextResponse.json({
    success: true,
    data: products,
    total: 10,
    page: 1
  });
}

// 5. CLIENTE RENDERIZA
return (
  <div className="grid grid-cols-4 gap-4">
    {products.map(product => (
      <ProductCard key={product.id} {...product} />
    ))}
  </div>
);
```

## Segurança

### Proteções Implementadas

1. **Validação de Entrada**
   - Zod para validação de dados
   - Sanitização de strings

2. **Autenticação** (Próximo)
   - NextAuth.js com JWT
   - Roles de usuário

3. **CORS**
   - Configurado no middleware

4. **Rate Limiting** (Próximo)
   - Limitar requisições por IP

5. **SQL Injection**
   - Protegido por Prisma ORM

## Performance

### Otimizações

1. **Caching**
   - Next.js built-in caching
   - Redis (próximo)

2. **Compressão**
   - Gzip automático

3. **Imagens**
   - Next.js Image component
   - Otimização automática

4. **Código**
   - Code splitting automático
   - Tree shaking

5. **Database**
   - Índices no Prisma
   - N+1 queries evitadas com `include`

## Escalabilidade

### De Desenvolvimento para Produção

**Dev**:
- SQLite local
- Variáveis em `.env.local`
- Logs no console

**Prod**:
- PostgreSQL em RDS/Supabase
- Variáveis em CI/CD
- Logs centralizados (Sentry)
- CDN para imagens (Cloudinary/S3)
- Cache com Redis
- Load balancing

## Integração em Tempo Real (Próximo)

```typescript
// Socket.IO
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('order:new', (order) => {
  // Novo pedido recebido
});

socket.on('order:status-changed', (order) => {
  // Status do pedido mudou
});

// Atualizar em tempo real
socket.emit('order:status-update', {
  orderId: '123',
  status: 'PREPARING'
});
```

## Testes (Próximo)

```typescript
// Jest + React Testing Library
describe('ProductCard', () => {
  it('deve renderizar card do produto', () => {
    const { getByText } = render(
      <ProductCard name="Pizza" price={45} />
    );
    expect(getByText('Pizza')).toBeInTheDocument();
  });
});
```

## CI/CD (Próximo)

```yaml
# GitHub Actions
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm run test
```

---

**Esta arquitetura permite escalabilidade, manutenibilidade e funcionalidades robustas para qualquer restaurante! 🍕🚀**
