import { client } from "../client.js";

export class ProductModel {
    async createProduct({ productname, description, price, quantity, fk_category, imgUrl }) {
        const conn = await client.connect();
        try {
            const sql = `INSERT INTO Products (productname,description,price,quantity,fk_category) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
            const result = await conn.query(sql, [productname, description, price, quantity, fk_category]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not create product ${productname}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getProducts() {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Products`;
            const result = await conn.query(sql);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getProductsPaginated({ pageNumber, pageSize }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Products LIMIT $1 OFFSET $2`;
            const result = await conn.query(sql, [pageSize, (pageNumber - 1) * pageSize]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products. Error: ${err}`);
        } finally {
            conn.release();
        }
    }


    async getProduct({ productid }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Products WHERE productid = $1`;
            const result = await conn.query(sql, [productid]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not get product ${productid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    async updateProduct({ productid, productname, description, price, quantity, fk_category, imgUrl }) {
        const conn = await client.connect();
        try {
            const sql = `UPDATE Products SET productname=$1,description=$2,price=$3,quantity=$4,fk_category=$5 WHERE productid=$6 RETURNING *`;
            const result = await conn.query(sql, [productname, description, price, quantity, fk_category, productid]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not update product ${productname}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    async deleteProduct({ productid }) {
        const conn = await client.connect();
        try {
            const sql = `DELETE FROM Products WHERE productid=$1 RETURNING *`;
            const result = await conn.query(sql, [productid]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not delete product ${productid}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getProductsByCategory({ fk_category }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Products WHERE fk_category=$1`;
            const result = await conn.query(sql, [fk_category]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products for category ${fk_category}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
}