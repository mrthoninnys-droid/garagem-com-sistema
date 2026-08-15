import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '20');

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
              options: true,
            },
          },
          customer: true,
          statusHistory: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryZip,
      deliveryNumber,
      orderType,
      paymentMethod,
      items,
      notes,
      subtotal,
      deliveryTax,
      total,
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        deliveryCity,
        deliveryZip,
        deliveryNumber,
        orderType: orderType || 'DELIVERY',
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal,
        deliveryTax: deliveryTax || 0,
        total,
        notes,
        estimatedTime: 30,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            notes: item.notes,
            options: {
              create: item.selectedOptions?.map((opt: any) => ({
                optionItemId: opt.optionItemId,
                name: opt.optionName,
                priceExtra: opt.priceExtra,
              })) || [],
            },
          })),
        },
        statusHistory: {
          create: [
            {
              status: 'PENDING',
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
            options: true,
          },
        },
        statusHistory: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Pedido criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}
