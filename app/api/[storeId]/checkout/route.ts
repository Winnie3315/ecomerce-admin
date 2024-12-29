// import prismadb from "@/lib/prismadb";
// import { NextResponse } from "next/server";

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*", // Разрешение запросов с фронтенда
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Разрешенные методы
//     "Access-Control-Allow-Headers": "Content-Type, Authorization", // Разрешенные заголовки
// };

// export async function OPTIONS() {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(
//     req: Request,
//     { params }: { params: { storeId: string } }
// ) {
//     const { productIds } = await req.json();

//     if (!productIds || productIds.length === 0) {
//         return new NextResponse("Product Ids are required", {
//             status: 400,
//             headers: corsHeaders
//         });
//     }

//     const products = await prismadb.product.findMany({
//         where: {
//             id: {
//                 in: productIds.map((item: { id: string }) => item.id),
//             },
//         },
//     });

//     // Проверка, что все продукты были найдены
//     if (products.length !== productIds.length) {
//         return new NextResponse("Some products not found", {
//             status: 404,
//             headers: corsHeaders
//         });
//     }

//     // Создаем заказ в базе данных
//     const order = await prismadb.order.create({
//         data: {
//             storeId: params.storeId,
//             isPaid: false,
//             orderItems: {
//                 create: productIds.map((productId: { id: string, quantity: number }) => ({
//                     product: {
//                         connect: {
//                             id: productId.id, // Связываем продукт по ID
//                         },
//                     },
//                     quantity: productId.quantity, // Добавляем количество
//                 })),
//             },
//         },
//     });

//     // Возвращаем созданный заказ
//     return NextResponse.json({ order }, { headers: corsHeaders });
// }
// import { NextResponse } from 'next/server';
// import prismadb from '@/lib/prismadb';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type,Authorization',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(
//   req: Request,
//   { params }: { params: { storeId: string } },
// ) {
//   const {
//     productIds,
//     values, // данные пользователя
//   } = await req.json();

//   const { firstName, email, streetAddress, apartment, townCity, phoneNumber, companyName } = values;

//   // Проверка на наличие productIds
//   if (!productIds || productIds.length === 0) {
//     return new NextResponse('Ids dos produtos são obrigatórios', {
//       status: 400,
//       headers: corsHeaders,
//     });
//   }

//   // Проверка на наличие данных пользователя
//   if (!firstName || !email || !streetAddress || !townCity || !phoneNumber) {
//     return new NextResponse('Nome, e-mail, endereço, cidade e telefone são obrigatórios', {
//       status: 400,
//       headers: corsHeaders,
//     });
//   }

//   // Формируем полный адрес
//   const address = `${streetAddress} ${apartment || ''} ${townCity}`;

//   // Получаем продукты по списку ID
//   const products = await prismadb.product.findMany({
//     where: {
//       id: {
//         in: productIds,
//       },
//     },
//   });

//   // Если некоторые продукты не найдены
//   if (products.length !== productIds.length) {
//     return new NextResponse('Alguns produtos não foram encontrados', {
//       status: 404,
//       headers: corsHeaders,
//     });
//   }

//   // Создаем или находим пользователя по email
//   let user = await prismadb.user.findUnique({
//     where: { email },
//   });

//   // Если пользователь не найден, создаем нового
//   if (!user) {
//     user = await prismadb.user.create({
//       data: {
//         name: firstName,
//         email: email,
//         address: address,
//         phone: phoneNumber,
//         company: companyName || '', // Если companyName не указано, то пустая строка
//       },
//     });
//   }

//   // Создаем заказ в базе данных с данными пользователя
//   const order = await prismadb.order.create({
//     data: {
//       storeId: params.storeId,
//       isPaid: false, // По умолчанию заказ не оплачен
//       userId: user.id, // Связываем заказ с пользователем
//       orderItems: {
//         create: productIds.map((productId: string) => ({
//           product: {
//             connect: {
//               id: productId,
//             },
//           },
//         })),
//       },
//     },
//   });

//   // Возвращаем URL на страницу с успешным заказом или отменой
//   return NextResponse.json(
//     {
//       orderId: order.id, // ID созданного заказа
//       successUrl: `${process.env.FRONTEND_STORE_URL}/checkout?success=1`,
//       cancelUrl: `${process.env.FRONTEND_STORE_URL}/checkout?canceled=1`,
//     },
//     {
//       headers: corsHeaders,
//     },
//   );
// }
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  const { productIds, values } = await req.json();
  console.log('Received values:', values); // Логирование

  if (!values) {
    return new NextResponse('User data is required', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { firstName, email, streetAddress, apartment, townCity, phoneNumber, companyName } = values;

  if (!productIds || productIds.length === 0) {
    return new NextResponse('Product IDs are required', {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!firstName || !email || !streetAddress || !townCity || !phoneNumber) {
    return new NextResponse('Name, email, address, city, and phone number are required', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const address = `${streetAddress} ${apartment || ''} ${townCity}`;

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (products.length !== productIds.length) {
    return new NextResponse('Some products were not found', {
      status: 404,
      headers: corsHeaders,
    });
  }

  let user = await prismadb.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prismadb.user.create({
      data: {
        name: firstName,
        email: email,
        address: address,
        phone: phoneNumber,
        company: companyName || '',
      },
    });
  }

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      userId: user.id,
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      },
    },
  });

  return NextResponse.json(
    {
      orderId: order.id,
      successUrl: `${process.env.FRONTEND_STORE_URL}/checkout?success=1`,
      cancelUrl: `${process.env.FRONTEND_STORE_URL}/checkout?canceled=1`,
    },
    {
      headers: corsHeaders,
    },
  );
}
