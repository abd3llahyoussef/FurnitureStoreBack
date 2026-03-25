import { client } from "../client.js";

export class OrdersProductsModel {
    async addProductToOrder({ orderid, productId, quantity, price }) {
        const conn = await client.connect();
        try {
            const sql = `INSERT INTO Orders_Products (fk_orderId,fk_productId,quantity,price) VALUES ($1,$2,$3,$4) RETURNING *`;
            const result = await conn.query(sql, [orderid, productId, quantity, price]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not add product ${productId} to order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getProductsByOrder({ orderid }) {
        const conn = await client.connect();
        try {
            const sql = `
                SELECT op.*, p.productname 
                FROM orders_products op
                INNER JOIN products p ON op.fk_productId = p.productid
                WHERE op.fk_orderId = $1
            `;
            const result = await conn.query(sql, [orderid]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products for order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrdersByProduct({ productId }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Orders_Products WHERE fk_productId=$1`;
            const result = await conn.query(sql, [productId]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get orders for product ${productId}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }


    async removeProductFromOrder({ orderid, productId }) {
        const conn = await client.connect();
        try {
            const sql = `DELETE FROM Orders_Products WHERE fk_orderId=$1 AND fk_productId=$2 RETURNING *`;
            const result = await conn.query(sql, [orderid, productId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not remove product ${productId} from order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async updateProductOrder({ orderid, productId, quantity, price }) {
        const conn = await client.connect();
        try {
            const sql = `UPDATE Orders_Products SET quantity=$1, price=$2 WHERE fk_orderId=$3 AND fk_productId=$4 RETURNING *`;
            const result = await conn.query(sql, [quantity, price, orderid, productId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not update product ${productId} in order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

}