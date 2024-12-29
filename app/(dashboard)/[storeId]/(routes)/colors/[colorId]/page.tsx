import prismadb from "@/lib/prismadb";
import ColorsForm from "./components/ColorForm";

const ColorPage = async ({
    params
}: {
    params: { colorId: string }
}) => {
    if (!params.colorId) {
        return <div>Error: Billboard ID is missing.</div>;
    }

    const color = await prismadb.color.findUnique({
        where: {
            id: params.colorId,
        },
    });


    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorsForm initialData={color} />
            </div>
        </div>
    );
};

export default ColorPage;
