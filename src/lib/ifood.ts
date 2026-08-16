import { registerOrderInCash, updateOrderInCash, getCurrentCashSession } from '@/lib/cash-register';

const IFOOD_CLIENT_ID = process.env.NEXT_PUBLIC_IFOOD_CLIENT_ID || '';
const IFOOD_CLIENT_SECRET = process.env.NEXT_PUBLIC_IFOOD_CLIENT_SECRET || '';
const IFOOD_BASE_URL = 'https://merchant-api.ifood.com.br';

let cachedAccessToken: string | null = null;

export async function getIFoodToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken;

  if (!IFOOD_CLIENT_ID || !IFOOD_CLIENT_SECRET) {
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('grantType', 'client_credentials');
    params.append('clientId', IFOOD_CLIENT_ID);
    params.append('clientSecret', IFOOD_CLIENT_SECRET);

    const res = await fetch(`${IFOOD_BASE_URL}/authentication/v1.0/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await res.json();
    if (data.accessToken) {
      cachedAccessToken = data.accessToken;
      return data.accessToken;
    }
  } catch (error) {
    console.error('Erro ao autenticar com iFood:', error);
  }
  return null;
}

export async function syncIFoodOrders() {
  const token = await getIFoodToken();
  if (!token) return { success: false, newOrdersCount: 0 };

  try {
    const res = await fetch(`${IFOOD_BASE_URL}/order/v1.0/events:poll`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204) {
      return { success: true, newOrdersCount: 0 };
    }

    const events = await res.json();
    const acknowledgedEventIds: string[] = [];
    let importedCount = 0;

    for (const event of events) {
      // 1. Novo Pedido Criado no iFood
      if (event.code === 'PLC') {
        const orderRes = await fetch(`${IFOOD_BASE_URL}/order/v1.0/orders/${event.orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (orderRes.ok) {
          const ifoodOrder = await orderRes.json();
          const isPrepaid = ifoodOrder.payments?.prepaid === true;

          registerOrderInCash({
            customerName: `[iFood] ${ifoodOrder.customer?.name || 'Cliente'}`,
            phone: ifoodOrder.customer?.phone?.number || '',
            orderType: 'entrega',
            itemsSummary: (ifoodOrder.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(', ') || 'Itens iFood',
            total: (ifoodOrder.total?.subTotal || 0) + (ifoodOrder.total?.deliveryFee || 0),
            paymentMethod: isPrepaid ? 'credito_online' : 'credito_presencial',
            isPaid: isPrepaid,
            status: 'preparo',
            source: 'ifood',
          });

          importedCount++;
        }
      }

      // 2. Confirmação de Entrega pelo iFood (Auto-Finaliza se for pré-pago)
      if (event.code === 'CON' || event.code === 'DEL') {
        const session = getCurrentCashSession();
        const matchingOrder = session.orders.find(
          (o) => o.source === 'ifood' && o.customerName.includes(event.orderId)
        );

        if (matchingOrder) {
          if (matchingOrder.isPaid) {
            updateOrderInCash({
              ...matchingOrder,
              status: 'finalizado',
            });
          }
        }
      }

      acknowledgedEventIds.push(event.id);
    }

    if (acknowledgedEventIds.length > 0) {
      await fetch(`${IFOOD_BASE_URL}/order/v1.0/events/acknowledgment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acknowledgedEventIds.map((id) => ({ id }))),
      });
    }

    return { success: true, newOrdersCount: importedCount };
  } catch (error) {
    console.error('Erro na sincronizacao do iFood:', error);
    return { success: false, newOrdersCount: 0 };
  }
}