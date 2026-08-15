'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { ProductCard } from '@/components/product-card';
import { CartSidebar } from '@/components/cart-sidebar';
import { ShoppingCart, Search, MapPin } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
}

export default function CustomerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      try {
        // Em produção, isso seria um fetch para a API
        setTimeout(() => {
          setCategories([
            { id: '1', name: 'Pizzas', icon: 'Pizza' },
            { id: '2', name: 'Lanches', icon: 'Sandwich' },
            { id: '3', name: 'Bebidas', icon: 'Droplet' },
            { id: '4', name: 'Sobremesas', icon: 'Cake' },
          ]);

          setProducts([
            {
              id: '1',
              categoryId: '1',
              name: 'Pizza Mozzarella',
              description: 'Molho, mozzarella e orégano',
              price: 45.0,
            },
            {
              id: '2',
              categoryId: '1',
              name: 'Pizza Calabresa',
              description: 'Molho, calabresa, cebola e mozzarella',
              price: 52.0,
            },
            {
              id: '3',
              categoryId: '2',
              name: 'Hambúrguer Clássico',
              description: 'Pão, carne, alface, tomate, queijo',
              price: 28.0,
            },
            {
              id: '4',
              categoryId: '3',
              name: 'Refrigerante',
              description: 'Coca-Cola 350ml',
              price: 8.0,
            },
          ]);

          setSelectedCategory('1');
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = () => {
    setCartItems((prev) => prev + 1);
    // Aqui você adicionaria a lógica de carrinho real
  };

  return (
    <Layout showNavigation={false}>
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Menu Digital</h1>
              <p className="text-neutral-600 text-sm mt-1">Pizzaria & Delivery Garagem.Com</p>
            </div>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative p-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <ShoppingCart size={24} />
              {cartItems > 0 && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-danger text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </button>
          </div>

          {/* Informações de Entrega */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 flex items-center gap-3 text-sm">
            <MapPin size={18} className="text-secondary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-neutral-900 font-semibold">Rua das Flores, 123 - São Paulo</p>
              <p className="text-neutral-600 text-xs">Taxa de entrega: R$ 5,00 • Tempo: ~30 min</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
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
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.id
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="bg-neutral-200 rounded-lg h-72 animate-pulse" />
              ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
                onQuickView={(id) => {
                  // Abrir modal com detalhes do produto
                  console.log('Abrir detalhes:', id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">Nenhum produto encontrado</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-primary font-semibold hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        items={[]}
        subtotal={0}
        deliveryTax={5}
        total={0}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          // Ir para página de checkout
          window.location.href = '/checkout';
        }}
      />
    </Layout>
  );
}
