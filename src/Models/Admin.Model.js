import { client } from "../client.js";

export class AdminModel {
    async getDashboardStats() {
        const conn = await client.connect();
        try {
            const usersSql = `SELECT COUNT(*) FROM Users`;
            const productsSql = `SELECT COUNT(*) FROM Products`;
            const ordersSql = `SELECT COUNT(*) FROM Orders`;
            const revenueSql = `SELECT SUM(totalamount) FROM Orders WHERE status != 'Cancelled'`;

            const [usersResult, productsResult, ordersResult, revenueResult] = await Promise.all([
                conn.query(usersSql),
                conn.query(productsSql),
                conn.query(ordersSql),
                conn.query(revenueSql)
            ]);
            return {
                totalUsers: parseInt(usersResult.rows[0].count),
                totalProducts: parseInt(productsResult.rows[0].count),
                totalOrders: parseInt(ordersResult.rows[0].count),
                totalRevenue: parseFloat(revenueResult.rows[0].sum || 0)
            };
        } catch (err) {
            throw new Error(`Could not get dashboard stats. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getRecentOrders(limit = 5) {
        const conn = await client.connect();
        try {
            const sql = `
                SELECT o.*, u.username, u.email 
                FROM Orders o 
                JOIN Users u ON o.fk_userid = u.userid 
                ORDER BY o.orderid DESC 
                LIMIT $1
            `;
            const result = await conn.query(sql, [limit]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get recent orders. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
}
