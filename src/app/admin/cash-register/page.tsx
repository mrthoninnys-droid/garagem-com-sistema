'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  DollarSign,
  Lock,
  Unlock,
  Printer,
  FileSpreadsheet,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import {
  CashSession,
  ClosureReport,
  getCurrentCashSession,
  openCashRegister,
  closeCashRegisterWithOperation,
} from '@/lib/cash-register';
import {
  CashOperator,
  getOperators,
  saveOperator,
  deleteOperator,
  authenticateOperator,
} from '@/lib/operators';
import { getCurrentActiveStore } from '@/lib/auth';

export default function AdminCashRegisterPage() {
  const router = useRouter();
  const [session, setSession] = useState<CashSession>(getCurrentCashSession());
  const [initialCashInput, setInitialCashInput] = useState('100.00');
  const [activeReport, setActiveReport] = useState<ClosureReport | null>(null);

  // Abertura do Caixa (Login Operador)
  const [opUsernameInput, setOpUsernameInput] = useState('');
  const [opPasswordInput, setOpPasswordInput] = useState('');
  const [openCashError, setOpenCashError] = useState('');

  // Área Administrativa do Gestor
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // Formulário de Cadastro/Edição de Operador
  const [operatorsList, setOperatorsList] = useState<CashOperator[]>([]);
  const [editingOperatorId, setEditingOperatorId] = useState<string | null>(null);
  const [fullNameInput, setFullNameInput] = useState('');
  const [cpfInput, setCpfInput] = useState('');
  const [usernameNewInput, setUsernameNewInput] = useState('');
  const [passwordNewInput, setPasswordNewInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [operatorFormError, setOperatorFormError] = useState('');
  const [operatorFormSuccess, setOperatorFormSuccess] = useState('');

  useEffect(() => {
    const current = getCurrentCashSession();
    setSession(current);
    if (current.closureReport) {
      setActiveReport(current.closureReport);
    }
    setOperatorsList(getOperators());
  }, []);

  // 1. ABRIR CAIXA COM LOGIN OBRIGATÓRIO DE OPERADOR E REDIRECIONAR
  const handleOpenCashWithOperator = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenCashError('');

    const authRes = authenticateOperator(opUsernameInput, opPasswordInput);
    if (!authRes.success || !authRes.operator) {
      setOpenCashError(authRes.message);
      return;
    }

    const val = parseFloat(initialCashInput) || 0;
    const opened = openCashRegister(
      val,
      authRes.operator.fullName,
      authRes.operator.username
    );

    setSession(opened);
    setActiveReport(null);

    // Redireciona imediatamente para "Pedidos e Despacho"
    router.push('/admin/orders');
  };

  // 2. DESBLOQUEAR ÁREA ADMINISTRATIVA DE OPERADORES
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const store = getCurrentActiveStore();
    if (!store) {
      setAdminError('Nenhuma loja conectada.');
      return;
    }

    if (adminPasswordInput === store.passwordHash || adminPasswordInput === 'admin') {
      setAdminUnlocked(true);
      setAdminPasswordInput('');
    } else {
      setAdminError('Senha do gestor incorreta!');
    }
  };

  // 3. SALVAR OU EDITAR OPERADOR (Exige Admin Unlocked)
  const handleSaveOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOperatorFormError('');
    setOperatorFormSuccess('');

    if (passwordNewInput !== confirmPasswordInput) {
      setOperatorFormError('A confirmação de senha não confere!');
      return;
    }

    const res = saveOperator({
      id: editingOperatorId || undefined,
      fullName: fullNameInput,
      cpf: cpfInput,
      username: usernameNewInput,
      password: passwordNewInput,
    });

    if (res.success) {
      setOperatorFormSuccess(res.message);
      setOperatorsList(getOperators());
      resetOperatorForm();
    } else {
      setOperatorFormError(res.message);
    }
  };

  const resetOperatorForm = () => {
    setEditingOperatorId(null);
    setFullNameInput('');
    setCpfInput('');
    setUsernameNewInput('');
    setPasswordNewInput('');
    setConfirmPasswordInput('');
  };

  const handleStartEditOperator = (op: CashOperator) => {
    setEditingOperatorId(op.id);
    setFullNameInput(op.fullName);
    setCpfInput(op.cpf);
    setUsernameNewInput(op.username);
    setPasswordNewInput(op.passwordHash);
    setConfirmPasswordInput(op.passwordHash);
    setOperatorFormError('');
    setOperatorFormSuccess('');
  };

  const handleDeleteOperatorClick = (id: string) => {
    if (confirm('Tem certeza que deseja remover este operador de caixa?')) {
      deleteOperator(id);
      setOperatorsList(getOperators());
    }
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

      {/* Header */}
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
        {/* ================= SE O CAIXA ESTIVER FECHADO ================= */}
        {!session.isOpen ? (
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
            <div className="text-center space-y-2 border-b border-neutral-100 pb-4">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mx-auto">
                <Lock size={24} />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Abertura de Caixa com Operador</h2>
              <p className="text-xs text-neutral-500">
                Faça o login do operador de caixa e informe o fundo de troco para abrir a operação
              </p>
            </div>

            <form onSubmit={handleOpenCashWithOperator} className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Login do Operador</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: @Maycon"
                    value={opUsernameInput}
                    onChange={(e) => setOpUsernameInput(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Senha do Operador</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={opPasswordInput}
                    onChange={(e) => setOpPasswordInput(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Fundo de Troco Inicial (R$)</label>
                <input
                  type="number"
                  step="5.00"
                  required
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-base font-bold text-center bg-white"
                />
              </div>

              {openCashError && (
                <p className="text-xs font-bold text-red-600 text-center bg-red-50 p-2 rounded-lg border border-red-200">
                  {openCashError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Unlock size={18} /> Abrir Caixa & Ir para Pedidos
              </button>
            </form>
          </div>
        ) : (
          /* ================= SE O CAIXA ESTIVER ABERTO ================= */
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-full">
                    Operador: {session.operatorName} ({session.operatorUsername})
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 mt-2">
                  Fundo de Troco Inicial: R$ {session.initialCash.toFixed(2)}
                </h2>
                <span className="text-xs text-neutral-500">Aberto em: {session.openedAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/orders"
                  className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-colors"
                >
                  <ShoppingBag size={16} /> Pedidos & Despacho
                </Link>

                <button
                  onClick={handleCloseCashOperation}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-colors"
                >
                  <Lock size={16} /> Fechar Caixa
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neutral-900">
                Vendas Registradas no Turno ({session.orders.length})
              </h3>

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
                        <span className="font-bold text-neutral-900">
                          Pedido #{ord.orderNumber} - {ord.customerName}
                        </span>
                        <span className="text-neutral-500 block">
                          {ord.createdAt} • Método: {ord.paymentMethod}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600 text-sm">R$ {ord.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= GESTÃO RESTRITA DE OPERADORES DE CAIXA ================= */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <UserCheck size={20} className="text-indigo-600" /> Cadastrar & Alterar Operadores de Caixa
            </h2>
            <span className="text-xs text-neutral-500 font-medium">
              {adminUnlocked ? 'Acesso Liberado (Gestor)' : 'Área Protegida'}
            </span>
          </div>

          {!adminUnlocked ? (
            /* Desbloqueio da Área de Operadores com Senha do Gestor */
            <form onSubmit={handleUnlockAdmin} className="max-w-sm mx-auto p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3 text-center">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center mx-auto">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Confirme o Acesso Administrativo</h3>
              <p className="text-xs text-neutral-500">
                Digite a senha administrativa da loja para cadastrar ou editar operadores
              </p>

              <input
                type="password"
                required
                placeholder="Senha do Gestor"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm bg-white"
              />

              {adminError && <p className="text-xs font-bold text-red-600">{adminError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-lg text-xs hover:bg-neutral-800"
              >
                Liberar Painel de Operadores
              </button>
            </form>
          ) : (
            /* Painel de Cadastro e Edição de Operadores Desbloqueado */
            <div className="space-y-6">
              <form onSubmit={handleSaveOperatorSubmit} className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-neutral-900">
                    {editingOperatorId ? 'Editar Operador de Caixa' : 'Novo Cadastro de Operador'}
                  </h3>
                  {editingOperatorId && (
                    <button
                      type="button"
                      onClick={resetOperatorForm}
                      className="text-xs text-neutral-500 hover:underline"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maycon Antonio"
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">CPF</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpfInput}
                      onChange={(e) => setCpfInput(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Login (Ex: @Maycon)</label>
                    <input
                      type="text"
                      required
                      placeholder="@Maycon"
                      value={usernameNewInput}
                      onChange={(e) => setUsernameNewInput(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Criar Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordNewInput}
                      onChange={(e) => setPasswordNewInput(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-neutral-700 mb-1">Confirmar Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {operatorFormError && <p className="text-xs font-bold text-red-600 text-center">{operatorFormError}</p>}
                {operatorFormSuccess && <p className="text-xs font-bold text-emerald-600 text-center">{operatorFormSuccess}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg text-xs hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} /> {editingOperatorId ? 'Atualizar Operador' : 'Cadastrar Operador'}
                </button>
              </form>

              {/* Tabela de Operadores Cadastrados */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-neutral-900">Operadores Cadastrados</h3>

                {operatorsList.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">Nenhum operador cadastrado ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {operatorsList.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-neutral-50 text-xs"
                      >
                        <div>
                          <span className="font-bold text-neutral-900">{op.fullName}</span>
                          <span className="text-indigo-700 font-bold ml-2">{op.username}</span>
                          <span className="text-neutral-500 block">CPF: {op.cpf} • Cadastrado em: {op.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEditOperator(op)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar Operador"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOperatorClick(op.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Excluir Operador"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Relatório de Fechamento Consolidado */}
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
                <span className="text-xs text-red-600 block font-bold">Total Taxas Descontadas</span>
                <span className="text-lg font-bold text-red-700">- R$ {activeReport.totalFees.toFixed(2)}</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-xs text-emerald-800 block font-bold">Faturamento Líquido Real</span>
                <span className="text-lg font-bold text-emerald-700">R$ {activeReport.netTotal.toFixed(2)}</span>
              </div>
            </div>

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
              Operador: {activeReport.operatorName || 'Sistema'} ({activeReport.operatorUsername || '@gestor'})<br />
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
          <p style={{ margin: '3px 0' }}>Total Taxas: -R$ {activeReport.totalFees.toFixed(2)}</p>
          <p style={{ margin: '3px 0', fontSize: '13px', fontWeight: 'bold' }}>
            LÍQUIDO REAL: R$ {activeReport.netTotal.toFixed(2)}
          </p>
          <p style={{ margin: '3px 0', fontSize: '12px', fontWeight: 'bold' }}>
            GAVETA (DINHEIRO): R$ {activeReport.totalCashInHand.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}