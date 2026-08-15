# 🍕 Garagem.Com - Sistema de Gestão e PDV para Restaurantes

Sistema completo de gerenciamento de pedidos, cardápio digital e ponto de venda (PDV) para restaurantes e serviços de delivery, inspirado no "Garagem.Com".

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Módulos](#módulos)
- [API Routes](#api-routes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)

## ✨ Características

### 📱 Cardápio Digital (Cliente)
- Interface mobile-first responsiva
- Categorias de produtos dinâmicas
- Produtos com imagens e descrições
- Sistema de adicionais/complementos com preço
- Carrinho de compras persistente
- Busca e filtros avançados

### 📊 PDV Dashboard (Atendente/Caixa)
- Quadro Kanban com status de pedidos
- Alerta sonoro para novos pedidos
- Ações rápidas (avançar status, cancelar, alterar tempo)
- Lançamento manual de pedidos
- Impressão térmica (80mm e 58mm)
- Resumo de pedidos em tempo real

### 👨‍🍳 KDS - Kitchen Display System
- Visão simplificada para cozinha
- Fonte grande e legível
- Timer em tempo real
- Indica pedidos prioritários
- Botão rápido para marcar como pronto

### 🔧 Administrativo & Relatórios
- Dashboard com métricas de vendas
- Gráficos de faturamento
- Análise de produtos mais vendidos
- Relatórios por período (dia, semana, mês, ano)
- Gestão de produtos e categorias
- Configuração de taxas de entrega
- Horário de funcionamento
- Integração de métodos de pagamento

### 🚀 Automação WhatsApp (Estrutura)
- Estrutura pronta para integração (Evolution API, Z-API, Baileys)
- Disparo automático de notificações de status
- Templates de mensagens customizáveis

## 🛠️ Tecnologias

### Frontend/Fullstack
- **Next.js 14** - React framework com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Lucide Icons** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de dados
- **TanStack Query** - Estado assíncrono
- **Zustand** - Gerenciamento de estado (opcional)

### Backend
- **Next.js Server Actions / API Routes** - Backend integrado
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL / SQLite** - Banco de dados

### Tempo Real (Próximo)
- **Socket.IO** - WebSockets para notificações real-time
- **Supabase Realtime** - Alternativa a Socket.IO

### Pagamentos
- **PIX** - Geração de QR Code
- **Mercado Pago** - Integração para cartões

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- SQLite ou PostgreSQL

### Passos

1. **Clone o repositório**
```bash
git clone <repo-url>
cd Garagem.com-system
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.local.example .env.local
```
Edite `.env.local` com suas configurações.

4. **Configure o banco de dados**
```bash
# Sincronize o Prisma com o banco
npm run db:push

# Popule com dados de teste
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura de Pastas

```
Garagem.com-system/
├── src/
│   ├── app/
│   │   ├── api/                 # API Routes
│   │   │   ├── products/        # Endpoints de produtos
│   │   │   ├── orders/          # Endpoints de pedidos
│   │   │   ├── categories/      # Endpoints de categorias
│   │   │   └── payments/        # Endpoints de pagamento
│   │   ├── admin/               # Páginas administrativas
│   │   │   ├── page.tsx         # Dashboard de relatórios
│   │   │   └── settings/        # Configurações
│   │   ├── customer/            # Cardápio digital (cliente)
│   │   ├── dashboard/           # PDV Kanban (atendente)
│   │   ├── kitchen/             # KDS (cozinha)
│   │   ├── checkout/            # Checkout
│   │   ├── layout.tsx           # Layout raiz
│   │   ├── page.tsx             # Home
│   │   └── globals.css          # Estilos globais
│   ├── components/              # Componentes reutilizáveis
│   │   ├── layout.tsx           # Layout principal
│   │   ├── product-card.tsx     # Card de produto
│   │   ├── cart-sidebar.tsx     # Sidebar do carrinho
│   │   ├── kanban-card.tsx      # Card do Kanban
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts            # Cliente Prisma
│   │   ├── types.ts             # Tipos TypeScript
│   │   └── utils.ts             # Funções utilitárias
│   └── hooks/                   # React Hooks customizados
├── prisma/
│   ├── schema.prisma            # Schema do banco de dados
│   └── seed.js                  # Script para popular dados
├── public/                      # Arquivos públicos
├── .env.local                   # Variáveis de ambiente
├── tailwind.config.ts           # Configuração Tailwind
├── tsconfig.json                # Configuração TypeScript
├── next.config.js               # Configuração Next.js
└── package.json                 # Dependências do projeto
```

## 🗄️ Configuração do Banco de Dados

### Schema Prisma

O banco de dados inclui as seguintes entidades:

- **User** - Usuários do sistema (admin, atendente, cozinha)
- **Business** - Informações do negócio
- **BusinessHours** - Horário de funcionamento
- **DeliveryZone** - Zonas de entrega com taxas
- **Category** - Categorias de produtos
- **Product** - Produtos/itens do cardápio
- **OptionGroup** - Grupos de opções (ex: Tamanho)
- **OptionItem** - Itens de opção (ex: Pequena, Média, Grande)
- **Order** - Pedidos
- **OrderItem** - Itens do pedido
- **OrderItemOption** - Opções selecionadas no item
- **OrderStatusHistory** - Histórico de mudanças de status
- **Customer** - Clientes
- **Payment** - Pagamentos
- **Notification** - Notificações
- **AuditLog** - Log de auditoria

### Migração e Seed

```bash
# Criar/atualizar schema
npm run db:push

# Popular com dados iniciais
npm run db:seed

# Ver dados no Prisma Studio
npm run db:studio
```

## 🔌 Módulos

### 1. Cardápio Digital (`/customer`)
- Listagem de categorias
- Filtro de produtos
- Detalhes do produto com opções
- Carrinho flutuante
- Checkout com dados do cliente

### 2. PDV Dashboard (`/dashboard`)
- Quadro Kanban com 7 colunas de status
- Atualização automática de status
- Impressão de ticket
- Som de notificação
- Resumo de pedidos

### 3. KDS Cozinha (`/kitchen`)
- Foco total nos itens a preparar
- Timer em tempo real
- Marcar como pronto com 1 clique
- Fonte grande e legível
- Design otimizado para telas grandes

### 4. Admin Dashboard (`/admin`)
- Métrica de faturamento
- Gráficos de vendas por dia
- Análise por forma de pagamento
- Produtos mais vendidos
- Filtro por período

### 5. Configurações (`/admin/settings`)
- Gerenciamento de produtos
- Categorias
- Zonas de entrega
- Métodos de pagamento
- Horário de funcionamento

## 🔌 API Routes

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/[id]` - Obter produto
- `POST /api/products` - Criar produto
- `PUT /api/products/[id]` - Atualizar produto
- `DELETE /api/products/[id]` - Deletar produto

### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/[id]` - Obter pedido
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/[id]` - Atualizar pedido
- `PUT /api/orders/[id]/status` - Atualizar status

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar/atualizar cliente

### Pagamentos
- `POST /api/payments/pix` - Gerar PIX QR Code
- `POST /api/payments/process` - Processar pagamento

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite para dev, use postgresql:// para prod

# Environment
NODE_ENV="development"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# WhatsApp Integration
WHATSAPP_API_KEY=""
WHATSAPP_API_URL=""
WHATSAPP_INSTANCE_NAME=""

# Payment
MERCADO_PAGO_PUBLIC_KEY=""
MERCADO_PAGO_ACCESS_TOKEN=""

# Socket.IO
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# Upload
NEXT_PUBLIC_UPLOAD_URL="/uploads"
```

## 🚀 Desenvolvimento

### Iniciar dev server
```bash
npm run dev
```

### Lint
```bash
npm run lint
```

### Build
```bash
npm run build
npm start
```

### Estrutura de commits
Recomendamos usar commits semânticos:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes

## 🎨 Temas e Cores

As cores principais são configuradas no `tailwind.config.ts`:
- **Primary**: #FF6B35 (Laranja)
- **Secondary**: #004E89 (Azul Marinho)
- **Success**: #06A77D (Verde)
- **Warning**: #FFD966 (Amarelo)
- **Danger**: #D62828 (Vermelho)

## 📱 Responsividade

O projeto é mobile-first com breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Autenticação (Próximo)

Estrutura pronta para implementar:
- NextAuth.js com JWT
- Proteção de rotas
- Roles de usuário (Admin, Atendente, Cozinha, Entrega)

## 🌐 Integração WhatsApp (Próximo)

Implementar com:
- Evolution API
- Z-API
- Baileys

Templates de mensagens:
- Confirmação de pedido
- Pedido em preparo
- Pronto para retirada/entrega
- Saiu para entrega
- Pedido entregue

## 📊 Relatórios (Próximo)

Expandir com:
- Exportação em PDF/Excel
- Gráficos mais detalhados
- Análise de lucro/prejuízo
- Trending de produtos

## 💳 Pagamento (Próximo)

Implementar:
- Integração com Mercado Pago
- Integração com PagSeguro
- Stripe para cartões internacionais
- Geração de QR Code PIX dinâmico

## 🚚 Rastreamento (Próximo)

Implementar:
- Localização em tempo real do entregador
- Notificações ao cliente
- ETA atualizado
- Feedback e avaliações

## 📈 Analytics (Próximo)

Integrar:
- Google Analytics
- Hotjar ou similar
- Rastreamento de conversão
- Heatmaps

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Abra uma issue no GitHub
3. Entre em contato: suporte@Garagemcom.com

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para restaurantes e serviços de delivery**

Versão: 0.1.0
Última atualização: 14/08/2024
