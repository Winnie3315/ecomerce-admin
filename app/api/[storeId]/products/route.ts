import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const { 
      name, 
      price, 
      categoryId, 
      sizeId, 
      colorId, 
      images,
      discount, 
      isArchived, 
      isFeatured, 
      description,
    } = body;

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!price) return new NextResponse('Price is required', { status: 400 });
    if (!categoryId) return new NextResponse('Category id is required', { status: 400 });
    if (!colorId) return new NextResponse('Color id is required', { status: 400 });
    if (!sizeId) return new NextResponse('Size id is required', { status: 400 });
    if (!description) return new NextResponse('Description is required', { status: 400 });
    if (!images || !images.length) return new NextResponse('Images are required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 })

    const product = await prismadb?.product.create({
      data: {
        name,
        price,
        categoryId,
        isArchived,
        isFeatured,
        colorId,
        discount,
        sizeId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url }))
          }
        },
        description
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}


// export async function GET(req: Request, { params }: { params: { storeId: string } }) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const categoryId = searchParams.get("categoryId") || undefined
//     const colorId = searchParams.get("colorId") || undefined
//     const sizeId = searchParams.get("sizeId") || undefined
//     const isFeatured = searchParams.get("isFeatured")


//     if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

//     const products = await prismadb?.product.findMany({
//       where: {
//         storeId: params.storeId,
//         categoryId, 
//         colorId, 
//         sizeId, 
//         isFeatured: isFeatured ? true : undefined, 
//         isArchived: false,
//       },
//       include: {
//         images: true,
//         color: true,
//         size: true,
//         category: true,
//       },
//       orderBy: {
//         createdAt: "desc"
//       }
//     })

//     return NextResponse.json(products)
//   } catch (error) {
//     console.error('[PRODUCTS_GET]', error);
//     return new NextResponse('Internal error', { status: 500 });
//   }
// }


export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const currentDate = new Date();

    // Условие для скидки, только если даты существуют
    const discountConditions: any = {};
    if (searchParams.has("discountUntil")) {
      discountConditions.discountUntil = { gte: currentDate };
    }
    if (searchParams.has("discountEndDate")) {
      discountConditions.discountEndDate = { lte: currentDate };
    }

    // Условие для isFeatured
    const featuredCondition = isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined;

    const products = await prismadb?.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: featuredCondition,
        isArchived: false,
        ...discountConditions, // Динамически добавляем условия скидки
      },
      include: {
        images: true,
        color: true,
        size: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
