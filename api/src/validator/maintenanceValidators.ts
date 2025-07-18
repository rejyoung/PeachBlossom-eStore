import { z } from "zod/v4";
import { dateStringSchema } from "./commonSchemas.js";

export const orderSeederSchema = z.object({
    startDate: dateStringSchema.optional(),
});
