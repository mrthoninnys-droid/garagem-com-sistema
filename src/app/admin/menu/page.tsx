'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, PauseCircle, PlayCircle, Utensils } from 'lucide-react';
import Link from 'next/link';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  isPaused: boolean;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: '1', name: 'Pizza Mozzarella', price: 45.0, isPaused: false },
  { id: '2', name: 'Pizza Calabresa', price: 52.0, isPaused: false },
  { id: '3', name: 'Hambúrguer Clássico', price: 28.0, isPaused: false },
  { id: '4', name: 'Refrigerante', price: 8.0, isPaused: false },
];

export default function AdminMenuPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('garagem_menu_paused');
    if (saved) {
      try {
        const pausedIds: string[] = JSON.parse(saved);
        setProducts(DEFAULT_PRODUCTS.map((p) => ({ ...p, isPaused: pausedIds.includes(p.id) })));
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }
  }, []);

  const togglePauseProduct = (id: string) => {
    const updated = products.map((p) => (p.id === id ? { ...p, isPaused: !p.isPaused } : p));
    setProducts(updated);

    const pausedIds = updated.filter((p) => p.isPaused).map((p) => p.id);
    localStorage.setItem('garagem_menu_paused', JSON.stringify(pausedIds));
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Pausar Itens do Cardápio</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <p className="text-xs text-neutral-500 border-b border-neutral-100 pb-3">
            Ative ou pause a venda de produtos temporariamente. Itens pausados não poderão ser adicionados pelos clientes.
          </p>

          <div className="space-y-3">
            {products.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50"
              >
                <div>
                  <span className="font-bold text-neutral-900 block">{item.name}</span>
                  <span className="text-xs text-neutral-500">R$ {item.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => togglePauseProduct(item.id)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors ${
                    item.isPaused
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {item.isPaused ? (
                    <>
                      <PauseCircle size={16} /> Item Pausado (Esgotado)
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} /> Disponível no Menu
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}