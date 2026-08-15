const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ============================================================================
  // DELETAR DADOS EXISTENTES
  // ============================================================================
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItemOption.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.optionItem.deleteMany({});
  await prisma.optionGroup.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.deliveryZone.deleteMany({});
  await prisma.businessHours.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.user.deleteMany({});

  // ============================================================================
  // CRIAR USUÁRIOS
  // ============================================================================
  const admin = await prisma.user.create({
    data: {
      email: 'admin@GaragemCom.com',
      password: 'admin123', // Em produção, isso seria hashed
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  const attendant = await prisma.user.create({
    data: {
      email: 'atendente@GaragemCom.com',
      password: 'attendant123',
      name: 'João Atendente',
      role: 'ATTENDANT',
    },
  });

  const kitchen = await prisma.user.create({
    data: {
      email: 'cozinha@GaragemCom.com',
      password: 'kitchen123',
      name: 'Cozinha',
      role: 'KITCHEN',
    },
  });

  // ============================================================================
  // CRIAR NEGÓCIO
  // ============================================================================
  const business = await prisma.business.create({
    data: {
      name: 'Pizzaria & Delivery Garagem.Com',
      phone: '(11) 3000-0000',
      email: 'contato@GaragemCom.com',
      deliveryTaxFlat: 5.0,
      minDeliveryValue: 20.0,
      estimatedDeliveryTime: 30,
    },
  });

  // ============================================================================
  // CRIAR HORÁRIO DE FUNCIONAMENTO
  // ============================================================================
  for (let day = 0; day < 7; day++) {
    await prisma.businessHours.create({
      data: {
        businessId: business.id,
        dayOfWeek: day,
        openTime: day === 0 ? '11:00' : '10:00', // Domingo abre às 11h
        closeTime: '23:00',
        isClosed: false,
      },
    });
  }

  // ============================================================================
  // CRIAR ZONAS DE ENTREGA
  // ============================================================================
  await prisma.deliveryZone.create({
    data: {
      businessId: business.id,
      name: 'Centro',
      zipCodes: JSON.stringify(['01000-000', '01100-000', '01200-000']),
      deliveryTax: 5.0,
      estimatedTime: 20,
    },
  });

  await prisma.deliveryZone.create({
    data: {
      businessId: business.id,
      name: 'Zona Leste',
      zipCodes: JSON.stringify(['03000-000', '03100-000']),
      deliveryTax: 8.0,
      estimatedTime: 35,
    },
  });

  await prisma.deliveryZone.create({
    data: {
      businessId: business.id,
      name: 'Zona Oeste',
      zipCodes: JSON.stringify(['05000-000', '05100-000']),
      deliveryTax: 7.0,
      estimatedTime: 30,
    },
  });

  // ============================================================================
  // CRIAR CATEGORIAS
  // ============================================================================
  const categoryPizzas = await prisma.category.create({
    data: {
      name: 'Pizzas',
      description: 'Pizzas tradicionais e especiais',
      icon: 'Pizza',
      order: 1,
    },
  });

  const categoryLanches = await prisma.category.create({
    data: {
      name: 'Lanches',
      description: 'Hambúrgueres, sanduíches e mais',
      icon: 'Sandwich',
      order: 2,
    },
  });

  const categoryBebidas = await prisma.category.create({
    data: {
      name: 'Bebidas',
      description: 'Refrigerantes, sucos e cerveja',
      icon: 'Droplet',
      order: 3,
    },
  });

  const categorySobremesas = await prisma.category.create({
    data: {
      name: 'Sobremesas',
      description: 'Doces e acompanhamentos',
      icon: 'Cake',
      order: 4,
    },
  });

  // ============================================================================
  // CRIAR PRODUTOS - PIZZAS
  // ============================================================================
  const pizzaMozzarella = await prisma.product.create({
    data: {
      categoryId: categoryPizzas.id,
      name: 'Pizza Mozzarella',
      description: 'Molho de tomate, mozzarella e orégano',
      price: 45.0,
      isActive: true,
    },
  });

  const pizzaCalabresa = await prisma.product.create({
    data: {
      categoryId: categoryPizzas.id,
      name: 'Pizza Calabresa',
      description: 'Molho de tomate, calabresa, cebola e mozzarella',
      price: 52.0,
      isActive: true,
    },
  });

  const pizzaPepperoni = await prisma.product.create({
    data: {
      categoryId: categoryPizzas.id,
      name: 'Pizza Pepperoni',
      description: 'Molho de tomate, pepperoni e mozzarella',
      price: 55.0,
      isActive: true,
    },
  });

  // ============================================================================
  // CRIAR OPÇÕES PARA PIZZAS - TAMANHO
  // ============================================================================
  const tamanhoGroup = await prisma.optionGroup.create({
    data: {
      productId: pizzaMozzarella.id,
      name: 'Tamanho',
      isRequired: true,
      maxSelections: 1,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: tamanhoGroup.id,
      name: 'Pequena (30cm)',
      priceExtra: 0.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: tamanhoGroup.id,
      name: 'Média (35cm)',
      priceExtra: 5.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: tamanhoGroup.id,
      name: 'Grande (40cm)',
      priceExtra: 10.0,
    },
  });

  // Adicionar opção de tamanho para calabresa
  const tamanhoGroupCalabresa = await prisma.optionGroup.create({
    data: {
      productId: pizzaCalabresa.id,
      name: 'Tamanho',
      isRequired: true,
      maxSelections: 1,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: tamanhoGroupCalabresa.id,
      name: 'Pequena (30cm)',
      priceExtra: 0.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: tamanhoGroupCalabresa.id,
      name: 'Média (35cm)',
      priceExtra: 5.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: tamanhoGroupCalabresa.id,
      name: 'Grande (40cm)',
      priceExtra: 10.0,
    },
  });

  // ============================================================================
  // CRIAR PRODUTOS - LANCHES
  // ============================================================================
  const hamburguer = await prisma.product.create({
    data: {
      categoryId: categoryLanches.id,
      name: 'Hambúrguer Clássico',
      description: 'Pão, carne, alface, tomate, queijo e molho especial',
      price: 28.0,
      isActive: true,
    },
  });

  // Opção de ponto da carne para hambúrguer
  const pontoGroup = await prisma.optionGroup.create({
    data: {
      productId: hamburguer.id,
      name: 'Ponto da Carne',
      isRequired: true,
      maxSelections: 1,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: pontoGroup.id,
      name: 'Mal Passado',
      priceExtra: 0.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: pontoGroup.id,
      name: 'Ponto',
      priceExtra: 0.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: pontoGroup.id,
      name: 'Bem Passado',
      priceExtra: 0.0,
    },
  });

  // Adicionais para hambúrguer
  const adicionaisGroup = await prisma.optionGroup.create({
    data: {
      productId: hamburguer.id,
      name: 'Adicionais',
      isRequired: false,
      maxSelections: 99, // ilimitado
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: adicionaisGroup.id,
      name: 'Bacon Extra',
      priceExtra: 5.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: adicionaisGroup.id,
      name: 'Queijo Extra',
      priceExtra: 3.0,
    },
  });

  await prisma.optionItem.create({
    data: {
      groupId: adicionaisGroup.id,
      name: 'Ovo',
      priceExtra: 2.0,
    },
  });

  // ============================================================================
  // CRIAR PRODUTOS - BEBIDAS
  // ============================================================================
  await prisma.product.create({
    data: {
      categoryId: categoryBebidas.id,
      name: 'Refrigerante Coca-Cola',
      description: 'Coca-Cola 350ml gelada',
      price: 8.0,
      isActive: true,
    },
  });

  await prisma.product.create({
    data: {
      categoryId: categoryBebidas.id,
      name: 'Suco Natural',
      description: 'Suco de laranja natural 400ml',
      price: 12.0,
      isActive: true,
    },
  });

  await prisma.product.create({
    data: {
      categoryId: categoryBebidas.id,
      name: 'Cerveja Heineken',
      description: 'Cerveja Heineken 350ml',
      price: 10.0,
      isActive: true,
    },
  });

  // ============================================================================
  // CRIAR PRODUTOS - SOBREMESAS
  // ============================================================================
  await prisma.product.create({
    data: {
      categoryId: categorySobremesas.id,
      name: 'Brownie Chocolate',
      description: 'Brownie quente com calda de chocolate',
      price: 18.0,
      isActive: true,
    },
  });

  await prisma.product.create({
    data: {
      categoryId: categorySobremesas.id,
      name: 'Sorvete',
      description: 'Sorvete diversos sabores 100ml',
      price: 12.0,
      isActive: true,
    },
  });

  // ============================================================================
  // CRIAR CLIENTES
  // ============================================================================
  const customer1 = await prisma.customer.create({
    data: {
      name: 'João Silva',
      phone: '11999999999',
      email: 'joao@example.com',
      defaultAddress: 'Rua das Flores, 123',
      defaultCity: 'São Paulo',
      defaultZip: '01000-000',
      defaultNumber: '123',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Maria Santos',
      phone: '11988888888',
      email: 'maria@example.com',
      defaultAddress: 'Avenida Paulista, 1000',
      defaultCity: 'São Paulo',
      defaultZip: '01311-100',
      defaultNumber: '1000',
    },
  });

  // ============================================================================
  // CRIAR PEDIDOS DE EXEMPLO
  // ============================================================================
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      customerName: 'João Silva',
      customerPhone: '11999999999',
      customerEmail: 'joao@example.com',
      deliveryAddress: 'Rua das Flores, 123',
      deliveryCity: 'São Paulo',
      deliveryZip: '01000-000',
      deliveryNumber: '123',
      orderType: 'DELIVERY',
      status: 'CONFIRMED',
      paymentMethod: 'PIX',
      paymentStatus: 'PENDING',
      subtotal: 97.0,
      deliveryTax: 5.0,
      total: 102.0,
      estimatedTime: 30,
      notes: 'Sem cebola na pizza',
    },
  });

  // Adicionar itens ao pedido
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: pizzaMozzarella.id,
      quantity: 1,
      unitPrice: 45.0,
      subtotal: 52.0, // com tamanho grande
      notes: 'Tamanho grande',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: hamburguer.id,
      quantity: 2,
      unitPrice: 28.0,
      subtotal: 45.0, // 2x com adicionais
      notes: 'Bem passado com bacon extra',
    },
  });

  // Histórico de status
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order1.id,
      status: 'PENDING',
      changedBy: attendant.id,
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order1.id,
      status: 'CONFIRMED',
      changedBy: attendant.id,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📊 Dados criados:');
  console.log('   - 1 Usuário Admin');
  console.log('   - 1 Usuário Atendente');
  console.log('   - 1 Usuário Cozinha');
  console.log('   - 1 Negócio (Pizzaria)');
  console.log('   - 3 Zonas de Entrega');
  console.log('   - 4 Categorias de Produtos');
  console.log('   - 8 Produtos');
  console.log('   - 2 Clientes');
  console.log('   - 1 Pedido de Exemplo');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
