import { OrdersProductsModel } from "../Models/OrdersProducts.Model.js";
import express from "express";
import { verifyToken, authIdentify } from '../Middleware/User.Middleware.js';


const ordersProductsStore = new OrdersProductsModel();

const addProductToOrder = async (req, res) => {
    const { orderid, productId, quantity, price } = req.body;
    // Input validation
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    if (!productId && isNaN(productId)) {
        return res.status(400).json({ error: 'productId is required' });
    }
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }
    try {
        const newEntry = await ordersProductsStore.addProductToOrder({ orderid, productId, quantity, price });
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
const getProductsByOrder = async (req, res) => {
    const { orderid } = req.body;
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    try {
        const products = await ordersProductsStore.getProductsByOrder({ orderid });
        if (!products) {
            throw new Error('No products found for the specified order');
        }
        res.status(200).json(products);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
const getOrdersByProduct = async (req, res) => {
    const { productId } = req.body;
    if (!productId && isNaN(productId)) {
        return res.status(400).json({ error: 'productId is required' });
    }
    try {
        const orders = await ordersProductsStore.getOrdersByProduct({ productId });
        if (!orders) {
            throw new Error('No orders found for the specified product');
        }
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
const removeProductFromOrder = async (req, res) => {
    const { orderid, productId } = req.body;
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    if (!productId && isNaN(productId)) {
        return res.status(400).json({ error: 'productId is required' });
    }
    try {
        const removedEntry = await ordersProductsStore.removeProductFromOrder({ orderid, productId });
        if (!removedEntry) {
            throw new Error('No such product in the specified order');
        }
        res.status(200).json(removedEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const updateProductOrder = async (req, res) => {
    const { orderid, productId, quantity, price } = req.body;
    if (!orderid && isNaN(orderid)) {
        return res.status(400).json({ error: 'orderid is required' });
    }
    if (!productId && isNaN(productId)) {
        return res.status(400).json({ error: 'productId is required' });
    }
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }
    try {
        const updatedEntry = await ordersProductsStore.updateProductOrder({ orderid, productId, quantity, price });
        if (!updatedEntry) {
            throw new Error('No such product in the specified order to update');
        }
        res.status(200).json(updatedEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const ordersProductsRoute = (router) => {
    router.post('/ordersProducts/add', verifyToken, addProductToOrder);
    router.post('/orders-products/by-order', verifyToken, getProductsByOrder);
    router.get('/orders-products/by-product', verifyToken, authIdentify, getOrdersByProduct);
    router.delete('/orders-products/remove', verifyToken, removeProductFromOrder);
    router.put('/orders-products/update', verifyToken, updateProductOrder);
}


export default ordersProductsRoute;