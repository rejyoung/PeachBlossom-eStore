// scripts/generateFakeOrdersBulk.ts

import { faker } from "@faker-js/faker";
import { differenceInCalendarDays, startOfYear, endOfYear } from "date-fns";
import sequelize from "../models/mysql/index.js";
import { sqlAddress } from "../models/mysql/sqlAddressModel.js";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { generateOrderNo } from "../utils/generateOrderNo.js";

// Helper to pick a random date/time between two endpoints
function randomDate(start: Date, end: Date): Date {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
}

function poisson(lambda: number): number {
    const L = Math.exp(-lambda);
    let p = 1,
        k = 0;
    do {
        p *= Math.random();
        k++;
    } while (p > L);
    return k - 1;
}

const TARGETS_BY_YEAR: Record<number, number> = {
    2024: 1100,
    2025: 1300,
    2026: 1500,
    2027: 1700,
};

export const orderSeeder = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const yearlyTarget =
        TARGETS_BY_YEAR[year] ??
        TARGETS_BY_YEAR[Math.max(...Object.keys(TARGETS_BY_YEAR).map(Number))];

    // number of days in this calendar year
    const daysInYear =
        differenceInCalendarDays(endOfYear(today), startOfYear(today)) + 1;

    const λ = yearlyTarget / daysInYear;
    const countToday = poisson(λ);

    // 1. Fetch product list
    const products = (await sqlProduct.findAll({
        attributes: ["productNo", "price"],
        raw: true,
    })) as { productNo: string; price: number }[];

    // Set window to today’s date at start and end of day
    const windowStart = new Date();
    windowStart.setHours(0, 0, 0, 0);

    const windowEnd = new Date();
    windowEnd.setHours(23, 59, 59, 0);

    // 2. Prepare bulk‐insert arrays
    const addressRecords: Partial<sqlAddress>[] = [];
    const orderRecords: Partial<sqlOrder>[] = [];
    const itemRecords: (Partial<sqlOrderItem> & { orderIndex: number })[] = [];

    for (let i = 0; i < countToday; i++) {
        // — Name
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        // — Primary + optional secondary address (20% chance)
        const primary = faker.location.streetAddress();
        const secondary =
            Math.random() < 0.2 ? faker.location.secondaryAddress() : "";
        const fullAddress = secondary ? `${primary} | ${secondary}` : primary;

        // Build the Address record
        addressRecords.push({
            shippingAddress: fullAddress,
            city: faker.location.city(),
            stateAbbr: faker.location.state({ abbreviated: true }),
            zipCode: faker.location.zipCode("#####"),
            phoneNumber:
                "+1" +
                faker.phone
                    .number({ style: "national" })
                    .replace("-", " ")
                    .replace("(", " ")
                    .replace(")", ""),
            firstName,
            lastName,
        });

        // — Pick 1–5 random products
        const numItems = faker.number.int({ min: 1, max: 5 });
        const chosen = faker.helpers.arrayElements(products, numItems);

        // — Build OrderItems and compute subTotal
        let subTotal = 0;
        chosen.forEach((p) => {
            const qty = faker.number.int({ min: 1, max: 4 });
            subTotal += qty * p.price;
            itemRecords.push({
                orderIndex: i,
                productNo: p.productNo,
                quantity: qty,
                priceWhenOrdered: p.price,
                fulfillmentStatus: "unfulfilled",
            });
        });
        subTotal = parseFloat(subTotal.toFixed(2));

        // — Totals, tax, shipping, and order metadata
        const shipping = 9.99;
        const tax = parseFloat((subTotal * 0.06).toFixed(2));
        const total = parseFloat((subTotal + shipping + tax).toFixed(2));
        const orderNo = await generateOrderNo();
        const orderDt = randomDate(windowStart, windowEnd);

        orderRecords.push({
            orderNo,
            email: faker.internet.email({ firstName, lastName }),
            subTotal,
            shipping,
            tax,
            totalAmount: total,
            orderStatus: "in process",
            orderDate: orderDt,
        });
    }

    // 3. Bulk‐insert with explicit transaction
    const tx = await sequelize.transaction();
    try {
        // — Addresses
        const createdAddrs = await sqlAddress.bulkCreate(addressRecords, {
            transaction: tx,
            returning: ["address_id"],
        });
        // Map back address IDs to orders
        createdAddrs.forEach((addr, idx) => {
            orderRecords[idx].address_id = addr.address_id;
        });

        // — Orders
        const createdOrders = await sqlOrder.bulkCreate(orderRecords, {
            transaction: tx,
            returning: ["order_id"],
        });
        // Map back order IDs to items
        itemRecords.forEach((item) => {
            const ord = createdOrders[item.orderIndex];
            item.order_id = ord.getDataValue("order_id");
        });

        // — OrderItems
        const finalItems = itemRecords.map(({ orderIndex, ...rest }) => rest);
        await sqlOrderItem.bulkCreate(finalItems, {
            transaction: tx,
        });

        await tx.commit();
    } catch (error) {
        await tx.rollback();
        throw error;
    }

    console.log(`✅ Successfully generated ${countToday} orders (with items).`);
    await sequelize.close();
};
