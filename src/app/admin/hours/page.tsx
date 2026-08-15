'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Clock, Check, Power } from 'lucide-react';
import Link from 'next/link';
import { StoreSettings, getStoreSettings, saveStoreSettings } from '@/lib/settings';

export default function AdminHoursPage() {
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getStoreSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock size={22} className="text-amber-500" /> Horário & Status da Loja
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
          {/* Alternador de Status Manual */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
            <h2 className="font-bold text-neutral-900 text-sm">Controle Manual do Status</h2>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isOpenManual: true, useManualStatus: true })}
                className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                  settings.useManualStatus && settings.isOpenManual
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-300'
                }`}
              >
                <Power size={18} /> LOJA ABERTA
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, isOpenManual: false, useManualStatus: true })}
                className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                  settings.useManualStatus && !settings.isOpenManual
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-300'
                }`}
              >
                <Power size={18} /> LOJA FECHADA
              </button>
            </div>
          </div>

          {/* Horários Programados */}
          <div className="space-y-4">
            <h2 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
              Horário Programado de Funcionamento
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Horário de Abertura</label>
                <input
                  type="time"
                  required
                  value={settings.openTime}
                  onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Horário de Fechamento</label>
                <input
                  type="time"
                  required
                  value={settings.closeTime}
                  onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-600 font-medium cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={!settings.useManualStatus}
                onChange={(e) => setSettings({ ...settings, useManualStatus: !e.target.checked })}
              />
              Abrir e fechar automaticamente de acordo com o horário programado
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Configurações Salvas!' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}