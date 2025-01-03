"use client"

import * as z from "zod"
import { Size } from '@prisma/client';
import React, { useState } from 'react';
import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";

interface SizesFormProps {
    initialData: Size | null
}

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1)
})
type SizesFormValues = z.infer<typeof formSchema>

const SizeForm: React.FC<SizesFormProps> = ({ initialData }) => {
    const params = useParams()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const title = initialData ? "Edit size" : "Create size"
    const description = initialData ? "Edit a size" : "Add a new size"
    const toastMessage = initialData ? "Size updated" : "Size created"
    const action = initialData ? "Save changes" : "Create"

    const form = useForm<SizesFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: ""
        }
    })

    const onSubmit = async (data: SizesFormValues) => {
        try {
            setLoading(true)
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data)
            } else {
                await axios.post(`/api/${params.storeId}/sizes`, data)
            }

            router.refresh()
            router.push(`/${params.storeId}/sizes`)
            toast.success(toastMessage)
        } catch {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }
    const onDelete = async () => {
        try {
            setLoading(true)

            await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`)
            router.refresh()
            toast.success("Size deleted")
            router.push(`/${params.storeId}/sizes`)
        } catch {
            toast.error("Make sure you removed all product first.")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className='flex items-center justify-between'>
                <Heading title={title} description={description} />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size={"icon"}
                        onClick={() => setOpen(true)}
                    >
                        <Trash className='h-4 w-4' />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">

                    <div className="grid grid-cols-3 gap-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input className="" disabled={loading} placeholder="Size name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="value" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Value
                                </FormLabel>
                                <FormControl>
                                    <Input className="" disabled={loading} placeholder="Size value" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};

export default SizeForm;