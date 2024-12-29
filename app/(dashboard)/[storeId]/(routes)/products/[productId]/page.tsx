import prismadb from "@/lib/prismadb";
import ProductsForm from "./components/ProductsForm";

const ProductPage = async ({
    params
}: {
    params: { productId: string, storeId: string }
}) => {
    if (!params.productId) {
        return <div>Error: Billboard ID is missing.</div>;
    }

    const product = await prismadb.product.findUnique({
        where: {
            id: params.productId,
        },
        include: {
          images: true,
      },
    });

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId
      }
    })
    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId
      }
    })
    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId
      }
    })


    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductsForm
                  initialData={product ?? undefined}
                  categories={categories}
                  sizes={sizes}
                  colors={colors}
                />
            </div>
        </div>
    );
};

export default ProductPage;
