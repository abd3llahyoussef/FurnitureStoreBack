import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel } from "../Models/User.Model.js";
import jwt from 'jsonwebtoken';
import express from "express";
import { verifyToken, authIdentify } from '../Middleware/User.Middleware.js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'src', '.env') });


const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const PAPER = process.env.PAPER || 'default_value';
const secretKey = process.env.JWT_SECRET;

const userStore = new UserModel();

const createUser = async (req, res) => {
    const { username, password, email, fk_role } = req.body;
    try {
        // Input validation
        if (!username || username.trim() === '') {
            throw new Error('Username is required');
        }
        if (!password || password.trim() === '') {
            throw new Error('Password is required');
        }
        if (!email || email.trim() === '') {
            throw new Error('Email is required');
        }
        if (!fk_role || isNaN(fk_role)) {
            throw new Error('Valid fk_role is required');
        }
        const hashedPassword = await bcrypt.hash(password + PAPER, SALT_ROUNDS);
        const newUser = await userStore.createUser({ username, password: hashedPassword, email, fk_role });
        if (!newUser) {
            throw new Error('Failed to create user');
        }

        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getUserByEmail = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Input validation
        if (!email || email.trim() === '') {
            throw new Error('Email is required');
        }
        if (!password || password.trim() === '') {
            throw new Error('Password is required');
        }
        const findUser = await userStore.getUserByEmail(email);
        if (!findUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password + PAPER, findUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = await jwt.sign({ userId: findUser.userid, role: findUser.fk_role }, secretKey, { expiresIn: '24h' });
        if (!token) {
            throw new Error('Failed to generate token');
        }
        res.status(200).json({ findUser, token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await userStore.getAllUsers();
        if (!users) {
            throw new Error('No users found');
        }
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getAllUsersWithPagination = async (req, res) => {
    try {
        const { pageNumber, pageSize } = req.body;
        const usersCount = await userStore.getAllUsers();
        const users = await userStore.getAllUsersWithPagination(req.body);
        if (!users) {
            throw new Error('No users found');
        }
        res.status(200).json({
            users, pagination: {
                pageNumber: parseInt(pageNumber),
                pageSize: parseInt(pageSize),
                totalItems: usersCount.length,
                totalPages: Math.ceil(usersCount.length / pageSize)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getSpecificUsers = async (req, res) => {
    if (!req.body.fk_role) {
        return res.status(400).json({ error: 'fk_role is required' });
    }
    try {
        const users = await userStore.getSpecificUsers({ fk_role: req.body.fk_role });
        if (!users) {
            throw new Error('No users found for the specified role');
        }
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const updateUser = async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and newPassword are required' });
    }
    try {
        const hashedPassword = await bcrypt.hashSync(newPassword + PAPER, SALT_ROUNDS);
        const updatedUser = await userStore.updateUser(email, hashedPassword);
        if (!updatedUser) {
            throw new Error('User not found or update failed');
        }
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const deleteUser = async (req, res) => {
    const { deletedEmail } = req.body;
    console.log(deletedEmail);
    if (!deletedEmail || deletedEmail.trim() === '') {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        const deletedUser = await userStore.deleteUser(deletedEmail);
        res.status(200).json(deletedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}




const userRouter = (router) => {
    router.post('/users/register', createUser);
    router.post('/users/login', getUserByEmail);
    router.post('/users', verifyToken, authIdentify, getAllUsers);
    router.post('/users/pagination', verifyToken, authIdentify, getAllUsersWithPagination);
    router.get('/users/specific', verifyToken, authIdentify, getSpecificUsers);
    router.put('/users/update', verifyToken, authIdentify, updateUser);
    router.delete('/users/delete', verifyToken, authIdentify, deleteUser);
}

export default userRouter;