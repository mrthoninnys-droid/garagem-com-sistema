'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  DollarSign,
  Lock,
  Unlock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import {
  CashSession,
  ClosureReport,
  getCurrentCashSession,
  openCashRegister,
  closeCashRegisterWithOperation,
} from '@/lib/cash-register';

export default function AdminCashRegisterPage() {
  const [session, setSession] = useState<CashSession>(getCurrentCashSession());
  const [initialCashInput, setInitialCashInput] = useState('100.00');
  const [activeReport, setActiveReport] = useState<ClosureReport | null>(null);

  useEffect(() => {
    const current = getCurrentCashSession();
    setSession(current);
    if (current.closureReport) {
      setActiveReport(current.closureReport);
    }
  }, []);

  const handleOpenCash = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialCashInput) || 0;
    const opened = openCashRegister(val);
    setSession(opened);
    setActiveReport(null);
  };

  const handleCloseCashOperation = () => {
    if (confirm('Confirma o fechamento do caixa com o cálculo das taxas de cartão descontadas?')) {
      const { session: closed, report } = closeCashRegisterWithOperation();
      setSession(closed);
      setActiveReport(report);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #closure-receipt,
          #closure-receipt * {
            visibility: visible;
          }
          #closure-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5px;
            font-family: monospace;
            font-size: 11px;
            color: #000;
          }
        }
      `}</style>

      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <DollarSign size={22} className="text-emerald-600" /> Controle de Caixa Diário
            </h1>
          </div>

          {session.isOpen && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1.5">
              <Unlock size={14} /> CAIXA ABERTO
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6 print:hidden">
        {/* Se o caixa estiver FECHADO */}
        {!session.isOpen ? (
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mx-auto">
                <Lock size={24} />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">O Caixa Está Fechado</h2>
              <p className="text-xs text-neutral-500">Informe o fundo de troco para abrir a operação do dia</p>
            </div>

            <form onSubmit={handleOpenCash} className="max-w-xs mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Fundo de Troco Inicial (R$)</label>
                <input
                  type="number"
                  step="5.00"
                  required
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-base font-bold text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
              >
                Abrir Caixa Agora
              </button>
            </form>
          </div>
        ) : (
          /* Se o caixa estiver ABERTO */
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-3">
              <div>
                <span className="text-xs text-neutral-500">Caixa Aberto em: {session.openedAt}</span>
                <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Fundo de Troco Inicial: R$ {session.initialCash.toFixed(2)}
                </h2>
              </div>

              <button
                onClick={handleCloseCashOperation}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Lock size={16} /> Fechar Caixa & Descontar Taxas
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neutral-900">Vendas Registradas no Turno ({session.orders.length})</h3>

              {session.orders.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4 text-center">Nenhum pedido registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {session.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-neutral-50 text-xs"
                    >
                      <div>
                        <span className="font-bold text-neutral-900">Pedido #{ord.orderNumber} - {ord.customerName}</span>
                        <span className="text-neutral-500 block">{ord.createdAt} • Método: {ord.paymentMethod}</span>
                      </div>
                      <span className="font-bold text-emerald-600 text-sm">R$ {ord.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exibição do Relatório do Fechamento */}
        {activeReport && (
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={24} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-neutral-900">Extrato Consolidado do Fechamento</h2>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-neutral-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer size={16} /> Imprimir Relatório
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-xs text-neutral-500 font-semibold block">Faturamento Bruto Total</span>
                <span className="text-lg font-bold text-neutral-900">R$ {activeReport.grossTotal.toFixed(2)}</span>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <span className="text-xs text-red-600 font-semibold block">Total Taxas Descontadas</span>
                <span className="text-lg font-bold text-red-700">- R$ {activeReport.totalFees.toFixed(2)}</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-semibold block">Faturamento Líquido Real</span>
                <span className="text-lg font-bold text-emerald-700">R$ {activeReport.netTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Tabela de Métodos de Pagamento */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 font-bold text-neutral-700 uppercase border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Forma de Pagamento</th>
                    <th className="p-3">Qtd</th>
                    <th className="p-3">Valor Bruto</th>
                    <th className="p-3">Taxa (%)</th>
                    <th className="p-3">Desconto (R$)</th>
                    <th className="p-3">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {activeReport.breakdown.map((row) => (
                    <tr key={row.method} className="hover:bg-neutral-50">
                      <td className="p-3 font-bold text-neutral-900">{row.label}</td>
                      <td className="p-3">{row.orderCount}</td>
                      <td className="p-3 font-semibold">R$ {row.grossAmount.toFixed(2)}</td>
                      <td className="p-3 text-neutral-500">{row.feeRate}%</td>
                      <td className="p-3 text-red-600 font-semibold">- R$ {row.feeAmount.toFixed(2)}</td>
                      <td className="p-3 font-bold text-emerald-600">R$ {row.netAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center text-sm">
              <span className="font-bold text-amber-900">Dinheiro a Conferir na Gaveta (Troco Inicial + Espécie):</span>
              <span className="text-lg font-bold text-amber-900">R$ {activeReport.totalCashInHand.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Relatório Térmico Impresso em 80mm */}
      {activeReport && (
        <div id="closure-receipt" className="hidden print:block">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>GARAGEM.COM</h2>
            <p style={{ margin: 0, fontSize: '10px' }}>RELATÓRIO DE FECHAMENTO DE CAIXA</p>
            <p style={{ margin: '5px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '3px 0' }}>
              Abertura: {activeReport.openedAt}<br />
              Fechamento: {activeReport.closedAt}
            </p>
          </div>

          <p style={{ margin: '3px 0' }}>Troco Inicial: R$ {activeReport.initialCash.toFixed(2)}</p>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

          <p style={{ margin: '3px 0', fontWeight: 'bold' }}>DETALHAMENTO DAS TAXAS:</p>
          {activeReport.breakdown.map((b) => (
            <div key={b.method} style={{ marginBottom: '4px' }}>
              <span>{b.label} ({b.orderCount}x):</span><br />
              <span>Bruto: R$ {b.grossAmount.toFixed(2)} | Taxa ({b.feeRate}%): -R$ {b.feeAmount.toFixed(2)}</span><br />
              <strong>Líquido: R$ {b.netAmount.toFixed(2)}</strong>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

          <p style={{ margin: '3px 0' }}>Faturamento Bruto: R$ {activeReport.grossTotal.toFixed(2)}</p>
          <p style={{ margin: '3px 0', color: '#000' }}>Total Taxas: -R$ {activeReport.totalFees.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px', fontWeight: 'bold' }}>LÍQUIDO REAL: R$ {activeReport.netTotal.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '12px', fontWeight: 'bold' }}>GAVETA (DINHEIRO): R$ {activeReport.totalCashInHand.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}