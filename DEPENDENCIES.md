# 📦 Dependências do Projeto - Garagem.Com

## Versões Principais

```json
{
  "name": "Garagem.Com-system",
  "version": "0.1.0",
  "description": "Sistema de Gestão e PDV para Restaurantes",
  "license": "Private"
}
```

## 🔧 Dependências Instaladas

### Framework & Core
- **next**: ^14.0.0 - React framework com App Router
- **react**: ^18.2.0 - Biblioteca UI
- **react-dom**: ^18.2.0 - Renderização DOM

### Database & ORM
- **@prisma/client**: ^5.7.0 - Cliente Prisma
- **prisma**: ^5.7.0 - Prisma CLI

### Estado e Cache
- **@tanstack/react-query**: ^5.28.0 - Gerenciamento de estado assíncrono
- **zustand**: ^4.4.1 - Estado global (opcional, alternativa)

### Formulários e Validação
- **react-hook-form**: ^7.48.0 - Gerenciamento de formulários
- **@hookform/resolvers**: ^3.3.4 - Integradores para validação
- **zod**: ^3.22.4 - Validação de schema TypeScript-first

### Estilização
- **tailwindcss**: ^3.3.0 - CSS utilities
- **autoprefixer**: ^10.4.16 - Prefixos CSS automáticos
- **postcss**: ^8.4.31 - Processador CSS
- **clsx**: ^2.0.0 - Utilitário para classes condicionais
- **tailwind-merge**: ^2.2.0 - Merge de classes Tailwind

### UI & Ícones
- **lucide-react**: ^0.292.0 - Ícones SVG

### Utilitários
- **axios**: ^1.6.2 - HTTP client
- **socket.io-client**: ^4.7.2 - WebSockets (estrutura)
- **date-fns**: ^2.30.0 - Manipulação de datas

## 🛠️ DevDependencies

### TypeScript
- **typescript**: ^5.2.0 - Linguagem de tipagem
- **@types/node**: ^20.8.0 - Tipos Node.js
- **@types/react**: ^18.2.0 - Tipos React
- **@types/react-dom**: ^18.2.0 - Tipos React DOM

### Linting
- **eslint**: ^8.50.0 - Linter de código
- **eslint-config-next**: ^14.0.0 - Config ESLint para Next.js

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em http://localhost:3000
npm run build            # Build otimizado para produção
npm start               # Inicia servidor de produção

# Qualidade de Código
npm run lint            # Verifica erros de sintaxe

# Database
npm run db:push         # Sincroniza Prisma schema com banco
npm run db:generate     # Regenera Prisma client
npm run db:seed         # Popula banco com dados de teste
npm run db:studio       # Abre Prisma Studio (GUI visual)
```

## 📋 Total de Dependências

- **Dependências de Produção**: 13
- **DevDependencies**: 6
- **Total**: 19 pacotes

## 🔄 Resolução de Dependências

Todas as dependências foram testadas para compatibilidade:
- ✅ Next.js 14 com React 18
- ✅ Prisma 5.7 com TypeScript 5.2
- ✅ Tailwind CSS 3.3 com PostCSS 8.4
- ✅ React Hook Form com Zod
- ✅ TanStack Query com Zustand

## 💾 Tamanho Estimado

```
node_modules/: ~800MB (após npm install)
.next/: ~200MB (após npm run build)
dist/: ~50MB (se exportar)
```

## 🔐 Segurança

Todas as dependências estão em versões estáveis e seguras:
- ✅ Sem vulnerabilidades conhecidas (ao criar)
- ✅ Dependências auditadas: `npm audit`
- ✅ Atualizações disponíveis: `npm outdated`

## 📦 Como Usar as Dependências

### Prisma ORM
```typescript
import { prisma } from '@/lib/prisma';

const products = await prisma.product.findMany();
```

### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema)
});
```

### TanStack Query
```typescript
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['products'],
  queryFn: () => fetch('/api/products').then(r => r.json())
});
```

### Tailwind CSS
```tsx
<div className="bg-primary text-white p-4 rounded-lg">
  Conteúdo estilizado
</div>
```

### Lucide Icons
```tsx
import { ShoppingCart, Menu } from 'lucide-react';

<ShoppingCart size={24} className="text-primary" />
```

### Date-fns
```typescript
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
```

## 🆘 Troubleshooting

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Prisma client not found"
```bash
# Regenerar Prisma client
npm run db:generate
```

### Erro ao instalar em PowerShell
```bash
# Use Git Bash ou CMD em vez de PowerShell
bash
npm install
```

## 📚 Documentação Oficial

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs/
- Prisma: https://www.prisma.io/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev
- TanStack Query: https://tanstack.com/query
- Lucide: https://lucide.dev

## ✅ Checklist de Verificação

- [x] Todas as dependências instaladas
- [x] Tipos TypeScript configurados
- [x] Tailwind CSS funcionando
- [x] Prisma ORM pronto
- [x] React Hook Form integrado
- [x] Validação com Zod pronta
- [x] ESLint configurado
- [x] Scripts npm definidos

---

**Versão**: 0.1.0
**Atualizado**: 14/08/2026
**Status**: ✅ Pronto para usar
