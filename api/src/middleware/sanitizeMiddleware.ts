import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod/v4";

export const sanitize =
    (schema: ZodType, location: "body" | "query" | "params" = "query") =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate request input and update `req`
            const validatedData = schema.parse(req[location]);
            Object.assign(req[location], validatedData);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                console.error(err.issues);
                res.status(400).json({
                    message: "Validation failed",
                    errors: err.issues,
                });
                return;
            }
            next(err);
        }
    };
