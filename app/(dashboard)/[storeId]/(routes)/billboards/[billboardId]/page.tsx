import prismadb from "@/lib/prismadb";
import BillboardsForm from "./components/BillboardsForm";

interface BillboardPageProps {
  params: { billboardId: string };
}

const BillboardPage = async ({ params }: BillboardPageProps) => {
  const { billboardId } = params;

  if (!billboardId) {
    return <div>Error: Billboard ID is missing.</div>;
  }

  const billboard = await prismadb.billboard.findUnique({
    where: {
      id: billboardId,
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
