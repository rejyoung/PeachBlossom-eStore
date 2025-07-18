import { z } from "zod/v4";
import { sanitizeEmailSchema, sanitizeStringSchema } from "./commonSchemas.js";

export const createUserSchema = z.looseObject({
    username: sanitizeStringSchema("username"),
    role: z.enum(["customer", "admin"]),
    accessLevel: z.enum(["full", "limited"]).optional(),
    email: sanitizeEmailSchema().optional(),
    defaultPassword: z.boolean().optional(),
    firstName: sanitizeStringSchema("first name").optional(),
    lastName: sanitizeStringSchema("last name").optional(),
});

export const loginSchema = z.looseObject({
    username: sanitizeStringSchema("username"),
});
