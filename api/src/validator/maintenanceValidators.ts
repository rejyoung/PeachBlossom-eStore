import { z } from "zod";
import { dateStringSchema } from "./commonSchemas.js";

export const orderSeederSchema = z.object({
    startDate: dateStringSchema.optional(),
});
