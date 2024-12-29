import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request, {params}: {params: { storeId: string }}) {
  try {
    // Ожидание результата от функции auth
    const { userId } = await auth();
    const body = await req.json();

    const { name, billboardId, imageUrl } = body;   

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    if (!name) return new NextResponse('Name is required', { status: 400 });
    if (!billboardId) return new NextResponse('Billboard Id is required', { status: 400 });
    if (!imageUrl) return new NextResponse('Image URL is required', { status: 400 });
    if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId
        }
    })

    if(!storeByUserId) return new NextResponse("Unauthorized", {status: 403})

    const category = await prismadb?.category.create({
        data: {
            name,
            billboardId,
            imageUrl,
            storeId: params.storeId
        }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}


export async function GET(req: Request, {params}: {params: { storeId: string }}) {
    try {
      if (!params.storeId) return new NextResponse('Store id is required', { status: 400 });

      const categories = await prismadb?.category.findMany({
        where: {
            storeId: params.storeId,

        }
      })
  
      return NextResponse.json(categories)
    } catch (error) {
      console.error('[CATEGORIES_GET]', error);
      return new NextResponse('Internal error', { status: 500 });
    }
  }
  