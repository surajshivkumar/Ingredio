import { z } from "zod";

export const CategoryParamsSchema = z.object({
    categoryId: z.string().uuid(),
});

export const ItemParamsSchema = z.object({
    categoryId: z.string().uuid(),
    itemId: z.string().uuid(),
});

export const BarcodeParamsSchema = z.object({
    barcode: z.string().min(1),
});
