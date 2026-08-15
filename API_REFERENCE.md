# 🔌 API Reference - Garagem.Com

## Base URL
```
http://localhost:3000/api
```

## 📋 Índice de Endpoints

1. [Produtos](#produtos)
2. [Pedidos](#pedidos)
3. [Categorias](#categorias)
4. [Clientes](#clientes)
5. [Pagamentos](#pagamentos)

---

## 🍕 Produtos

### Listar Produtos
```http
GET /api/products?categoryId=1&search=pizza&skip=0&take=10
```

**Query Parameters**:
- `categoryId` (string, optional) - Filtrar por categoria
- `search` (string, optional) - Buscar por nome/descrição
- `skip` (number, default: 0) - Paginação
- `take` (number, default: 10) - Itens por página

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Pizza Mozzarella",
      "description": "Molho, mozzarella e orégano",
      "price": 45.0,
      "image": "/images/pizza.jpg",
      "isActive": true,
      "category": { "id": "cat_1", "name": "Pizzas" },
      "optionGroups": [
        {
          "id": "opt_1",
          "name": "Tamanho",
          "options": [
            { "id": "opt_item_1", "name": "P", "priceExtra": 0 },
            { "id": "opt_item_2", "name": "M", "priceExtra": 5 }
          ]
        }
      ]
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

### Criar Produto
```http
POST /api/products
Content-Type: application/json

{
  "name": "Pizza Pepperoni",
  "description": "Molho, pepperoni e mozzarella",
  "price": 55.0,
  "categoryId": "cat_1",
  "image": "/images/pepperoni.jpg"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { "id": "prod_124", "name": "Pizza Pepperoni", ... },
  "message": "Produto criado com sucesso"
}
```

---

## 📦 Pedidos

### Listar Pedidos
```http
GET /api/orders?status=PENDING&skip=0&take=20
```

**Query Parameters**:
- `status` (string, optional) - Filtrar por status (PENDING, CONFIRMED, PREPARING, READY, SHIPPED, DELIVERED, CANCELLED)
- `skip` (number, default: 0) - Paginação
- `take` (number, default: 20) - Itens por página

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "order_1",
      "customerName": "João Silva",
      "customerPhone": "11999999999",
      "orderType": "DELIVERY",
      "status": "PENDING",
      "paymentMethod": "PIX",
      "subtotal": 97.0,
      "deliveryTax": 5.0,
      "total": 102.0,
      "estimatedTime": 30,
      "items": [
        {
          "id": "item_1",
          "productId": "prod_123",
          "quantity": 1,
          "unitPrice": 45.0,
          "options": [
            { "name": "Tamanho: Grande", "priceExtra": 7.0 }
          ]
        }
      ],
      "customer": { "id": "cust_1", "name": "João Silva" },
      "statusHistory": [
        { "status": "PENDING", "changedAt": "2024-08-14T10:30:00Z" }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

### Criar Pedido
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "Maria Santos",
  "customerPhone": "11988888888",
  "customerEmail": "maria@email.com",
  "deliveryAddress": "Rua A, 123",
  "deliveryCity": "São Paulo",
  "deliveryZip": "01000-000",
  "deliveryNumber": "123",
  "orderType": "DELIVERY",
  "paymentMethod": "PIX",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 1,
      "unitPrice": 45.0,
      "subtotal": 52.0,
      "selectedOptions": [
        {
          "optionItemId": "opt_item_2",
          "optionName": "Tamanho: Grande",
          "priceExtra": 7.0
        }
      ]
    },
    {
      "productId": "prod_125",
      "quantity": 2,
      "unitPrice": 28.0,
      "subtotal": 56.0,
      "selectedOptions": [
        {
          "optionItemId": "opt_item_3",
          "optionName": "Bem Passado",
          "priceExtra": 0
        }
      ]
    }
  ],
  "subtotal": 97.0,
  "deliveryTax": 5.0,
  "total": 102.0,
  "notes": "Sem cebola na pizza"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { "id": "order_2", ... },
  "message": "Pedido criado com sucesso"
}
```

### Atualizar Status do Pedido
```http
PUT /api/orders/order_1/status
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Confirmado e enviado para cozinha"
}
```

---

## 🏷️ Categorias

### Listar Categorias
```http
GET /api/categories
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_1",
      "name": "Pizzas",
      "description": "Pizzas tradicionais e especiais",
      "icon": "Pizza",
      "order": 1,
      "isActive": true,
      "_count": { "products": 3 }
    },
    {
      "id": "cat_2",
      "name": "Lanches",
      "description": "Hambúrgueres e sanduíches",
      "icon": "Sandwich",
      "order": 2,
      "isActive": true,
      "_count": { "products": 5 }
    }
  ]
}
```

### Criar Categoria
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Promoções",
  "description": "Produtos em promoção",
  "icon": "Gift",
  "order": 0
}
```

---

## 👥 Clientes

### Listar Clientes
```http
GET /api/customers?search=joão&skip=0&take=10
```

**Query Parameters**:
- `search` (string, optional) - Buscar por nome, telefone ou email
- `skip` (number, default: 0)
- `take` (number, default: 10)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "cust_1",
      "name": "João Silva",
      "phone": "11999999999",
      "email": "joao@email.com",
      "defaultAddress": "Rua das Flores, 123",
      "defaultCity": "São Paulo",
      "defaultZip": "01000-000",
      "defaultNumber": "123",
      "_count": { "orders": 5 },
      "createdAt": "2024-08-10T15:30:00Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

### Criar/Atualizar Cliente
```http
POST /api/customers
Content-Type: application/json

{
  "name": "Maria Santos",
  "phone": "11988888888",
  "email": "maria@email.com",
  "defaultAddress": "Avenida Paulista, 1000",
  "defaultCity": "São Paulo",
  "defaultZip": "01311-100",
  "defaultNumber": "1000"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { "id": "cust_2", ... },
  "message": "Cliente criado com sucesso"
}
```

---

## 💳 Pagamentos

### Gerar PIX QR Code
```http
POST /api/payments/pix
Content-Type: application/json

{
  "orderId": "order_1",
  "amount": 102.00,
  "pixKey": "seuemail@email.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "pixKey": "123e4567e89b12d3a456426614174000",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "copyPaste": "00020126580014br.gov.bcb.pix...",
    "transactionId": "pix_123"
  }
}
```

### Processar Pagamento
```http
POST /api/payments/process
Content-Type: application/json

{
  "orderId": "order_1",
  "method": "PIX",
  "amount": 102.00,
  "pixTransactionId": "pix_123"
}
```

---

## ❌ Códigos de Erro

### 400 Bad Request
```json
{
  "success": false,
  "error": "Dados obrigatórios faltando"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Recurso não encontrado"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Erro ao buscar produtos"
}
```

---

## 🧪 Testando com cURL

### Listar Produtos
```bash
curl http://localhost:3000/api/products?categoryId=1
```

### Criar Pedido
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João",
    "customerPhone": "11999999999",
    "orderType": "DELIVERY",
    "paymentMethod": "PIX",
    "items": [...],
    "subtotal": 97,
    "deliveryTax": 5,
    "total": 102
  }'
```

---

## 📊 Resposta Padrão

### Sucesso
```json
{
  "success": true,
  "data": { /* dados */ },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

---

## 🔐 Autenticação (Próximo)

Quando implementada, usar:
```http
Authorization: Bearer <token>
```

---

## 📝 Convenções

- **Método GET**: Recuperar dados
- **Método POST**: Criar dados
- **Método PUT**: Atualizar dados
- **Método DELETE**: Deletar dados
- **Content-Type**: `application/json`
- **Charset**: `utf-8`

---

## 🧪 Postman Collection

Importe esta coleção no Postman:
```json
{
  "info": {
    "name": "Garagem.Com API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Produtos",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/products"
      }
    }
  ]
}
```

---

**Versão**: 0.1.0
**Última atualização**: 14/08/2026
**Status**: ✅ Pronto para usar
