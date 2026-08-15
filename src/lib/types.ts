// Types para o sistema
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: SelectedOption[];
  notes?: string;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceExtra: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryTax: number;
  discount: number;
  total: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export enum OrderStatusLabel {
  PENDING = 'Pendente de confirmação',
  CONFIRMED = 'Confirmado',
  PREPARING = 'Em preparo',
  READY = 'Pronto',
  SHIPPED = 'Saiu para entrega',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado',
  REFUNDED = 'Reembolsado',
}

export enum PaymentMethodLabel {
  PIX = 'PIX',
  CREDIT_CARD = 'Cartão de Crédito',
  DEBIT_CARD = 'Cartão de Débito',
  MONEY = 'Dinheiro',
}
