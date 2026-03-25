# 🔍 Furniture Store Backend - Code Review & Rating

## Overall Rating: **6.5/10**
**Status:** Good foundation with significant security & architecture improvements needed

---

## ✅ STRENGTHS

### 1. **Database Schema Design** (Good)
- Well-structured migrations with proper table relationships
- Enum types for status fields (OrderStatus, RoleEnum)
- Timestamps for audit trail (CreatedAt, UpdatedAt)
- Foreign key relationships established

### 2. **Authentication Setup** (Good)
- JWT-based authentication implemented
- Password hashing with bcrypt
- Role-based access control (Admin/Manager/Employee/Customer)
- Middleware separation for auth logic

### 3. **Project Structure** (Good)
- Clean folder organization (Models, Routes, Middleware)
- Separate data models from route handlers
- Environment configuration setup

### 4. **Pagination Implementation** (Excellent)
- Complete pagination system with metadata tracking
- Generic paginated table fetching
- Reusable helper methods
- Well-documented with examples

---

## ⚠️ CRITICAL ISSUES (Must Fix)

### 1. **No Connection Release in Models** (🔴 CRITICAL)
```javascript
// ❌ BAD - Connection leaks!
async getProducts(){
    const conn = await client.connect();
    try{
        const sql = `SELECT * FROM Products`;
        const result = await conn.query(sql);
        return result.rows[0]; // ← Only returns first row!
    }catch(err){
        throw new Error(`Could not get products. Error: ${err}`);
    }
    // ❌ No conn.release() - memory leak!
}

// ✅ CORRECT
async getProducts(){
    const conn = await client.connect();
    try{
        const sql = `SELECT * FROM Products`;
        const result = await conn.query(sql);
        return result.rows; // ← Return all rows
    }catch(err){
        throw new Error(`Could not get products. Error: ${err}`);
    }finally{
        conn.release(); // ✅ Always release
    }
}
```
**Impact:** Your server will run out of connections after ~10 requests
**Found in:** All models (ProductModel, UserModel, OrdersModel, etc.)

### 2. **Plaintext Password Security** (🔴 CRITICAL)
```javascript
// ❌ BAD - Hashing with salt
const hashedPassword = await bcrypt.hashSync(password + PAPER, SALT_ROUNDS);

// ✅ CORRECT - bcrypt manages salt internally
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```
**Impact:** Your custom salt scheme weakens security; bcrypt's salt is superior
**In:** User.Route.js, line 18 & 35

### 3. **Missing Password Verification** (🔴 CRITICAL)
```javascript
// ❌ NO LOGIN VERIFICATION!
const getUserByEmail = async(req,res)=>{
    const{email} = req.body;
    try{
        const findUser = await userStore.getUserByEmail(email);
        const token = await jwt.sign({findUser},secretKey); // ← Issues token without password check!
        res.status(200).json({findUser,token});
    }
}

// ✅ CORRECT
const getUserByEmail = async(req,res)=>{
    const{email, password} = req.body;
    try{
        const user = await userStore.getUserByEmail(email);
        if(!user) return res.status(401).json({error: "Invalid credentials"});
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) return res.status(401).json({error: "Invalid credentials"});
        
        const token = jwt.sign({userId: user.userid, role: user.fk_role}, secretKey);
        res.status(200).json({user, token});
    }catch(err){
        res.status(400).json({error: err.message});
    }
}
```
**Impact:** Anyone with an email can get a token without password!

### 4. **SQL Injection Risk** (🔴 HIGH)
Models don't validate input types - but since using parameterized queries ($1, $2), risk is mitigated.
However, dynamic table names in pagination are vulnerable:
```javascript
// ⚠️ Risky - unsanitized table name
const sql = `SELECT * FROM ${table}`;

// ✅ Better - whitelist allowed tables
const allowedTables = ['Products', 'Users', 'Orders'];
if(!allowedTables.includes(table)) throw new Error("Invalid table");
```

### 5. **Token Payload Too Large** (🔴 MEDIUM)
```javascript
// ❌ BAD - Storing entire user object in token
const token = await jwt.sign({findUser}, secretKey);

// ✅ CORRECT - Only store minimal info
const token = jwt.sign({userId: user.userid, role: user.fk_role}, secretKey, {expiresIn: '24h'});
```
**Issue:** Tokens become too large; user data changes aren't reflected

### 6. **No Input Validation** (🔴 MEDIUM)
```javascript
// ❌ No validation
const createProduct = async(req,res)=>{
    const{productname,description,price,quantity,fk_category,imgUrl} = req.body;
    // Missing: Check if price > 0, productname not empty, etc.
}

// ✅ Use validation library
import { body, validationResult } from 'express-validator';

router.post('/products/create', [
    body('productname').notEmpty().trim().escape(),
    body('price').isFloat({min: 0}),
    body('quantity').isInt({min: 0})
], createProduct);
```

---

## 🔴 MAJOR ISSUES

### 7. **Wrong HTTP Methods** (🔴 HIGH)
```javascript
// ❌ BAD - GET requests should not modify data
router.get('/products/all', verifyToken, getProducts); // ✅ Correct
router.post('/products/specific', verifyToken, getProduct); // ❌ Should be GET

// ✅ CORRECT
router.get('/products/:productid', verifyToken, getProduct);
router.get('/products/by-category/:categoryid', verifyToken, getProductsByCategory);
```
**Why:** GET should be idempotent; use POST/PUT/DELETE only for mutations

### 8. **Inconsistent Error Handling** (🔴 MEDIUM)
```javascript
// ❌ No try-catch in routes
const createUser = async(req,res)=>{
    console.log(req.body);
    const {username,password,email,fk_role} = req.body;
    // If userStore fails, request hangs
}

// ✅ Every route needs error handling
try{
    // logic
}catch(err){
    res.status(500).json({error: "Internal server error"});
}
```

### 9. **No Null Checks on Query Results** (🔴 MEDIUM)
```javascript
// ❌ May return undefined
return result.rows[0];

// ✅ Check first
if(!result.rows || result.rows.length === 0) return null;
return result.rows[0];
```

### 10. **Missing Logging** (🟡 MEDIUM)
Only `console.log` used. Need proper logging:
```javascript
// ✅ Add logging library
import winston from 'winston';
const logger = winston.createLogger({...});
logger.info(`Product created: ${productid}`);
logger.error(`Database error: ${err.message}`);
```

---

## 🟡 ARCHITECTURAL ISSUES

### 11. **No API Response Standardization**
```javascript
// ❌ Inconsistent responses
res.status(201).json(newProduct); // Just the data
res.status(200).json({findUser,token}); // Object with properties
res.status(400).json({error: err.message}); // Error structure

// ✅ Standard format
res.json({
    success: true,
    message: "Product created",
    data: newProduct
});

res.status(400).json({
    success: false,
    message: "Invalid input",
    errors: []
});
```

### 12. **No Rate Limiting**
```javascript
// ✅ Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/api/', limiter);
```

### 13. **No Request Validation Middleware**
All routes assume `req.body` is valid. Add middleware:
```javascript
// ✅ Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});
```

### 14. **No CORS Whitelist**
```javascript
// ❌ Current
app.use(cors());

// ✅ Better
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
}));
```

### 15. **Missing Environment Variables**
`.env` file should have:
```
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=***
POSTGRES_DATABASE=furniture_store
POSTGRES_PORT=5432
SALT_ROUNDS=10
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

---

## 🟢 MINOR IMPROVEMENTS

### 16. **Database Connection Pooling** (Good, but...)
```javascript
// ✅ You're using Pool which is good
// But set limits in .env
export const client = new Pool({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    port: POSTGRES_PORT,
    max: 20, // ← Max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

### 17. **Missing API Documentation**
Add Swagger/OpenAPI docs:
```javascript
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

### 18. **No Async/Await Consistency**
```javascript
// ❌ Mixing callbacks and async/await
const hashedPassword = await bcrypt.hashSync(...); // ← hashSync is synchronous!

// ✅ Use async version
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

### 19. **Hardcoded PAPER Salt** (Security)
```javascript
const PAPER = process.env.PAPER || 'default_value';
// ❌ This weakens bcrypt
// Remove this - bcrypt handles salt internally
```

### 20. **Role Comparison String vs Int**
```javascript
// ❌ Inconsistent comparison
if(!user || user.fk_role != '1'){ // String comparison

// ✅ Be consistent
if(!user || user.fk_role !== 1){ // Number
```

---

## 📋 QUICK FIX CHECKLIST

### Critical (Fix immediately):
- [ ] Add `conn.release()` to all model methods
- [ ] Implement password verification in login
- [ ] Use `bcrypt.hash()` instead of `bcrypt.hashSync()`
- [ ] Add try-catch to all route handlers
- [ ] Validate all user inputs

### High Priority (This week):
- [ ] Fix HTTP methods (GET for reads, POST/PUT/DELETE for mutations)
- [ ] Add response standardization
- [ ] Implement rate limiting
- [ ] Add comprehensive error handling
- [ ] Add API documentation

### Medium Priority (This month):
- [ ] Add input validation library (express-validator)
- [ ] Implement logging (winston)
- [ ] Add request/response logging middleware
- [ ] Setup database transaction handling
- [ ] Add unit tests for critical paths

### Nice to Have:
- [ ] API documentation (Swagger)
- [ ] Performance monitoring
- [ ] Caching layer (Redis)
- [ ] Background job queue (Bull)

---

## 💡 REFACTORED EXAMPLE

### Before (Current):
```javascript
export class ProductModel {
    async createProduct({productname,description,price,quantity,fk_category,imgUrl}){
        const conn = await client.connect();
        try{
            const sql = `INSERT INTO Products (...) VALUES (...) RETURNING *`;
            const result = await conn.query(sql,[...]);
            return result.rows[0];
        }catch(err){
            throw new Error(`Could not create product ${productname}. Error: ${err}`);
        }
    }
}
```

### After (Improved):
```javascript
export class ProductModel {
    async createProduct({ productname, description, price, quantity, fk_category, imgUrl }) {
        // Input validation
        if (!productname || productname.trim() === '') {
            throw new Error('Product name is required');
        }
        if (price < 0) {
            throw new Error('Price cannot be negative');
        }

        const conn = await client.connect();
        try {
            const sql = `
                INSERT INTO Products (productname, description, price, quantity, fk_category, imgUrl)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await conn.query(sql, [productname, description, price, quantity, fk_category, imgUrl]);
            
            if (!result.rows || result.rows.length === 0) {
                throw new Error('Failed to create product');
            }
            
            return result.rows[0];
        } catch (err) {
            logger.error(`Failed to create product: ${err.message}`);
            throw new Error(`Could not create product. Error: ${err.message}`);
        } finally {
            conn.release();
        }
    }
}
```

---

## 📊 Summary

| Aspect | Rating | Status |
|--------|--------|--------|
| Database Design | 8/10 | Good |
| Authentication | 5/10 | Broken (no password verify) |
| Error Handling | 4/10 | Minimal |
| Code Quality | 6/10 | Needs cleanup |
| Security | 3/10 | Multiple critical issues |
| API Design | 5/10 | Wrong HTTP methods |
| Documentation | 2/10 | None |
| Testing | 0/10 | None |
| **OVERALL** | **6.5/10** | **Needs major improvements** |

---

## 🚀 NEXT STEPS

1. **Week 1:** Fix all CRITICAL issues (connection leaks, password verification, input validation)
2. **Week 2:** Fix HTTP methods, standardize responses, add error handling
3. **Week 3:** Add rate limiting, logging, API docs
4. **Week 4:** Add unit tests, security review, performance testing

Your backend has a solid foundation but needs hardening before production use. The pagination system you just built is excellent—apply that same quality to the rest of the code!
