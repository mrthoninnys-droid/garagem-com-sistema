'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Search, Loader2, CreditCard, ShoppingBag, Award } from 'lucide-react';
import Link from 'next/link';
import { calculateFeeForAddress } from '@/lib/delivery-rates';
import {
  getLoyaltySettings,
  getCustomerLoyaltyByPhone,
  addOrderPoints,
  CustomerLoyalty,
} from '@/lib/loyalty';

interface CartItem {
  id: string;
  name?: string;
  productName?: string;
  price?: number;
  unitPrice?: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Dados do Cliente
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Fidelidade
  const [loyaltyProfile, setLoyaltyProfile] = useState<CustomerLoyalty | null>(null);
  const [redeemDiscount, setRedeemDiscount] = useState(false);
  const loyaltySettings = getLoyaltySettings();

  // Endereço e CEP
  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [complement, setComplement] = useState('');
  const [deliveryTax, setDeliveryTax] = useState<number | null>(null);
  const [cepError, setCepError] = useState('');

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('garagem_cart_items');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Busca perfil de fidelidade assim que o cliente digita o telefone
  useEffect(() => {
    if (phone.length >= 8) {
      const profile = getCustomerLoyaltyByPhone(phone);
      setLoyaltyProfile(profile);
      if (profile && profile.name && !name) {
        setName(profile.name);
      }
    } else {
      setLoyaltyProfile(null);
      setRedeemDiscount(false);
    }
  }, [phone]);

  // Subtotais
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.unitPrice || item.price || 0) * item.quantity,
    0
  );

  const discountAmount = redeemDiscount ? loyaltySettings.rewardDiscount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount) + (deliveryTax || 0);

  const handleSearchCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setCepError('');
    setLoadingCep(true);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError('CEP não encontrado. Digite o endereço manualmente.');
        setDeliveryTax(10.0);
      } else {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');

        const tax = calculateFeeForAddress(data.localidade || '', cleanCep);
        setDeliveryTax(tax);
      }
    } catch {
      setCepError('Erro ao buscar o CEP. Digite o endereço manualmente.');
      setDeliveryTax(10.0);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Salva a compra e acumula os pontos de fidelidade do cliente
    const points = addOrderPoints(name, phone, finalTotal, redeemDiscount);
    setEarnedPoints(points);

    localStorage.removeItem('garagem_cart_items');
    setOrderSubmitted(true);
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle size={64} className="text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Pedido Recebido com Sucesso!</h1>
        <p className="text-neutral-600 mb-4 max-w-sm">
          Seu pedido foi enviado para a Garagem.Com. Em breve iniciaremos o preparo.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 max-w-sm w-full text-amber-900 text-sm">
          <div className="flex items-center justify-center gap-2 font-bold text-base mb-1">
            <Award className="text-amber-600" size={20} /> +{earnedPoints} Pontos Acumulados!
          </div>
          <p>
            Parabéns! Seus dados e pontos foram salvos para a sua próxima compra.
          </p>
        </div>

        <Link
          href="/customer"
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Voltar ao Cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/customer" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">Finalizar Pedido</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3 shadow-sm">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
              <ShoppingBag size={18} /> Resumo dos Produtos
            </h2>
            {cartItems.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhum produto selecionado.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-800">
                    <span>
                      {item.quantity}x {item.productName || item.name}
                    </span>
                    <span className="font-medium">
                      R$ {((item.unitPrice || item.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seus Dados + Programa de Fidelidade */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Seus Dados</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maycon Antonio"
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Banner de Fidelidade do Cliente */}
            {loyaltyProfile && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-amber-900">
                <div className="flex justify-between items-center">
                  <span className="font-bold flex items-center gap-1.5 text-sm">
                    <Award className="text-amber-600" size={18} /> Você tem {loyaltyProfile.points} pontos de fidelidade!
                  </span>
                </div>

                {loyaltyProfile.points >= loyaltySettings.pointsToRedeem ? (
                  <label className="flex items-center gap-2 font-semibold text-xs cursor-pointer text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={redeemDiscount}
                      onChange={(e) => setRedeemDiscount(e.target.checked)}
                    />
                    Usar {loyaltySettings.pointsToRedeem} pontos para ganhar R$ {loyaltySettings.rewardDiscount.toFixed(2)} de desconto!
                  </label>
                ) : (
                  <p className="text-xs text-amber-800">
                    Faltam {loyaltySettings.pointsToRedeem - loyaltyProfile.points} pontos para resgatar R$ {loyaltySettings.rewardDiscount.toFixed(2)} de desconto.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Endereço por CEP */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Endereço de Entrega</h2>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">CEP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="flex-1 p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleSearchCep}
                  disabled={loadingCep}
                  className="px-4 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 flex items-center gap-2"
                >
                  {loadingCep ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Buscar CEP
                </button>
              </div>
              {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Nome da rua"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Número</label>
                <input
                  type="text"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Bairro</label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Bairro"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cidade / UF</label>
                <input
                  type="text"
                  required
                  value={city ? `${city} - ${state}` : ''}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade - UF"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Complemento (Opcional)</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Apto, Bloco, Ponto de referência"
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3 shadow-sm">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Forma de Pagamento</h2>

            {/* PIX */}
            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div>
                <span className="font-medium text-neutral-800 block">PIX</span>
                <span className="text-xs text-neutral-500">Aprovação instantânea</span>
              </div>
            </label>

            {/* Cartão de Crédito Online */}
            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="credit_online"
                checked={paymentMethod === 'credit_online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="flex-1">
                <span className="font-medium text-neutral-800 block">Cartão de Crédito (Online)</span>
                <span className="text-xs text-neutral-500">Pagamento online imediato</span>
              </div>
              <CreditCard size={18} className="text-neutral-400" />
            </label>

            {/* Cartão de Débito Online */}
            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="debit_online"
                checked={paymentMethod === 'debit_online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="flex-1">
                <span className="font-medium text-neutral-800 block">Cartão de Débito (Online)</span>
                <span className="text-xs text-neutral-500">Débito em conta online</span>
              </div>
              <CreditCard size={18} className="text-neutral-400" />
            </label>

            {(paymentMethod === 'credit_online' || paymentMethod === 'debit_online') && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3 mt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Nome do titular"
                    className="w-full p-2 border border-neutral-300 rounded text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="w-full p-2 border border-neutral-300 rounded text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full p-2 border border-neutral-300 rounded text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Código CVV</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full p-2 border border-neutral-300 rounded text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="delivery_machine"
                checked={paymentMethod === 'delivery_machine'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div>
                <span className="font-medium text-neutral-800 block">Maquininha na Entrega</span>
                <span className="text-xs text-neutral-500">Cartão de Crédito ou Débito ao receber</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div>
                <span className="font-medium text-neutral-800 block">Dinheiro na Entrega</span>
              </div>
            </label>
          </div>

          {/* Resumo Final de Valores */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2 shadow-sm">
            <div className="flex justify-between text-neutral-600 text-sm">
              <span>Subtotal (Produtos):</span>
              <span className="font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>

            {redeemDiscount && (
              <div className="flex justify-between text-emerald-600 text-sm font-semibold">
                <span>Desconto Fidelidade:</span>
                <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600 text-sm">
              <span>Taxa de Entrega:</span>
              <span className="font-semibold">
                {deliveryTax !== null
                  ? `R$ ${deliveryTax.toFixed(2).replace('.', ',')}`
                  : 'Informe o CEP'}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold text-neutral-900 border-t border-neutral-100 pt-3 mt-2">
              <span>Valor Total Final:</span>
              <span className="text-primary text-xl">
                R$ {finalTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md text-lg"
          >
            Confirmar e Enviar Pedido (R$ {finalTotal.toFixed(2).replace('.', ',')})
          </button>
        </form>
      </div>
    </div>
  );
}