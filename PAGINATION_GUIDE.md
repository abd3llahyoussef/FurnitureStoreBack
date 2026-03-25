# Pagination Implementation Guide

## Database Schema
The `Pagination` table stores pagination metadata:
```sql
CREATE TABLE Pagination (
    pageId SERIAL PRIMARY KEY,
    pageNumber INT NOT NULL,
    pageSize INT NOT NULL,
    totalItems INT NOT NULL,
    totalPages INT NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## PaginationModel Methods

### 1. `getTotalCount(table)`
Get total count of items in a table.
```javascript
const totalItems = await paginationModel.getTotalCount('Products');
```

### 2. `getPaginatedItems(table, pageNumber, pageSize, orderBy)`
Fetch paginated items from a table.
```javascript
const items = await paginationModel.getPaginatedItems('Products', 2, 10, 'productId');
```

### 3. `savePaginationStats(pageNumber, pageSize, totalItems, totalPages)`
Save pagination metadata to the Pagination table.
```javascript
const stats = await paginationModel.savePaginationStats(2, 10, 50, 5);
```

### 4. `getPaginatedProducts(pageNumber, pageSize)`
Get paginated Products with full metadata. **Most convenient method.**
```javascript
const result = await paginationModel.getPaginatedProducts(1, 10);
// Returns:
// {
//   items: [...],
//   pagination: {
//     pageNumber: 1,
//     pageSize: 10,
//     totalItems: 50,
//     totalPages: 5
//   }
// }
```

### 5. `getPaginatedTable(table, pageNumber, pageSize, orderBy)`
Generic method for any table.
```javascript
const result = await paginationModel.getPaginatedTable('Users', 1, 20, 'userId');
```

---

## Express Route Usage

### Setup in server.js
```javascript
import express from 'express';
import paginationRoutes from './Routes/pagination.routes.js';

const app = express();
app.use('/api/pagination', paginationRoutes);
```

### API Endpoints

#### Get Paginated Products
```
GET /api/pagination/products?page=2&pageSize=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "productId": 11, "productName": "Chair", "price": 199.99, ... },
    { "productId": 12, "productName": "Table", "price": 599.99, ... }
  ],
  "pagination": {
    "pageNumber": 2,
    "pageSize": 10,
    "totalItems": 45,
    "totalPages": 5
  }
}
```

#### Get Paginated Data from Any Table
```
GET /api/pagination/Users?page=1&pageSize=20&orderBy=userId
```

**Response:**
```json
{
  "success": true,
  "table": "Users",
  "data": [ ... ],
  "pagination": {
    "pageNumber": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

---

## Usage Examples

### Example 1: Controller Method
```javascript
import { PaginationModel } from '../Models/Pagination.Model.js';

export class ProductController {
    static async getProducts(req, res) {
        try {
            const paginationModel = new PaginationModel();
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;

            const result = await paginationModel.getPaginatedProducts(page, limit);

            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
```

### Example 2: Service Layer
```javascript
import { PaginationModel } from '../Models/Pagination.Model.js';

export class ProductService {
    constructor() {
        this.paginationModel = new PaginationModel();
    }

    async fetchProducts(page, pageSize) {
        return await this.paginationModel.getPaginatedProducts(page, pageSize);
    }

    async fetchUsers(page, pageSize) {
        return await this.paginationModel.getPaginatedTable('Users', page, pageSize, 'userId');
    }
}
```

### Example 3: Frontend (fetch from API)
```javascript
async function getProducts(page = 1, pageSize = 10) {
    const response = await fetch(
        `/api/pagination/products?page=${page}&pageSize=${pageSize}`
    );
    const data = await response.json();
    
    console.log('Items:', data.data);
    console.log('Page:', data.pagination.pageNumber);
    console.log('Total Pages:', data.pagination.totalPages);
    
    return data;
}

// Usage
const result = await getProducts(2, 10);
```

---

## Notes

1. **Connection Handling:** All methods use connection pooling (`client.connect()`). Connections are automatically released.
2. **Pagination Stats:** Each pagination request saves metadata to the `Pagination` table for audit/analytics.
3. **Default Values:** If page or pageSize are invalid, they default to page 1 and pageSize 10.
4. **Page Bounds:** If requested page exceeds totalPages, it's adjusted to the last page.
5. **Order Column:** Specify any column name for ordering (default: 'id', 'productId', 'userId', etc.).

---

## cURL Examples

```bash
# Get page 1 of products (10 items per page)
curl "http://localhost:3000/api/pagination/products?page=1&pageSize=10"

# Get page 2 of users with 20 items per page
curl "http://localhost:3000/api/pagination/Users?page=2&pageSize=20&orderBy=userId"

# Get page 3 of categories
curl "http://localhost:3000/api/pagination/Category?page=3&pageSize=15"
```
