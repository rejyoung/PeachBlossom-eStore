import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    HasMany,
    BelongsTo,
    Index,
    Unique,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlCartItem } from "./sqlCartItemModel.js";

@Table({
    tableName: "Carts",
    timestamps: false,
})
export class sqlCart extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare cart_id: number;

    @Unique
    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    declare customer_id?: number;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare checkoutExpiration: Date;

    @HasMany(() => sqlCartItem, { as: "CartItem", foreignKey: "cart_id" })
    declare cartItems: sqlCartItem[];

    @BelongsTo(() => sqlCustomer, {
        as: "Customer",
        foreignKey: "customer_id",
        targetKey: "customer_id",
    })
    declare customer?: sqlCustomer;
}
