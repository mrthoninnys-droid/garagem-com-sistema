'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

const DEFAULT_ITEMS: MenuItem[] = [
  { id: '1', name: 'Pizza Mozzarella', description: 'Molho, mozzarella e orégano', price: 45.0, category: 'Pizzas' },
  { id: '2', name: 'Pizza Calabresa', description: 'Molho, calabresa, cebola e mozzarella', price: 52.0, category: 'Pizzas' },
  { id: '3', name: 'Hambúrguer Clássico', description: 'Pão, carne, alface, tomate, queijo', price: 28.0, category: 'Lanches' },
  { id: '4', name: 'Refrigerante', description: 'Coca-Cola 350ml', price: 8.0, category: 'Bebidas' },
];

export default function AdminMenuCrudPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Pizzas');

  useEffect(() => {
    const saved = localStorage.getItem('garagem_custom_menu');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  const saveMenu = (updated: MenuItem[]) => {
    setItems(updated);
    localStorage.setItem('garagem_custom_menu', JSON.stringify(updated));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price) || 0,
      category,
    };

    saveMenu([...items, newItem]);
    setName('');
    setDescription('');
    setPrice('');
  };

  const handleRemoveItem = (id: string) => {
    if (confirm('Deseja realmente remover este produto do cardápio?')) {
      saveMenu(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <UtensilsCrossed size={22} className="text-orange-500" /> Gerenciar Itens do Cardápio
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Formulário para Adicionar */}
        <form onSubmit={handleAddItem} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">Adicionar Novo Produto</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                required
                placeholder="Ex: Pizza Quatro Queijos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm bg-white font-medium"
              >
                <option value="Pizzas">Pizzas</option>
                <option value="Lanches">Lanches</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.50"
                required
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ingredientes e detalhes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar ao Cardápio
          </button>
        </form>

        {/* Lista de Itens Cadastrados */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
            Produtos Cadastrados ({items.length})
          </h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{item.name}</span>
                    <span className="text-[10px] uppercase font-bold bg-neutral-200 px-2 py-0.5 rounded text-neutral-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                  <span className="font-bold text-emerald-600 text-sm block mt-1">R$ {item.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}