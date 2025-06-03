import { Router } from "express";
import { orderSeeder } from "../controllers/maintenanceController.js";
import { sanitize } from "../middleware/sanitizeMiddleware.js";
import { orderSeederSchema } from "../validator/maintenanceValidators.js";
const maintenanceRouter = Router();

maintenanceRouter.put(
    "/order-seeder",
    sanitize(orderSeederSchema, "body"),
    orderSeeder
);

export default maintenanceRouter;
