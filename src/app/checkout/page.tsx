'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Utensils,
  Truck,
  ShoppingBag,
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { registerOrderInCash } from '@/lib/cash-register';

export default function AppCheckoutPage() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<'entrega' | 'retirada'>('entrega');
  
  // Dados do Cliente
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  // Endereço (se entrega)
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');

  // Formas de Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credito_online' | 'debito_online' | 'dinheiro'>('pix');
  const [needChangeOption, setNeedChangeOption] = useState<'sim' | 'nao' | null>(null);
  const [changeForInput, setChangeForInput] = useState('');

  // Carrinho
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('garagem_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Seu carrinho está vazio!');
      return;
    }

    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg('Por favor, informe seu nome e telefone.');
      return;
    }

    if (orderType === 'entrega' && (!street.trim() || !number.trim() || !neighborhood.trim())) {
      setErrorMsg('Preencha o endereço completo para entrega.');
      return;
    }

    // Validação de Troco no Dinheiro
    if (paymentMethod === 'dinheiro') {
      if (needChangeOption === null) {
        setErrorMsg('Por favor, informe se precisa de troco para o pagamento em dinheiro.');
        return;
      }
      if (needChangeOption === 'sim' && (!changeForInput || parseFloat(changeForInput) <= calculateTotal())) {
        setErrorMsg(`Informe um valor para troco maior que R$ ${calculateTotal().toFixed(2)}.`);
        return;
      }
    }

    setIsSubmitting(true);

    const isOnlinePayment = paymentMethod === 'pix' || paymentMethod === 'credito_online' || paymentMethod === 'debito_online';
    const totalAmount = calculateTotal();
    const itemsSummary = cartItems.map((i) => `${i.quantity}x ${i.title || i.name}`).join(', ');

    const newOrder = registerOrderInCash({
      customerName: customerName.trim(),
      phone: phone.trim(),
      orderType: orderType,
      address: orderType === 'entrega' ? {
        street,
        number,
        neighborhood,
        complement,
        reference,
      } : undefined,
      itemsSummary,
      itemsList: cartItems,
      total: totalAmount,
      paymentMethod,
      needChange: paymentMethod === 'dinheiro' && needChangeOption === 'sim',
      changeFor: paymentMethod === 'dinheiro' && needChangeOption === 'sim' ? parseFloat(changeForInput) : undefined,
      isPaid: isOnlinePayment, // Pagamentos online só concluem marcados como pagos
      status: 'preparo',
      source: 'site',
    });

    localStorage.removeItem('garagem_cart');
    router.push(`/checkout/success?orderId=${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Header com Ícone de Lanchonete/Hambúrguer */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/menu" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Utensils size={20} className="text-amber-500" /> Finalizar Pedido
          </h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-5">
        {/* Toggle Entrega vs Retirada */}
        <div className="bg-white p-1.5 rounded-xl border border-neutral-200 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderType('entrega')}
            className={`py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              orderType === 'entrega'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                : 'bg-white text-neutral-600 border-transparent hover:bg-neutral-50'
            }`}
          >
            <Truck size={16} /> Receber em Casa
          </button>

          <button
            type="button"
            onClick={() => setOrderType('retirada')}
            className={`py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              orderType === 'retirada'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                : 'bg-white text-neutral-600 border-transparent hover:bg-neutral-50'
            }`}
          >
            <ShoppingBag size={16} /> Retirar na Loja
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
          {/* Dados Pessoais */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
            <h2 className="font-bold text-neutral-900 text-sm">Seus Dados</h2>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                placeholder="Como prefere ser chamado?"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">WhatsApp / Telefone</label>
              <input
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Endereço de Entrega */}
          {orderType === 'entrega' && (
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
              <h2 className="font-bold text-neutral-900 text-sm">Endereço de Entrega</h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Rua / Logradouro</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da rua"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Número</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Bairro</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto, Bloco..."
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    placeholder="Próximo ao mercado..."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Formas de Pagamento */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
            <h2 className="font-bold text-neutral-900 text-sm">Forma de Pagamento</h2>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                <div className="flex items-center gap-2 font-bold text-neutral-800">
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="text-emerald-600"
                  />
                  <QrCode size={18} className="text-emerald-600" /> PIX (Aprovação Instantânea)
                </div>
              </label>

              <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                <div className="flex items-center gap-2 font-bold text-neutral-800">
                  <input
                    type="radio"
                    name="payment"
                    value="credito_online"
                    checked={paymentMethod === 'credito_online'}
                    onChange={() => setPaymentMethod('credito_online')}
                    className="text-indigo-600"
                  />
                  <CreditCard size={18} className="text-indigo-600" /> Cartão de Crédito Online
                </div>
              </label>

              <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                <div className="flex items-center gap-2 font-bold text-neutral-800">
                  <input
                    type="radio"
                    name="payment"
                    value="dinheiro"
                    checked={paymentMethod === 'dinheiro'}
                    onChange={() => setPaymentMethod('dinheiro')}
                    className="text-amber-600"
                  />
                  <DollarSign size={18} className="text-amber-600" /> Dinheiro na Entrega/Retirada
                </div>
              </label>
            </div>

            {/* Pergunta Obrigatória de Troco (Se Dinheiro) */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3 mt-3">
                <span className="font-bold text-amber-900 block">Precisa de troco? *</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
                    <input
                      type="radio"
                      name="needChange"
                      checked={needChangeOption === 'sim'}
                      onChange={() => setNeedChangeOption('sim')}
                    /> Sim, preciso de troco
                  </label>

                  <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
                    <input
                      type="radio"
                      name="needChange"
                      checked={needChangeOption === 'nao'}
                      onChange={() => {
                        setNeedChangeOption('nao');
                        setChangeForInput('');
                      }}
                    /> Não preciso
                  </label>
                </div>

                {needChangeOption === 'sim' && (
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Troco para quanto?</label>
                    <input
                      type="number"
                      step="5.00"
                      required
                      placeholder={`Ex: 50.00 ou 100.00`}
                      value={changeForInput}
                      onChange={(e) => setChangeForInput(e.target.value)}
                      className="w-full p-2.5 border border-amber-300 rounded-lg bg-white font-bold text-amber-950"
                    />
                    {parseFloat(changeForInput) > calculateTotal() && (
                      <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                        Seu troco será de: R$ {(parseFloat(changeForInput) - calculateTotal()).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
            <div className="flex justify-between font-bold text-sm text-neutral-900">
              <span>Total a Pagar:</span>
              <span className="text-emerald-600 text-base">R$ {calculateTotal().toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Confirmar & Enviar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}