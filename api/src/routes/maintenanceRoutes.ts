import { Router } from "express";
import { orderSeeder } from "../controllers/maintenanceController.js";
const maintenanceRouter = Router();

maintenanceRouter.put("/order-seeder", orderSeeder);

export default maintenanceRouter;
