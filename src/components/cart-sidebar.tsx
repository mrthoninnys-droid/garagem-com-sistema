'use client';

import { X, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/lib/types';

interface CartSidebarProps {
  items: CartItem[];
  subtotal: number;
  deliveryTax: number;
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveItem?: (index: number) => void;
  onCheckout?: () => void;
}

export function CartSidebar({
  items,
  subtotal,
  deliveryTax,
  total,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } md:relative md:transform-none md:h-auto md:max-w-none md:shadow-none md:z-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">Carrinho</h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto max-h-96 md:max-h-none p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">
              Seu carrinho está vazio
            </p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900">{item.productName}</h4>
                    {item.selectedOptions.length > 0 && (
                      <ul className="text-xs text-neutral-600 mt-1">
                        {item.selectedOptions.map((opt) => (
                          <li key={opt.optionId}>
                            {opt.optionName}
                            {opt.priceExtra > 0 && ` +${formatCurrency(opt.priceExtra)}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="p-1 hover:bg-neutral-100 rounded text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {item.notes && (
                  <p className="text-xs text-neutral-500 italic mb-2">{item.notes}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                    {onUpdateQuantity && (
                      <>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 hover:bg-neutral-200 disabled:opacity-50 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-200 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </>
                    )}
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 p-4 space-y-3">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {deliveryTax > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Taxa de entrega:</span>
                <span>{formatCurrency(deliveryTax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-neutral-900 border-t border-neutral-200 pt-3">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            {onCheckout && (
              <button
                onClick={onCheckout}
                className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
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
