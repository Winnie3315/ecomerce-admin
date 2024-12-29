import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "@/providers/theme-provider";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootLayout({ children, params }: { children: React.ReactNode, params: { storeId: string } }) {
    // Ожидаем данных params
    const { storeId } = await params; // Добавляем ожидание для params

    const { userId } = await auth();

    if (!userId) redirect("/sign-in");

    const store = await prismadb.store.findFirst({
        where: {
            id: storeId,
            userId
        }
    });

    if (!store) redirect("/");

    return (
        <>
                <Navbar />
                {children}
        </>
    );
}
