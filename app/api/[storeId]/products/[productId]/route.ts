import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { Product } from "@prisma/client";
import { NextResponse } from "next/server";


interface UpdatedProductData {
  name: string;
  categoryId: string;
  isArchived?: boolean;
  isFeatured?: boolean;
  colorId: string;
  sizeId: string;
  description: string;
  storeId: string;
  images: { deleteMany: object };
  discount?: number;
}

interface ProductRequestBody {
  name: string;
  price: number;
  categoryId: string;
  sizeId: string;
  colorId: string;
  images: { url: string }[];
  discount?: number;
  isArchived?: boolean;
  isFeatured?: boolean;
  description: string;
}

export async function PATCH(req: Request, { params }: { params: { storeId: string, productId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const body: ProductRequestBody = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return new NextResponse('Request body cannot be empty', { status: 400 });
    }

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

    if (!name || !price || !categoryId || !colorId || !sizeId || !images || description || !images.length) {
      return new NextResponse('All fields are required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const updatedProductData: UpdatedProductData = {
      name,
      categoryId,
      isArchived,
      isFeatured,
      colorId,
      sizeId,
      description,
      storeId: params.storeId,
      images: {
        deleteMany: {},
      },
    };

    if (discount !== undefined) {
      updatedProductData.discount = discount;
    }

    const updatedProduct: Product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: updatedProductData
    });

    const productWithNewImages = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
      }
    });

    return NextResponse.json(productWithNewImages);
  } catch (error) {
    console.error('[PRODUCT_PATCH] Error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}


export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {
        if (!params.productId) return new NextResponse("Product id is required", { status: 400 })

        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId,
            },
            include: {
                images: true,
                color: true,
                size: true,
                category: true,
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('[PRODUCT_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) return new NextResponse('Unauthorized', { status: 401 });

        if (!params.productId) return new NextResponse("billboard id is required", { status: 400 })


        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 })

        const product = await prismadb.product.deleteMany({
            where: {
                id: params.productId,
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('[PRODUCT_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}



// export async function PATCH(req: Request, { params }: { params: { storeId: string, productId: string } }) {
//     try {
//       const { userId } = await auth();
//       if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
//       const body = await req.json();
//       if (!body || Object.keys(body).length === 0) {
//         return new NextResponse('Request body cannot be empty', { status: 400 });
//       }
  
//       const {
//         name,
//         price,
//         categoryId,
//         sizeId,
//         colorId,
//         images,
//         discount,
//         isArchived,
//         isFeatured,
//         description,
//       } = body;

//       if (!name || !price || !categoryId || !colorId || !sizeId || !images || description || !images.length) {
//         return new NextResponse('All fields are required', { status: 400 });
//       }

//       const storeByUserId = await prismadb.store.findFirst({
//         where: {
//           id: params.storeId,
//           userId
//         }
//       });
  
//       if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

//       const updatedProductData: any = {
//         name,
//         categoryId,
//         isArchived,
//         isFeatured,
//         colorId,
//         sizeId,
//         description,
//         storeId: params.storeId,
//         images: {
//           deleteMany: {},
//         }
//       };

//       if (discount !== undefined) {
//         updatedProductData.discount = discount;
//       }

//       const updatedProduct = await prismadb.product.update({
//         where: {
//           id: params.productId,
//         },
//         data: updatedProductData
//       });

//       const productWithNewImages = await prismadb.product.update({
//         where: {
//           id: params.productId,
//         },
//         data: {
//           images: {
//             createMany: {
//               data: images.map((image: { url: string }) => ({ url: image.url })),
//             },
//           },
//         }
//       });
  
//       return NextResponse.json(productWithNewImages);
//     } catch (error) {
//       console.error('[PRODUCT_PATCH] Error:', error);
//       return new NextResponse('Internal server error', { status: 500 });
//     }
//   }
  