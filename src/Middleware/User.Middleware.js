import { UserModel } from "../Models/User.Model.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'src', '.env') });

const secretKey = process.env.JWT_SECRET;
const userStore = new UserModel();

export const verifyToken = (req, res, next) => {
    const headers = req.headers.authorization;
    const token = headers.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

export const authIdentify = async (req, res, next) => {
    try {
        const user = await userStore.getUserByEmail(req.body.email);
        if (!user || user.fk_role != '1') {
            return res.status(403).json({ error: "Forbidden. Admins only." });
        }
        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}