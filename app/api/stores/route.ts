import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Ожидание результата от функции auth
    const { userId } = await auth();
    const body = await req.json();

    const { name } = body;

    console.log(name, "MAME");
    

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    if (!name) return new NextResponse('Name is required', { status: 400 });

    const store = await prismadb?.store.create({
        data: {
            name,
            userId
        }
    })
    console.log('Store created:', store);

    return NextResponse.json(store)
  } catch (error) {
    console.error('[STORES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
