import { registerOrderInCash } from '@/lib/cash-register';

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
      if (event.code === 'PLC') {
        const orderRes = await fetch(`${IFOOD_BASE_URL}/order/v1.0/orders/${event.orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (orderRes.ok) {
          const ifoodOrder = await orderRes.json();

          registerOrderInCash({
            customerName: `[iFood] ${ifoodOrder.customer?.name || 'Cliente'}`,
            phone: ifoodOrder.customer?.phone?.number || '',
            total: (ifoodOrder.total?.subTotal || 0) + (ifoodOrder.total?.deliveryFee || 0),
            paymentMethod: 'pix',
          });

          importedCount++;
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