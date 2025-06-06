import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const sanitize =
    (schema: ZodSchema, location: "body" | "query" | "params" = "query") =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate request input and update `req`
            const validatedData = schema.parse(req[location]);
            Object.assign(req[location], validatedData);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                console.error(err.errors);
                res.status(400).json({
                    message: "Validation failed",
                    errors: err.errors,
                });
                return;
            }
            next(err);
        }
    };
