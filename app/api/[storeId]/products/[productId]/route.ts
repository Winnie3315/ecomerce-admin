import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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


// export async function PATCH(
//     req: Request,
//     { params }: { params: { storeId: string, productId: string } }
// ) {
//     try {
//         const { userId } = await auth();
//         const body = await req.json();

//         const { name, price, categoryId, sizeId, colorId, images, isArchived, isFeatured } = body;

//         if (!userId) return new NextResponse('Unauthorized', { status: 401 });

//         if (!name) return new NextResponse('Name is required', { status: 400 });
//         if (!price) return new NextResponse('Price is required', { status: 400 });
//         if (!categoryId) return new NextResponse('Categpry id is required', { status: 400 });
//         if (!colorId) return new NextResponse('Color id is required', { status: 400 });
//         if (!sizeId) return new NextResponse('Size id is required', { status: 400 });
//         if (!images || !images.length) return new NextResponse('Images are required', { status: 400 });

//         if (!params.productId) return new NextResponse("Billboard id is required", { status: 400 })

//         const storeByUserId = await prismadb.store.findFirst({
//             where: {
//                 id: params.storeId,
//                 userId
//             }
//         })

//         if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 })

//         await prismadb.product.update({
//             where: {
//                 id: params.productId,
//             },
//             data: {
//                 name,
//                 price,
//                 categoryId,
//                 isArchived,
//                 isFeatured,
//                 colorId,
//                 sizeId,
//                 storeId: params.storeId,
//                 images: {
//                   deleteMany: {}
//                 }
//               }
//         })

//         const product = await prismadb.product.update({
//             where: {
//                 id: params.productId
//             },
//             data: {
//                 images: {
//                     createMany: {
//                         data: [
//                             ...images.map((image: {url: string}) => image)
//                         ]
//                     }
//                 }
//             }
//         })

//         return NextResponse.json(product)
//     } catch (error) {
//         console.error('[PRODUCT_PATCH]', error);
//         return new NextResponse('Internal error', { status: 500 });
//     }
// }


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



export async function PATCH(req: Request, { params }: { params: { storeId: string, productId: string } }) {
    try {
      const { userId } = await auth();
      if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  
      const body = await req.json();
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

      const updatedProductData: any = {
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
        }
      };

      if (discount !== undefined) {
        updatedProductData.discount = discount;
      }

      const updatedProduct = await prismadb.product.update({
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
  