import { client } from "../client.js";

export class OrdersModel {
    async createOrder({ status, totalAmount, userId }) {
        const conn = await client.connect();

        try {
            const sql = `INSERT INTO Orders (status,totalamount,fk_userid) VALUES ($1,$2,$3) RETURNING *`;
            const result = await conn.query(sql, [status, totalAmount, userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not create order. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrders() {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Orders`;
            const result = await conn.query(sql);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get orders. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrdersPaginated(pageNumber, pageSize) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Orders LIMIT $1 OFFSET $2`;
            const result = await conn.query(sql, [pageSize, pageNumber]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get orders. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrder({ orderid }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Orders WHERE orderid=$1`;
            const result = await conn.query(sql, [orderid]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not get order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async updateOrder({ orderid, status, totalamount, fk_userId }) {
        const conn = await client.connect();
        try {
            const sql = `UPDATE Orders SET status=$1,totalAmount=$2,fk_userId=$3 WHERE orderid=$4 RETURNING *`;
            const result = await conn.query(sql, [status, totalamount, fk_userId, orderid]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not update order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async deleteOrder({ orderid }) {
        const conn = await client.connect();
        try {
            const sql = `DELETE FROM Orders WHERE orderid=$1 RETURNING *`;
            const result = await conn.query(sql, [orderid]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not delete order ${orderid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrdersByUser({ fk_userId }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT o.*, u.username FROM Orders o INNER JOIN users u ON u.userid = o.fk_userId  WHERE fk_userId=$1`;
            const result = await conn.query(sql, [fk_userId]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get orders for user ${fk_userId}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrdersByUserPagination({ fk_userId, pageNumber, pageSize }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT o.*, u.username FROM Orders o INNER JOIN users u ON u.userid = o.fk_userId  WHERE fk_userId=$1 LIMIT $2 OFFSET $3`;
            const result = await conn.query(sql, [fk_userId, pageSize, (pageNumber - 1) * pageSize]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get orders for user ${fk_userId}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getOrderByUser({ orderid, fk_userId }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Orders WHERE orderid=$1 AND fk_userId=$2`;
            const result = await conn.query(sql, [orderid, fk_userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not get order ${orderid} for user ${fk_userId}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
}