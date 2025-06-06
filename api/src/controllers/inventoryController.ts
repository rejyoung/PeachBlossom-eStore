import * as inventoryService from "../services/inventoryService.js";
import { Request, Response } from "express";
import {
    AdjustHoldQuantityRequest,
    CartIdRequest,
    StockUpdateRequest,
} from "./_controllerTypes.js";

export const holdStock = async (req: CartIdRequest, res: Response) => {
    try {
        const { cartId } = req.body;
        const response = await inventoryService.holdStock(cartId);

        res.json({
            message: "success",
            payload: response,
        });
    } catch (error) {
        let errorObj = {
            message: "hold stock failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const adjustHoldQuantity = async (
    req: AdjustHoldQuantityRequest,
    res: Response
) => {
    try {
        const { cartId, productNo, adjustment } = req.body;
        const response = await inventoryService.adjustHoldQuantity(
            productNo,
            cartId,
            adjustment
        );

        res.json({
            message: "successfully completed operation",
            payload: response,
        });
    } catch (error) {
        let errorObj = {
            message: "adjust hold quantity failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const extendHold = async (req: CartIdRequest, res: Response) => {
    try {
        const { cartId } = req.body;
        const expirationTime = await inventoryService.extendHold(cartId);

        res.json({
            message: "success",
            payload: expirationTime,
        });
    } catch (error) {
        let errorObj = {
            message: "hold stock failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const updateStockLevels = async (
    req: StockUpdateRequest,
    res: Response
) => {
    try {
        const { updateData, filters } = req.body;
        const result = await inventoryService.updateStockLevels(
            updateData,
            filters
        );

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "update stock levels failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const syncStockLevels = async (req: Request, res: Response) => {
    try {
        const result = await inventoryService.syncStockLevels();

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "sync stock failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
