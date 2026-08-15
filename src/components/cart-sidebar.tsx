'use client';

import { X, Trash2, Plus, Minus } from 'lucide-react';

// Função interna de formatação segura (não quebra a aplicação)
const formatCurrency = (value: number = 0) => {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  } catch {
    return `R$ ${(value || 0).toFixed(2)}`;
  }
};

interface CartOption {
  optionId?: string;
  optionName?: string;
  priceExtra?: number;
}

interface CartItemProps {
  productName?: string;
  name?: string;
  unitPrice?: number;
  price?: number;
  quantity?: number;
  selectedOptions?: CartOption[];
  notes?: string;
}

interface CartSidebarProps {
  items?: CartItemProps[];
  subtotal?: number;
  deliveryTax?: number;
  total?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveItem?: (index: number) => void;
  onCheckout?: () => void;
}

export function CartSidebar({
  items = [],
  subtotal = 0,
  deliveryTax = 0,
  total = 0,
  isOpen = false,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSidebarProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Listagem de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {safeItems.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">
              Seu carrinho está vazio
            </p>
          ) : (
            safeItems.map((item, index) => {
              const displayName = item.productName || item.name || 'Produto';
              const displayPrice = item.unitPrice ?? item.price ?? 0;
              const qty = item.quantity || 1;
              const options = Array.isArray(item.selectedOptions) ? item.selectedOptions : [];

              return (
                <div key={index} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{displayName}</h4>
                      {options.length > 0 && (
                        <ul className="text-xs text-neutral-600 mt-1 space-y-0.5">
                          {options.map((opt, optIndex) => (
                            <li key={opt.optionId || optIndex}>
                              • {opt.optionName || 'Opção'}
                              {(opt.priceExtra || 0) > 0 && ` (+${formatCurrency(opt.priceExtra)})`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {onRemoveItem && (
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="p-1.5 text-danger hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-neutral-500 italic mb-2">{item.notes}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg p-1">
                      {onUpdateQuantity && (
                        <>
                          <button
                            onClick={() => onUpdateQuantity(index, qty - 1)}
                            disabled={qty <= 1}
                            className="p-1 hover:bg-neutral-100 disabled:opacity-30 rounded text-neutral-700"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-neutral-900">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, qty + 1)}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-700"
                          >
                            <Plus size={14} />
                          </button>
                        </>
                      )}
                    </div>
                    <span className="font-bold text-neutral-900">
                      {formatCurrency(qty * displayPrice)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumo e Botão de Finalizar */}
        {safeItems.length > 0 && (
          <div className="border-t border-neutral-200 p-4 bg-white space-y-3">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {deliveryTax > 0 && (
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Taxa de entrega:</span>
                <span>{formatCurrency(deliveryTax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-neutral-900 border-t border-neutral-100 pt-3">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            {onCheckout && (
              <button
                onClick={onCheckout}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-md mt-2"
              >
                Ir para Checkout
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}