import { client } from "../client.js";


export class UserModel {
    // Create a user entry for OAuth users (no password)
    async createUserFromGoogle({ username, email, fk_role = 4 }) {
        const conn = await client.connect();
        try {
            const sql = `INSERT INTO Users (username, password, email, fk_role) VALUES ($1, $2, $3, $4) RETURNING *`;
            const result = await conn.query(sql, [username, null, email, fk_role]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not create google user ${username}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    // Regular user creation with password
    async createUser({ username, password, email, fk_role = 4 }) {
        const conn = await client.connect();
        try {
            const sql = `INSERT INTO Users (username, password, email, fk_role) VALUES ($1, $2, $3, $4) RETURNING *`;
            const result = await conn.query(sql, [username, password, email, fk_role]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not create user ${username}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    async getUserByEmail(email) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Users WHERE email=$1`;
            const result = await conn.query(sql, [email]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not find user with email ${email}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    async getAllUsers() {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Users`;
            const result = await conn.query(sql);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getAllUsersWithPagination({ pageNumber, pageSize }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Users LIMIT $1 OFFSET $2`;
            const result = await conn.query(sql, [pageSize, (pageNumber - 1) * pageSize]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    async getSpecificUsers({ fk_role }) {
        const conn = await client.connect();
        try {
            const sql = `SELECT * FROM Users WHERE fk_role=$1`;
            const result = await conn.query(sql, [fk_role]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    async updateUser(email, newPassword) {
        const conn = await client.connect();
        try {
            const sql = `UPDATE Users SET password=$1 WHERE email=$2 RETURNING *`;
            const result = await conn.query(sql, [newPassword, email]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not update user with email ${email}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
    async deleteUser(email) {
        const conn = await client.connect();
        try {
            const sql = `DELETE FROM Users WHERE email=$1 RETURNING *`;
            const result = await conn.query(sql, [email]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not delete user with email ${email}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }
}