import { getLoyaltyCustomers } from './loyalty';

export interface WhatsAppTemplates {
  autoGreeting: string;
  storeOpenNotice: string;
  storeClosedNotice: string;
  promoNotice: string;
}

const STORE_ORDER_URL = 'https://garagem-com-oficial.vercel.app';

export const DEFAULT_WA_TEMPLATES: WhatsAppTemplates = {
  autoGreeting: `Olá! Seja muito bem-vindo(a) à Garagem.Com! 🍕🔥\n\nQue tal saborear a melhor pizza da cidade hoje? Monte seu pedido em nosso cardápio digital em menos de 1 minuto:\n\n👉 ${STORE_ORDER_URL}\n\nQualquer dúvida, estamos à disposição!`,
  
  storeOpenNotice: `Boa noite! 🍕 Estamos de PORTAS ABERTAS e com forno aquecido! 🔥\n\nGaranta sua entrega rápida fazendo o pedido agora pelo link abaixo:\n👉 ${STORE_ORDER_URL}`,
  
  storeClosedNotice: `Olá! Informamos que no momento a Garagem.Com está FECHADA para manutenção/descanso da equipe. 😴\n\nEm breve voltaremos a atender! Acompanhe nossos horários no cardápio:\n👉 ${STORE_ORDER_URL}`,
  
  promoNotice: `🔥 PROMOÇÃO IMPERDÍVEL NA GARAGEM.COM! 🔥\n\nFeche o seu dia com sabor! Peça hoje e ganhe pontos em nosso Clube de Fidelidade!\n\nConfira os combos de hoje e faça seu pedido:\n👉 ${STORE_ORDER_URL}`,
};

export function getWhatsAppTemplates(): WhatsAppTemplates {
  if (typeof window === 'undefined') return DEFAULT_WA_TEMPLATES;
  const saved = localStorage.getItem('garagem_wa_templates');
  if (!saved) return DEFAULT_WA_TEMPLATES;
  try {
    return { ...DEFAULT_WA_TEMPLATES, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_WA_TEMPLATES;
  }
}

export function saveWhatsAppTemplates(templates: WhatsAppTemplates) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_wa_templates', JSON.stringify(templates));
  }
}

// Gera o link de envio direto para o WhatsApp do Cliente
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMsg}`;
}

// Prepara a lista de links para transmissão em massa para clientes cadastrados
export function prepareBroadcastLinks(templateType: keyof WhatsAppTemplates) {
  const customers = getLoyaltyCustomers();
  const templates = getWhatsAppTemplates();
  const msg = templates[templateType];

  return customers.map((c) => ({
    customerName: c.fullName,
    phone: c.phone,
    link: generateWhatsAppLink(c.phone, `Olá, ${c.fullName}!\n\n${msg}`),
  }));
}