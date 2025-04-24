import * as maintenanceService from "../services/maintenanceService.js";
import { Request, Response } from "express";

export const orderSeeder = async (req: Request, res: Response) => {
    try {
        await maintenanceService.orderSeeder();

        res.status(200);
    } catch (error) {
        let errorObj = {
            message: "order seeder failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
