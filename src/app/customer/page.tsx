'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { ProductCard } from '@/components/product-card';
import { CartSidebar } from '@/components/cart-sidebar';
import { ShoppingCart, Search, MapPin, Clock, Power, SearchCheck } from 'lucide-react';
import Link from 'next/link';
import { isStoreOpen, getStoreSettings } from '@/lib/settings';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  productName: string;
  price: number;
  unitPrice: number;
  quantity: number;
}

export default function CustomerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isOpen = isStoreOpen();
  const settings = getStoreSettings();

  useEffect(() => {
    const savedCart = localStorage.getItem('garagem_cart_items');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }

    // Carrega produtos customizados cadastrados no Admin
    const savedCustomMenu = localStorage.getItem('garagem_custom_menu');
    if (savedCustomMenu) {
      try {
        setProducts(JSON.parse(savedCustomMenu));
      } catch (e) {
        console.error(e);
      }
    } else {
      setProducts([
        { id: '1', categoryId: '1', name: 'Pizza Mozzarella', description: 'Molho, mozzarella e orégano', price: 45.0 },
        { id: '2', categoryId: '1', name: 'Pizza Calabresa', description: 'Molho, calabresa, cebola e mozzarella', price: 52.0 },
        { id: '3', categoryId: '2', name: 'Hambúrguer Clássico', description: 'Pão, carne, alface, tomate, queijo', price: 28.0 },
        { id: '4', categoryId: '3', name: 'Refrigerante', description: 'Coca-Cola 350ml', price: 8.0 },
      ]);
    }

    setCategories([
      { id: '1', name: 'Pizzas' },
      { id: '2', name: 'Lanches' },
      { id: '3', name: 'Bebidas' },
      { id: '4', name: 'Sobremesas' },
    ]);

    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('garagem_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory || p.name.includes(selectedCategory);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    if (!isOpen) {
      alert('Desculpe, o estabelecimento está fechado no momento!');
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevItems,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          productName: product.name,
          price: product.price,
          unitPrice: product.price,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || item.price || 0) * item.quantity, 0);

  return (
    <Layout showNavigation={false}>
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Menu Digital</h1>
              <p className="text-neutral-600 text-sm mt-0.5">Pizzaria & Delivery Garagem.Com</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/customer/track"
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <SearchCheck size={16} /> Meus Pedidos
              </Link>

              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <ShoppingCart size={24} />
                {totalItemCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-danger text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Banner de Horário e Status Aberto/Fechado */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary flex-shrink-0" />
              <span className="text-neutral-900 font-semibold">Entrega & Balcão</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-600 flex items-center gap-1">
                <Clock size={14} /> Horário: {settings.openTime} às {settings.closeTime}
              </span>

              {isOpen ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1">
                  <Power size={12} /> LOJA ABERTA
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-full text-xs flex items-center gap-1">
                  <Power size={12} /> LOJA FECHADA
                </span>
              )}
            </div>
          </div>

          {/* Busca */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="border-t border-neutral-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex gap-4 py-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listagem de Produtos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => handleAddToCart(product)}
                onQuickView={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Carrinho Sidebar */}
      <CartSidebar
        items={cartItems}
        subtotal={subtotal}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(idx) => handleUpdateQuantity(idx, 0)}
        onCheckout={() => {
          if (!isOpen) {
            alert('A loja está fechada no momento!');
            return;
          }
          window.location.href = '/checkout';
        }}
      />
    </Layout>
  );
}