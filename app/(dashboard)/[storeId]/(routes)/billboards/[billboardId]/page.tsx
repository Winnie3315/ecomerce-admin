import prismadb from "@/lib/prismadb";
import BillboardsForm from "./components/BillboardsForm";

const BillboardPage = async ({
    params
}: {
    params: { billboardId: string }
}) => {
    if (!params.billboardId) {
        return <div>Error: Billboard ID is missing.</div>;
    }

    const billboard = await prismadb.billboard.findUnique({
        where: {
            id: params.billboardId,
        },
    });


    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardsForm initialData={billboard} />
            </div>
        </div>
    );
};

export default BillboardPage;
