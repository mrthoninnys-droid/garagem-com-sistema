'use client';

import { useState, useEffect } from 'react';
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { isStoreOpen } from '@/lib/settings';

export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  categoryId?: string;
  image?: string;
  available?: boolean;
}

export interface CartItem {
  product: MenuItem;
  quantity: number;
  observation?: string;
}

const DEFAULT_PRODUCTS: MenuItem[] = [
  {
    id: '1',
    title: 'X-Burger Garagem Artesanal',
    description: 'Hambúrguer de fraldinha 180g, queijo cheddar fatiado, bacon crocante, maionese especial da casa no pão brioche.',
    price: 32.9,
    category: 'lanches',
    available: true,
  },
  {
    id: '2',
    title: 'Smash Double Cheese',
    description: 'Dois hambúrgueres smash de 90g cada, duplo queijo prato derretido, cebola roxa caramelizada e picles.',
    price: 28.5,
    category: 'lanches',
    available: true,
  },
  {
    id: '3',
    title: 'Pizza Calabresa Especial (Grande)',
    description: 'Calabresa fatiada selecionada, cebola roxa, azeitonas pretas, muçarela e orégano.',
    price: 49.9,
    category: 'pizzas',
    available: true,
  },
  {
    id: '4',
    title: 'Pizza Quatro Queijos Premium',
    description: 'Muçarela, catupiry original, provolone e queijo gorgonzola.',
    price: 54.9,
    category: 'pizzas',
    available: true,
  },
  {
    id: '5',
    title: 'Batata Rústica com Cheddar e Bacon',
    description: 'Porção de 400g de batata rústica frita na hora, coberta com molho cheddar e bacon em cubos.',
    price: 26.0,
    category: 'porcoes',
    available: true,
  },
  {
    id: '6',
    title: 'Coca-Cola 2 Litros',
    description: 'Refrigerante garrafa 2L trincando de gelada.',
    price: 14.0,
    category: 'bebidas',
    available: true,
  },
  {
    id: '7',
    title: 'Guaraná Antarctica 2L',
    description: 'Refrigerante garrafa 2L.',
    price: 12.0,
    category: 'bebidas',
    available: true,
  },
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos os Itens' },
  { id: 'lanches', label: '🍔 Lanches & Burgers' },
  { id: 'pizzas', label: '🍕 Pizzas' },
  { id: 'porcoes', label: '🍟 Porções' },
  { id: 'bebidas', label: '🥤 Bebidas' },
];

export default function CustomerMenuPage() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    setStoreOpen(isStoreOpen());

    const savedMenu = localStorage.getItem('garagem_menu_items');
    if (savedMenu) {
      try {
        const parsed = JSON.parse(savedMenu);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }

    const savedCart = localStorage.getItem('garagem_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(
      'garagem_cart',
      JSON.stringify(
        newCart.map((item) => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          observation: item.observation,
        }))
      )
    );
  };

  const handleAddToCart = (product: MenuItem) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updateCartState(updated);
    } else {
      updateCartState([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    updateCartState(updated);
  };

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      activeCategory === 'todos' ||
      item.category?.toLowerCase() === activeCategory.toLowerCase() ||
      item.categoryId?.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-100 pb-24">
      {/* Header do Cardápio */}
      <header className="bg-neutral-900 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-neutral-900 font-bold shadow-sm">
              <Utensils size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-tight">Garagem.Com</h1>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock size={12} className={storeOpen ? 'text-emerald-400' : 'text-red-400'} />
                {storeOpen ? 'Aberto Agora' : 'Fechado no Momento'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
          >
            <ShoppingCart size={22} className="text-amber-400" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-neutral-900 animate-pulse">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar lanche, pizza ou bebida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-800 text-white placeholder-neutral-400 text-xs rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Navegação de Abas do Cardápio */}
        <div className="max-w-3xl mx-auto px-4 flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Listagem de Produtos */}
      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center space-y-2 border border-neutral-200">
            <Sparkles size={32} className="mx-auto text-neutral-300" />
            <p className="font-bold text-neutral-700 text-sm">Nenhum item encontrado nesta categoria.</p>
            <p className="text-xs text-neutral-400">Tente selecionar outra categoria ou limpar a busca.</p>
          </div>
        ) : (
          filteredProducts.map((item) => {
            const inCart = cart.find((c) => c.product.id === item.id);

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-extrabold text-neutral-900 text-sm">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                  <span className="font-black text-emerald-600 text-base block pt-1">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col justify-end items-end">
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-neutral-900 text-white p-1 rounded-xl">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="p-1 hover:bg-neutral-800 rounded-lg text-amber-400"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-xs px-1">{inCart.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-1 hover:bg-neutral-800 rounded-lg text-amber-400"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Barra Fixa Inferior do Carrinho */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 shadow-lg z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Total do Pedido</span>
              <span className="text-base font-black text-emerald-600">R$ {cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag size={18} className="text-amber-400" />
              <span>Ver Sacola ({cartItemCount})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal / Drawer da Sacola de Compras */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h2 className="font-extrabold text-base text-neutral-900 flex items-center gap-2">
                <ShoppingBag size={20} className="text-amber-500" /> Sua Sacola de Pedidos
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 space-y-2">
                  <ShoppingCart size={40} className="mx-auto text-neutral-300" />
                  <p className="font-bold text-sm">Sua sacola está vazia.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 border border-neutral-200 rounded-xl bg-neutral-50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-neutral-900 block">{item.product.title}</span>
                      <span className="text-emerald-600 font-extrabold">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-neutral-200">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="p-1 text-neutral-600 hover:bg-neutral-100 rounded"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-xs px-1">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="p-1 text-neutral-600 hover:bg-neutral-100 rounded"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex justify-between items-center font-black text-base text-neutral-900">
                  <span>Subtotal:</span>
                  <span className="text-emerald-600">R$ {cartTotal.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <Check size={18} /> Avançar para o Pagamento
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}