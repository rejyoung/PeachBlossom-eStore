import { z } from "zod/v4";
import {
    paginationSchema,
    productNoSchema,
    sanitizeEmailSchema,
    sanitizeStringSchema,
    shippingDetailsSchema,
} from "./commonSchemas.js";
import { ORDER_NO_LENGTH } from "../constants/constants.js";

const orderItemSchema = z.object({
    productNo: productNoSchema,
    quantity: z.number(),
    priceAtCheckout: z.number(),
});

const orderDetailsSchema = z.object({
    subTotal: z.number({ error: "Subtotal must be a number" }),
    shipping: z.number({ error: "Shipping cost must be a number" }),
    tax: z.number({ error: "Tax rate must be a number" }),
    totalAmount: z.number({ error: "Total must be a number" }),
    items: z.array(orderItemSchema),
});

export const orderDataSchema = z.object({
    cartId: z.number({ error: "CartId must be a number" }).nullable(),
    shipping: shippingDetailsSchema,
    email: sanitizeEmailSchema(),
    orderDetails: orderDetailsSchema,
});

export const placeOrderSchema = z.object({
    orderData: orderDataSchema,
    save: z.boolean({ error: "Save must be a boolean" }).optional(),
});

const updateItemSchema = z.looseObject({
    quantity: z.number({ error: "Quantity must be a number" }),
});

export const updateOrderDataSchema = z.object({
    ...shippingDetailsSchema.omit({ firstName: true, lastName: true }).shape,
    ...orderDetailsSchema.omit({ items: true }).shape,
    orderNo: sanitizeStringSchema("orderNo"),
    orderStatus: sanitizeStringSchema("order status"),
    items: z.array(updateItemSchema),
});

export const ordersFilterSchema = z.object({
    ...paginationSchema.shape,
    sort: sanitizeStringSchema("sort"),
    orderStatus: z.array(sanitizeStringSchema("order status")).optional(),
    search: sanitizeStringSchema("search", 150).optional(),
    state: z.array(sanitizeStringSchema("state abbreviation", 2)).optional(),
    customerId: z.number().optional(),
    startDate: z
        .string({ error: "Date must be in ISO format" })
        .date()
        .optional(),
    endDate: z
        .string({ error: "Date must be in ISO format" })
        .date()
        .optional(),
});

export const orderNoSchema = z.object({
    orderNo: sanitizeStringSchema("orderNo", ORDER_NO_LENGTH),
    // orderNo: z.string().nanoid(ORDER_NO_LENGTH),
});
