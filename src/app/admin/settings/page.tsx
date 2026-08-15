'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Settings, BarChart3, Package, Clock, DollarSign, MapPin } from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('products');

  const navItems = [
    { label: 'Configurações', href: '/admin/settings', icon: <Settings size={20} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 size={20} /> },
    { label: 'Produtos', href: '/admin/products', icon: <Package size={20} /> },
    { label: 'Horários', href: '/admin/hours', icon: <Clock size={20} /> },
  ];

  return (
    <Layout title="Configurações" showNavigation={true} navItems={navItems}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-neutral-200 overflow-x-auto">
          {[
            { id: 'products', label: 'Produtos', icon: <Package size={18} /> },
            { id: 'categories', label: 'Categorias', icon: <Package size={18} /> },
            { id: 'delivery', label: 'Entrega', icon: <MapPin size={18} /> },
            { id: 'payment', label: 'Pagamento', icon: <DollarSign size={18} /> },
            { id: 'hours', label: 'Horários', icon: <Clock size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          {/* Produtos */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Gerenciar Produtos</h2>
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors">
                  + Novo Produto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-neutral-200 bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Nome</th>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Categoria</th>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Preço</th>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Pizza Mozzarella', category: 'Pizzas', price: 45.0, active: true },
                      { name: 'Hambúrguer Clássico', category: 'Lanches', price: 28.0, active: true },
                      { name: 'Refrigerante', category: 'Bebidas', price: 8.0, active: true },
                    ].map((product, idx) => (
                      <tr key={idx} className="border-b border-neutral-200 hover:bg-neutral-50">
                        <td className="px-4 py-3">{product.name}</td>
                        <td className="px-4 py-3 text-neutral-600">{product.category}</td>
                        <td className="px-4 py-3 font-semibold">R$ {product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              product.active
                                ? 'bg-success/20 text-success'
                                : 'bg-danger/20 text-danger'
                            }`}
                          >
                            {product.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button className="text-primary hover:underline text-sm font-medium">Editar</button>
                          <button className="text-danger hover:underline text-sm font-medium">Deletar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categorias */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Gerenciar Categorias</h2>
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors">
                  + Nova Categoria
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Pizzas', 'Lanches', 'Bebidas', 'Sobremesas'].map((cat) => (
                  <div key={cat} className="border border-neutral-200 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-3">{cat}</h3>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90">
                        Editar
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-danger/10 text-danger rounded hover:bg-danger/20">
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entrega */}
          {activeTab === 'delivery' && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Configuração de Entrega</h2>

              <div className="space-y-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <label className="block text-neutral-700 font-semibold mb-2">
                    Taxa de Entrega Padrão (R$)
                  </label>
                  <input
                    type="number"
                    defaultValue="5.00"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                  <label className="block text-neutral-700 font-semibold mb-2">
                    Valor Mínimo para Entrega (R$)
                  </label>
                  <input
                    type="number"
                    defaultValue="20.00"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                  <label className="block text-neutral-700 font-semibold mb-2">
                    Tempo Estimado de Entrega (minutos)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Zonas de Entrega</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Centro', tax: 5.0, time: 20 },
                      { name: 'Zona Leste', tax: 8.0, time: 35 },
                      { name: 'Zona Oeste', tax: 7.0, time: 30 },
                    ].map((zone) => (
                      <div key={zone.name} className="flex items-center justify-between bg-white p-3 rounded border border-neutral-200">
                        <div>
                          <p className="font-semibold text-neutral-900">{zone.name}</p>
                          <p className="text-sm text-neutral-600">
                            Taxa: R$ {zone.tax.toFixed(2)} • Tempo: {zone.time} min
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-primary text-sm font-medium">Editar</button>
                          <button className="text-danger text-sm font-medium">Deletar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* Pagamento */}
          {activeTab === 'payment' && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Métodos de Pagamento</h2>

              <div className="space-y-4">
                {[
                  { name: 'PIX', icon: '📱', enabled: true },
                  { name: 'Cartão de Crédito', icon: '💳', enabled: true },
                  { name: 'Cartão de Débito', icon: '💳', enabled: false },
                  { name: 'Dinheiro', icon: '💵', enabled: true },
                ].map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg border border-neutral-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold text-neutral-900">{method.name}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={method.enabled}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium">
                        {method.enabled ? 'Ativado' : 'Desativado'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-4">Integração PIX</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-2">
                      Chave PIX (CPF, CNPJ, Email ou Telefone)
                    </label>
                    <input
                      type="text"
                      placeholder="Sua chave PIX"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors">
                    Salvar Configurações PIX
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Horários */}
          {activeTab === 'hours' && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Horário de Funcionamento</h2>

              <div className="space-y-3">
                {[
                  { day: 'Segunda-feira', open: '10:00', close: '23:00' },
                  { day: 'Terça-feira', open: '10:00', close: '23:00' },
                  { day: 'Quarta-feira', open: '10:00', close: '23:00' },
                  { day: 'Quinta-feira', open: '10:00', close: '23:00' },
                  { day: 'Sexta-feira', open: '10:00', close: '00:00' },
                  { day: 'Sábado', open: '10:00', close: '00:00' },
                  { day: 'Domingo', open: '11:00', close: '23:00' },
                ].map((schedule) => (
                  <div key={schedule.day} className="flex items-center gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{schedule.day}</p>
                    </div>
                    <input
                      type="time"
                      defaultValue={schedule.open}
                      className="px-4 py-2 border border-neutral-300 rounded-lg"
                    />
                    <span className="text-neutral-600">até</span>
                    <input
                      type="time"
                      defaultValue={schedule.close}
                      className="px-4 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
                Salvar Horários
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
