import { z } from "zod/v4";
import { productNoSchema } from "./commonSchemas.js";
import { adminProductFilterSchema } from "./productValidators.js";

export const adjustHoldSchema = z.object({
    adjustment: z.number({ error: "Adjustment must be a number" }),
    productNo: productNoSchema,
    cartId: z.number({ error: "Invalid cart id format" }),
});

export const stockUpdateSchema = z.object({
    filters: adminProductFilterSchema,
    updateData: z.record(z.string(), z.number()),
});
