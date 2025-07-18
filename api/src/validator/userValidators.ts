import { z } from "zod/v4";
import {
    sanitizeStringSchema,
    shippingDetailsSchema,
} from "./commonSchemas.js";

export const getUsersSchema = z.object({
    page: z
        .string()
        .regex(/^\d+$/, { error: "Page must be a number" })
        .default("1"),
    usersPerPage: z
        .string({ error: "Users per page is required" })
        .regex(/^\d+$/, { error: "Items per page must be a number" }),

    accessLevel: sanitizeStringSchema("access level").optional(),
    searchString: sanitizeStringSchema("search string", 150).optional(),
});

export const changeUsernameSchema = z.looseObject({
    newUsername: sanitizeStringSchema("new username"),
});

export const changeDisplayNameSchema = z.looseObject({
    newFirstName: sanitizeStringSchema("first name"),
    newLastName: sanitizeStringSchema("last name"),
});

export const changeLevelSchema = z.object({
    username: sanitizeStringSchema("username"),
    newAccessLevel: z.enum(["full", "limited", "view only"]),
});

export const addAddressSchema = z.object({
    address: shippingDetailsSchema,
    nickname: sanitizeStringSchema("nickname").nullable(),
});

export const editAddressSchema = z.object({
    address: shippingDetailsSchema,
    nickname: sanitizeStringSchema("nickname").nullable(),
    addressId: z.number(),
});
