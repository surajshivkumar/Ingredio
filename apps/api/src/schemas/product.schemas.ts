import { z } from "zod";

export const CategoryParamsSchema = z.object({
    categoryId: z.string().uuid(),
});

export const ItemParamsSchema = z.object({
    categoryId: z.string().uuid(),
    itemId: z.string().uuid(),
});

export const PaginationQuerySchema = z.object({
    cursor: z.string().uuid().optional(),
});
