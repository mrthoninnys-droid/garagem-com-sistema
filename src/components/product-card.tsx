'use client';

import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive?: boolean;
  onAddToCart?: (id: string) => void;
  onQuickView?: (id: string) => void;
  inCart?: number;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  isActive = true,
  onAddToCart,
  onQuickView,
  inCart = 0,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-200">
      {/* Imagem do Produto */}
      <div className="relative bg-neutral-100 h-48 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <ShoppingCart size={48} />
          </div>
        )}
        {!isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Indisponível</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 text-lg line-clamp-2">{name}</h3>
        {description && (
          <p className="text-neutral-600 text-sm mt-2 line-clamp-2">{description}</p>
        )}

        {/* Preço */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
        </div>

        {/* Botões */}
        <div className="mt-4 flex gap-2">
          {onQuickView && (
            <button
              onClick={() => onQuickView(id)}
              disabled={!isActive}
              className="flex-1 py-2 px-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Detalhes
            </button>
          )}
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(id)}
              disabled={!isActive}
              className="flex-1 py-2 px-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 text-sm font-medium"
            >
              <ShoppingCart size={16} />
              <span>Adicionar</span>
            </button>
          )}
        </div>

        {/* Indicador de itens no carrinho */}
        {inCart > 0 && (
          <div className="mt-3 text-center text-sm font-semibold text-primary">
            {inCart} no carrinho
          </div>
        )}
      </div>
    </div>
  );
}
