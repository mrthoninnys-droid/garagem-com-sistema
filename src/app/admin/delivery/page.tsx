'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Check } from 'lucide-react';
import Link from 'next/link';
import { DeliveryRegion, getDeliveryRates, saveDeliveryRates } from '@/lib/delivery-rates';

export default function AdminDeliveryPage() {
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Novo item formulário
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCepPrefix, setNewCepPrefix] = useState('');
  const [newFee, setNewFee] = useState('');

  useEffect(() => {
    setRegions(getDeliveryRates());
  }, []);

  const handleFeeChange = (id: string, newFee: number) => {
    setRegions((prev) =>
      prev.map((reg) => (reg.id === id ? { ...reg, fee: newFee } : reg))
    );
  };

  const handleDeleteRegion = (id: string) => {
    setRegions((prev) => prev.filter((reg) => reg.id !== id));
  };

  const handleAddRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newFee) return;

    const newRegion: DeliveryRegion = {
      id: Date.now().toString(),
      name: newName,
      city: newCity || undefined,
      cepPrefix: newCepPrefix || undefined,
      fee: parseFloat(newFee),
    };

    setRegions((prev) => [...prev, newRegion]);

    // Limpar campos
    setNewName('');
    setNewCity('');
    setNewCepPrefix('');
    setNewFee('');
  };

  const handleSaveAll = () => {
    saveDeliveryRates(regions);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Taxas de Entrega por Região</h1>
          </div>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
          >
            {savedSuccess ? <Check size={18} /> : <Save size={18} />}
            {savedSuccess ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Lista de Regiões Existentes */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
            Regiões e Valores Atuais
          </h2>

          <div className="space-y-3">
            {regions.map((region) => (
              <div
                key={region.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50 gap-4"
              >
                <div className="flex-1">
                  <span className="font-bold text-neutral-900 block">{region.name}</span>
                  <span className="text-xs text-neutral-500">
                    {region.city && `Cidade: ${region.city}`}
                    {region.city && region.cepPrefix && ' | '}
                    {region.cepPrefix && `Início CEP: ${region.cepPrefix}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg px-3 py-1.5">
                    <span className="text-sm font-semibold text-neutral-500">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      value={region.fee}
                      onChange={(e) => handleFeeChange(region.id, parseFloat(e.target.value) || 0)}
                      className="w-20 font-bold text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteRegion(region.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário para Adicionar Nova Região */}
        <form onSubmit={handleAddRegion} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
            Adicionar Nova Região
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome da Região / Bairro</label>
              <input
                type="text"
                required
                placeholder="Ex: Zona Sul / Bairro Centro"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Cidade (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Vila Velha"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Início do CEP (Opcional - Ex: 29)</label>
              <input
                type="text"
                maxLength={5}
                placeholder="Ex: 29100"
                value={newCepPrefix}
                onChange={(e) => setNewCepPrefix(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Valor da Taxa (R$)</label>
              <input
                type="number"
                step="0.50"
                required
                placeholder="0.00"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Adicionar Região
          </button>
        </form>
      </div>
    </div>
  );
}