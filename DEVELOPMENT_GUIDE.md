# 🚀 Guia de Desenvolvimento - Garagem.Com

## Fases de Desenvolvimento

### ✅ FASE 1: Estrutura Base (CONCLUÍDA)
- [x] Criação da estrutura Next.js
- [x] Setup de Tailwind CSS
- [x] Schema Prisma completo
- [x] Dados de teste (seed)
- [x] Páginas principais
- [x] API routes básicas
- [x] Componentes reutilizáveis
- [x] Documentação

**Status**: Pronto para npm install

---

## 📋 FASE 2: Completar CRUDs (2-3 dias)

### Produtos
```typescript
// src/app/api/products/[id]/route.ts
export async function GET(req: Request, { params }) // ✅ Já existe
export async function PUT(req: Request, { params }) // TODO
export async function DELETE(req: Request, { params }) // TODO
```

### Pedidos
```typescript
// src/app/api/orders/[id]/status/route.ts
export async function PUT(req: Request) // TODO - Atualizar status
```

### Implementação:
```typescript
// PUT /api/products/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id: params.id },
      data: body,
      include: { optionGroups: true }
    });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## 🔐 FASE 3: Autenticação (3-4 dias)

### Setup NextAuth.js
```bash
npm install next-auth
```

### Estrutura
```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email }
        })
        if (user && user.password === credentials?.password) {
          return user
        }
        return null
      }
    })
  ]
}

export const handler = NextAuth(authOptions)
```

### Middleware
```typescript
// src/middleware.ts
export { default } from "next-auth/middleware"
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] }
```

### Login Page
```typescript
// src/app/login/page.tsx
'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const handleSubmit = async (e) => {
    const result = await signIn('credentials', {
      email: 'admin@Garagemcom.com',
      password: 'admin123',
      redirect: true,
      callbackUrl: '/dashboard'
    })
  }
  
  return (
    // Form de login
  )
}
```

---

## 🔄 FASE 4: Carrinho & Checkout (3-4 dias)

### State Management com Zustand
```typescript
// src/lib/store.ts
import create from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  productId: string
  quantity: number
  selectedOptions: any[]
}

export const useCartStore = create(
  persist(
    (set) => ({
      items: [] as CartItem[],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.productId !== id)
      })),
      clearCart: () => set({ items: [] })
    }),
    { name: 'cart' }
  )
)
```

### Checkout Flow
```typescript
// src/app/checkout/page.tsx
'use client'

export default function CheckoutPage() {
  const { items, total } = useCartStore()
  
  const handleSubmit = async (formData) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        items: items,
        subtotal: calculateSubtotal(items),
        deliveryTax: 5.0,
        total: total
      })
    })
    
    if (response.ok) {
      router.push('/order-confirmation')
    }
  }
}
```

---

## 🌐 FASE 5: WebSockets Tempo Real (4-5 dias)

### Setup Socket.IO
```bash
npm install socket.io socket.io-client
```

### Server
```typescript
// src/lib/socket.ts
import { Server as HTTPServer } from 'http'
import { Socket, Server as SocketIOServer } from 'socket.io'

export let io: SocketIOServer

export function socketHandler(req: any, res: any) {
  if (!io) {
    const httpServer = res.socket.server as HTTPServer
    io = new SocketIOServer(httpServer, {
      path: '/api/socketio'
    })
  }
  res.socket.server.io = io
  res.end()
}
```

### Client
```typescript
// src/lib/socket-client.ts
import { io } from 'socket.io-client'

export const socket = io('http://localhost:3000/api/socketio')

// Listeners
socket.on('order:new', (order) => {
  console.log('Novo pedido:', order)
  playNotificationSound()
})

socket.on('order:status-changed', (order) => {
  console.log('Status mudou:', order.status)
})
```

### Emitir Eventos
```typescript
// Quando criar pedido
const order = await createOrder(data)
socket.emit('order:new', order)

// Quando mudar status
socket.emit('order:status-changed', { orderId, status })
```

---

## 💬 FASE 6: WhatsApp Integration (3-4 dias)

### Setup Evolution API
```bash
npm install axios
```

### Service
```typescript
// src/lib/whatsapp.ts
import axios from 'axios'

const API_URL = process.env.WHATSAPP_API_URL
const API_KEY = process.env.WHATSAPP_API_KEY

export async function sendOrderNotification(order: Order) {
  try {
    await axios.post(
      `${API_URL}/message/sendText/${process.env.WHATSAPP_INSTANCE_NAME}`,
      {
        number: order.customerPhone,
        text: `Olá ${order.customerName}! 🍕\n\nSeu pedido foi ${order.status}.\nEstimado: ${order.estimatedTime} min`
      },
      { headers: { 'apikey': API_KEY } }
    )
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
  }
}
```

### Integrar com Pedidos
```typescript
// src/app/api/orders/route.ts
const order = await prisma.order.create({ ... })
await sendOrderNotification(order) // ✅ Enviar WhatsApp
```

---

## 💳 FASE 7: Pagamentos (3-4 dias)

### Integração Mercado Pago
```bash
npm install @mercadopago/sdk-nodejs
```

### PIX
```typescript
// src/lib/payment.ts
import { MercadoPagoConfig, Payment } from '@mercadopago/sdk-nodejs'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
})

export async function generatePixQRCode(amount: number) {
  const payment = new Payment(client)
  const result = await payment.create({
    body: {
      transaction_amount: amount,
      payment_method_id: 'pix',
      payer: { email: 'test@test.com' }
    }
  })
  
  return {
    qrCode: result.point_of_interaction.transaction_data.qr_code,
    copyPaste: result.point_of_interaction.transaction_data.qr_code_base64
  }
}
```

### Payment Webhook
```typescript
// src/app/api/webhooks/payment/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  const order = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      paymentStatus: data.status === 'approved' ? 'APPROVED' : 'FAILED'
    }
  })
  
  if (data.status === 'approved') {
    await sendOrderNotification(order)
  }
  
  return NextResponse.json({ success: true })
}
```

---

## 📊 FASE 8: Relatórios Avançados (3 dias)

### Exportar PDF
```bash
npm install jspdf html2canvas
```

### Função
```typescript
// src/lib/reports.ts
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportOrdersPDF() {
  const element = document.getElementById('report')
  const canvas = await html2canvas(element)
  const pdf = new jsPDF()
  
  pdf.addImage(canvas.toDataURL(), 'PNG', 0, 0, 210, 297)
  pdf.save('relatorio.pdf')
}
```

---

## 🧪 FASE 9: Testes (2-3 dias)

### Setup Jest
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Exemplo de Teste
```typescript
// src/__tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/product-card'

describe('ProductCard', () => {
  it('deve renderizar nome do produto', () => {
    render(
      <ProductCard
        id="1"
        name="Pizza"
        price={45}
        onAddToCart={() => {}}
      />
    )
    
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })
})
```

---

## 🚀 FASE 10: Deploy (2 dias)

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Configurar Variáveis
```
DATABASE_URL = (PostgreSQL em prod)
NEXT_PUBLIC_API_URL = (URL da API)
WHATSAPP_API_KEY = (...)
MERCADO_PAGO_ACCESS_TOKEN = (...)
```

### Database em Produção
```bash
# Criar PostgreSQL em Supabase ou AWS RDS
# Atualizar DATABASE_URL no .env.production

vercel env add DATABASE_URL
vercel deploy --prod
```

---

## 📈 Roadmap Completo

```
AGORA ─────────────────────────────────────────── 3 MESES
│
├─ Semana 1-2: CRUDs completos ✅
├─ Semana 2-3: Autenticação ✅
├─ Semana 3-4: Carrinho & Checkout ✅
├─ Semana 5-6: WebSockets ✅
├─ Semana 6-7: WhatsApp ✅
├─ Semana 7-8: Pagamentos ✅
├─ Semana 8-9: Relatórios ✅
├─ Semana 9-10: Testes ✅
└─ Semana 11-12: Deploy em Produção ✅
```

---

## 💡 Dicas de Desenvolvimento

### 1. Use Prisma Studio
```bash
npm run db:studio
```
Para visualizar e editar dados em tempo real.

### 2. Estruture suas componentes
```typescript
// Estrutura recomendada
export function Component() {
  const [state, setState] = useState()
  const { data } = useQuery()
  
  return (
    <div>
      {/* Template */}
    </div>
  )
}
```

### 3. Sempre valide dados
```typescript
// Usar Zod
const schema = z.object({
  name: z.string().min(3),
  price: z.number().positive()
})

const result = schema.parse(data)
```

### 4. Versione sua API
```typescript
// v1 em production
export async function GET(req, { params }) {
  // /api/v1/products
}
```

---

## 🐛 Debugging

### VS Code Debug
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

### Logs
```typescript
console.log('[PRODUCTS]', products) // Prefixar logs
```

---

## 🔗 Recursos Úteis

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs/
- **Socket.IO**: https://socket.io/docs/
- **Evolution API**: https://evolution-api.gitbook.io/

---

**Próxima Etapa**: Instalar dependências e começar Fase 2!

```bash
npm install
npm run dev
```

Bom desenvolvimento! 🚀
