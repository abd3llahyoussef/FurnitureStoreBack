import { client } from "../client.js";

export class PaginationModel {
    /**
     * Get total count of items in a table
     * @param {string} table - Table name
     * @returns {Promise<number>} Total count
     */
    async getTotalCount(table) {
        const conn = await client.connect();
        try {
            const sql = `SELECT COUNT(*)::int AS cnt FROM ${table}`;
            const result = await conn.query(sql);
            return result.rows[0].cnt;
        } catch (err) {
            throw new Error(`Could not get total count from ${table}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    /**
     * Get paginated items from a table
     * @param {string} table - Table name
     * @param {number} pageNumber - Page number (1-indexed)
     * @param {number} pageSize - Items per page
     * @param {string} orderBy - Column to order by (default: id or primary key)
     * @returns {Promise<Array>} Paginated items
     */
    async getPaginatedItems(table, pageNumber = 1, pageSize = 10, orderBy = 'id') {
        const conn = await client.connect();
        try {
            const offset = (pageNumber - 1) * pageSize;
            const sql = `SELECT * FROM ${table} ORDER BY ${orderBy} LIMIT $1 OFFSET $2`;
            const result = await conn.query(sql, [pageSize, offset]);
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get paginated items from ${table}. Error: ${err}`);
        } finally {
            conn.release();
        }
    }


    async savePaginationStats(pageNumber, pageSize, totalItems, totalPages) {
        const conn = await client.connect();
        try {
            const sql = `
                INSERT INTO Pagination (pageNumber, pageSize, totalItems, totalPages, CreatedAt, UpdatedAt)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *
            `;
            const result = await conn.query(sql, [pageNumber, pageSize, totalItems, totalPages]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not save pagination stats. Error: ${err}`);
        } finally {
            conn.release();
        }
    }

    /**
     * Get paginated products with full pagination metadata
     * @param {number} pageNumber - Page number (default: 1)
     * @param {number} pageSize - Items per page (default: 10)
     * @returns {Promise<Object>} { items, pagination { pageNumber, pageSize, totalItems, totalPages } }
     */
    async getPaginatedProducts(pageNumber = 1, pageSize = 6) {
        try {
            // Validate inputs
            pageNumber = Math.max(1, parseInt(pageNumber) || 1);
            pageSize = Math.max(1, parseInt(pageSize) || 6);
            // Enforce maximum limit of 6 rows for products pagination
            pageSize = Math.min(6, pageSize);

            // Get total items
            const totalItems = await this.getTotalCount('Products');
            const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

            // Adjust page if out of range
            if (pageNumber > totalPages) {
                pageNumber = totalPages;
            }

            // Get paginated items
            const items = await this.getPaginatedItems('Products', pageNumber, pageSize, 'productId');

            // Save pagination stats
            await this.savePaginationStats(pageNumber, pageSize, totalItems, totalPages);

            return {
                items,
                pagination: {
                    pageNumber,
                    pageSize,
                    totalItems,
                    totalPages
                }
            };
        } catch (err) {
            throw new Error(`Could not get paginated products. Error: ${err}`);
        }
    }


    async getPaginatedTable(table, pageNumber = 1, pageSize = 10, orderBy = 'id') {
        try {
            pageNumber = Math.max(1, parseInt(pageNumber) || 1);
            pageSize = Math.max(1, parseInt(pageSize) || 10);

            const totalItems = await this.getTotalCount(table);
            const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

            if (pageNumber > totalPages) {
                pageNumber = totalPages;
            }

            const items = await this.getPaginatedItems(table, pageNumber, pageSize, orderBy);
            await this.savePaginationStats(pageNumber, pageSize, totalItems, totalPages);

            return {
                items,
                pagination: {
                    pageNumber,
                    pageSize,
                    totalItems,
                    totalPages
                }
            };
        } catch (err) {
            throw new Error(`Could not get paginated data from ${table}. Error: ${err}`);
        }
    }
}