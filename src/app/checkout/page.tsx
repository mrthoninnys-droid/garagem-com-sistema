'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle size={64} className="text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Pedido Recebido!</h1>
        <p className="text-neutral-600 mb-6 max-w-sm">
          Seu pedido foi enviado para a Garagem.Com. Em breve iniciaremos o preparo.
        </p>
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
          {/* Dados do Cliente */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Seus Dados</h2>
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
          </div>

          {/* Endereço de Entrega */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Endereço de Entrega</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Rua, Número e Bairro</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua das Flores, 123 - Apto 42 - Centro"
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
            <h2 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2">Forma de Pagamento</h2>
            
            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="font-medium text-neutral-800">Pix</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="font-medium text-neutral-800">Cartão de Crédito / Débito na Entrega</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="font-medium text-neutral-800">Dinheiro</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md text-lg"
          >
            Confirmar e Enviar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}