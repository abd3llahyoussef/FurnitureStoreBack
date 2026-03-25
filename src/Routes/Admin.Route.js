import { AdminModel } from "../Models/Admin.Model.js";
import express from "express";
import { verifyToken, authIdentify } from '../Middleware/User.Middleware.js';

const adminStore = new AdminModel();

const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminStore.getDashboardStats();
        if (!stats) {
            throw new Error('No stats found');
        }
        res.status(200).json(stats);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getRecentOrders = async (req, res) => {
    try {
        const orders = await adminStore.getRecentOrders();
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const adminRoute = (router) => {
    router.post('/admin/stats', verifyToken, authIdentify, getDashboardStats);
    router.post('/admin/recent-orders', verifyToken, authIdentify, getRecentOrders);
}

export default adminRoute;
