'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Clock, Check, Power, Percent } from 'lucide-react';
import Link from 'next/link';
import {
  StoreSettings,
  getStoreSettings,
  saveStoreSettings,
  DAYS_OF_WEEK,
} from '@/lib/settings';
import { getCurrentCashSession, openCashRegister } from '@/lib/cash-register';

export default function AdminHoursPage() {
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());
  const [cashIsOpen, setCashIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getStoreSettings());
    const cash = getCurrentCashSession();
    setCashIsOpen(cash.isOpen);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleManualOpenStoreAndCash = () => {
    const updated = { ...settings, isOpenManual: true, useManualStatus: true };
    setSettings(updated);
    saveStoreSettings(updated);

    if (!cashIsOpen) {
      openCashRegister(100);
      setCashIsOpen(true);
    }
  };

  const handleManualCloseStore = () => {
    const updated = { ...settings, isOpenManual: false, useManualStatus: true };
    setSettings(updated);
    saveStoreSettings(updated);
  };

  const handleDayChange = (dayKey: string, field: 'enabled' | 'openTime' | 'closeTime', value: any) => {
    setSettings({
      ...settings,
      weeklySchedule: {
        ...settings.weeklySchedule,
        [dayKey]: {
          ...settings.weeklySchedule[dayKey],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock size={22} className="text-amber-500" /> Horários Diários & Status da Loja
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Power size={18} className="text-neutral-700" /> Status Manual da Loja & Caixa
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleManualOpenStoreAndCash}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
                  settings.useManualStatus && settings.isOpenManual
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <Power size={18} /> ABRIR LOJA & CAIXA
              </button>

              <button
                type="button"
                onClick={handleManualCloseStore}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
                  settings.useManualStatus && !settings.isOpenManual
                    ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-300'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <Power size={18} /> FECHAR LOJA
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-600 font-medium cursor-pointer pt-2 border-t border-neutral-100">
              <input
                type="checkbox"
                checked={!settings.useManualStatus}
                onChange={(e) => setSettings({ ...settings, useManualStatus: !e.target.checked })}
                className="w-4 h-4 text-neutral-900 rounded"
              />
              Ativar Abertura/Fechamento Automático Diário e Abertura Automática do Caixa
            </label>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Horários de Funcionamento por Dia da Semana
            </h2>

            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const conf = settings.weeklySchedule[day.key] || { enabled: true, openTime: '18:00', closeTime: '23:30' };
                return (
                  <div
                    key={day.key}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border gap-3 ${
                      conf.enabled ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-100/50 border-neutral-200 opacity-60'
                    }`}
                  >
                    <label className="flex items-center gap-3 font-bold text-sm text-neutral-900 cursor-pointer min-w-[140px]">
                      <input
                        type="checkbox"
                        checked={conf.enabled}
                        onChange={(e) => handleDayChange(day.key, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-neutral-900 rounded"
                      />
                      {day.label}
                    </label>

                    {conf.enabled ? (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500 font-semibold">Abre:</span>
                          <input
                            type="time"
                            value={conf.openTime}
                            onChange={(e) => handleDayChange(day.key, 'openTime', e.target.value)}
                            className="p-1.5 border border-neutral-300 rounded font-bold text-neutral-900 bg-white"
                          />
                        </div>

                        <span className="text-neutral-400 font-bold">às</span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500 font-semibold">Fecha:</span>
                          <input
                            type="time"
                            value={conf.closeTime}
                            onChange={(e) => handleDayChange(day.key, 'closeTime', e.target.value)}
                            className="p-1.5 border border-neutral-300 rounded font-bold text-neutral-900 bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-red-500 uppercase">Fechado o dia todo</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Percent size={18} className="text-teal-600" /> Taxas Descontadas de Cartões & Online (%)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Crédito Online (App/Site) %</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.cardRates.creditOnlineFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cardRates: { ...settings.cardRates, creditOnlineFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Débito Online (App/Site) %</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.cardRates.debitOnlineFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cardRates: { ...settings.cardRates, debitOnlineFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Crédito Presencial (Maquininha) %</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.cardRates.creditInPersonFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cardRates: { ...settings.cardRates, creditInPersonFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Débito Presencial (Maquininha) %</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.cardRates.debitInPersonFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cardRates: { ...settings.cardRates, debitInPersonFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Horários e Taxas Salvos!' : 'Salvar Todas as Configurações'}
          </button>
        </form>
      </div>
    </div>
  );
}