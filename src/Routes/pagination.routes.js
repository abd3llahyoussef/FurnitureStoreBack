import express from 'express';
import { PaginationModel } from '../Models/Pagination.Model.js';

const router = express.Router();
const paginationModel = new PaginationModel();

/**
 * GET /pagination/products
 * Get paginated products
 * Query params: page (default 1), pageSize (default 6)
 * Example: /pagination/products?page=2&pageSize=5
 */
router.get('/products', async (req, res) => {
    try {
        const pageNumber = req.query.page || 1;
        let pageSize = req.query.pageSize || 6;
        pageSize = Math.max(1, parseInt(pageSize) || 6);
        pageSize = Math.min(6, pageSize);

        const result = await paginationModel.getPaginatedProducts(pageNumber, pageSize);

        res.status(200).json({
            success: true,
            data: result.items,
            pagination: result.pagination
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * GET /pagination/:table
 * Get paginated data from any table
 * Query params: page, pageSize, orderBy
 * Example: /pagination/Users?page=1&pageSize=20&orderBy=userId
 */
router.get('/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const pageNumber = req.query.page || 1;
        const pageSize = req.query.pageSize || 10;
        const orderBy = req.query.orderBy || 'id';

        const result = await paginationModel.getPaginatedTable(table, pageNumber, pageSize, orderBy);

        res.status(200).json({
            success: true,
            table,
            data: result.items,
            pagination: result.pagination
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;
