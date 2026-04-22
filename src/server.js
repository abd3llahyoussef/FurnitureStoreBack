import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { client } from './client.js'
import userRouter from './Routes/User.Route.js'
import productRoute from './Routes/Products.Route.js'
import categoryRoute from './Routes/Category.Route.js'
import ordersRoute from './Routes/Orders.Route.js'
import ordersProductsRoute from './Routes/OrdersProducts.Route.js'
import router from './Routes/pagination.routes.js'
import authRouter from './Routes/Auth.Route.js'
import adminRoute from './Routes/Admin.Route.js'
import payRouter from './Routes/Pay.Route.js'
import session from 'express-session'
import passport from './passport.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Sessions + Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using https
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes (Google OAuth)
authRouter(app);

//Routers
userRouter(app);
productRoute(app);
categoryRoute(app);
ordersRoute(app);
ordersProductsRoute(app);
adminRoute(app);
payRouter(app);

app.use('/api/pagination', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    client.connect();
    console.log('Connected to the database');
})


// Passport is configured in src/passport.js