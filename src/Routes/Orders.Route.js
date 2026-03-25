import { OrdersModel } from "../Models/Orders.Model.js";
import express from "express";
import { verifyToken, authIdentify } from '../Middleware/User.Middleware.js';

const ordersStore = new OrdersModel();

const createOrder = async (req, res) => {
    const { totalAmount, status } = req.body;
    const userId = req.user.userId;
    // Input validation
    if (totalAmount < 0) {
        return res.status(400).json({ error: 'Valid totalamount is required' });
    }
    if (!status || status.trim() === '') {
        return res.status(400).json({ error: 'status is required' });
    }
    if (!userId && isNaN(userId)) {
        return res.status(400).json({ error: 'fk_user is required' });
    }
    try {
        const newOrder = await ordersStore.createOrder({ totalAmount, status, userId });
        if (!newOrder) {
            throw new Error('Failed to create order');
        }
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getOrders = async (req, res) => {
    try {
        const ordersCount = await ordersStore.getOrders();
        const orders = await ordersStore.getOrders();
        if (!orders) {
            throw new Error('No orders found');
        }
        res.status(200).json({
            orders,
            pagination: {
                pageNumber: parseInt(pageNumber),
                pageSize: parseInt(pageSize),
                totalItems: ordersCount.length,
                totalPages: Math.ceil(ordersCount.length / pageSize)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getOrdersPaginated = async (req, res) => {
    const pageNumber = req.body.pageNumber;
    const pageSize = req.body.pageSize;
    try {
        const ordersCount = await ordersStore.getOrders();
        const orders = await ordersStore.getOrdersPaginated(pageNumber, pageSize);
        if (!orders) {
            throw new Error('No orders found');
        }
        res.status(200).json({
            orders,
            pagination: {
                pageNumber: parseInt(pageNumber),
                pageSize: parseInt(pageSize),
                totalItems: ordersCount.length,
                totalPages: Math.ceil(ordersCount.length / pageSize)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


const getOrder = async (req, res) => {
    const { orderid } = req.body;
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    try {
        const order = await ordersStore.getOrder({ orderid });
        if (!order) {
            throw new Error(`Order with id ${orderid} not found`);
        }
        res.status(200).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const updateOrder = async (req, res) => {
    const { orderid, status, totalamount, fk_userId } = req.body;
    // Input validation
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    if (isNaN(totalamount) || totalamount < 0) {
        return res.status(400).json({ error: 'Valid totalamount is required' });
    }
    if (!status || status.trim() === '') {
        return res.status(400).json({ error: 'status is required' });
    }
    if (!fk_userId && isNaN(fk_userId)) {
        return res.status(400).json({ error: 'fk_userId is required' });
    }
    try {
        const updatedOrder = await ordersStore.updateOrder({ orderid, status, totalamount, fk_userId });
        if (!updatedOrder) {
            throw new Error('Failed to update order');
        }
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const deleteOrder = async (req, res) => {
    const { orderid } = req.body;
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    try {
        const deletedOrder = await ordersStore.deleteOrder({ orderid });
        if (!deletedOrder) {
            throw new Error('Failed to delete order');
        }
        res.status(200).json(deletedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getOrdersByUser = async (req, res) => {
    const { fk_userId } = req.body;
    if (!fk_userId && isNaN(fk_userId)) {
        return res.status(400).json({ error: 'fk_userId is required' });
    }
    try {
        const orders = await ordersStore.getOrdersByUser({ fk_userId });
        if (!orders) {
            throw new Error('No orders found for the specified user');
        }
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


const getOrdersByUserPagination = async (req, res) => {
    const { fk_userId, pageNumber, pageSize } = req.body;
    if (!fk_userId && isNaN(fk_userId)) {
        return res.status(400).json({ error: 'fk_userId is required' });
    }
    try {
        const ordersCount = await ordersStore.getOrdersByUser({ fk_userId });
        const orders = await ordersStore.getOrdersByUserPagination({ fk_userId, pageNumber, pageSize });
        if (!orders) {
            throw new Error('No orders found for the specified user');
        }
        res.status(200).json({
            orders,
            pagination: {
                pageNumber: parseInt(pageNumber),
                pageSize: parseInt(pageSize),
                totalItems: ordersCount.length,
                totalPages: Math.ceil(ordersCount.length / pageSize)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


const getOrderByUser = async (req, res) => {
    const { orderid, fk_userId } = req.body;
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    if (!fk_userId && isNaN(fk_userId)) {
        return res.status(400).json({ error: 'fk_userId is required' });
    }
    try {
        const order = await ordersStore.getOrderByUser({ orderid, fk_userId });
        if (!order) {
            throw new Error('No such order for the specified user');
        }
        res.status(200).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const ordersRoute = (router) => {
    router.post('/orders/create', verifyToken, createOrder);
    router.post('/orders/all', verifyToken, authIdentify, getOrders);
    router.post('/orders/all/paginating', verifyToken, authIdentify, getOrdersPaginated);
    router.post('/orders/specific', verifyToken, authIdentify, getOrder);
    router.put('/orders/update', verifyToken, authIdentify, updateOrder);
    router.delete('/orders/delete', verifyToken, authIdentify, deleteOrder);
    router.post('/orders/user', verifyToken, getOrdersByUser);
    router.post('/orders/user/paginating', verifyToken, getOrdersByUserPagination);
    router.post('/orders/user/specific', verifyToken, getOrderByUser);
}


export default ordersRoute;