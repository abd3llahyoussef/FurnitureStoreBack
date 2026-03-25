import express from 'express';
import { ProductModel } from '../Models/Products.Model.js';
import { verifyToken, authIdentify } from '../Middleware/User.Middleware.js';

const productStore = new ProductModel();

const createProduct = async (req, res) => {
    const { productname, description, price, quantity, fk_category, imgUrl } = req.body.productData;
    // Input validation
    if (!productname || productname.trim() === '') {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (!description || description.trim() === '') {
        return res.status(400).json({ error: 'Description is required' });
    }
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }
    if (isNaN(fk_category)) {
        return res.status(400).json({ error: 'Valid fk_category is required' });
    }
    try {
        const newProduct = await productStore.createProduct({ productname, description, price, quantity, fk_category });
        if (!newProduct) {
            throw new Error('Failed to create product');
        }
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getProducts = async (req, res) => {
    try {
        const products = await productStore.getProducts();
        res.status(200).json(products);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getProductsPaginated = async (req, res) => {
    try {
        const productsCount = await productStore.getProducts();
        const products = await productStore.getProductsPaginated(req.body);
        if (!products) {
            throw new Error('No products found');
        }
        res.status(200).json({
            products, pagination: {
                pageNumber: parseInt(req.body.pageNumber),
                pageSize: parseInt(req.body.pageSize),
                totalItems: productsCount.length,
                totalPages: Math.ceil(productsCount.length / req.body.pageSize)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getProduct = async (req, res) => {
    const { productid } = req.body;
    // Input validation
    if (isNaN(productid)) {
        return res.status(400).json({ error: 'Valid productid is required' });
    }
    try {
        const product = await productStore.getProduct({ productid });
        if (!product) {
            throw new Error('Product not found');
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const updateProduct = async (req, res) => {
    const { productid, productname, description, price, quantity, fk_category, imgUrl } = req.body;
    // Input validation
    if (isNaN(productid)) {
        return res.status(400).json({ error: 'Valid productid is required' });
    }
    if (!productname || productname.trim() === '') {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (!description || description.trim() === '') {
        return res.status(400).json({ error: 'Description is required' });
    }
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
    }
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }
    if (isNaN(fk_category)) {
        return res.status(400).json({ error: 'Valid fk_category is required' });
    }
    try {
        const updatedProduct = await productStore.updateProduct({ productid, productname, description, price, quantity, fk_category, imgUrl });
        if (!updatedProduct) {
            throw new Error('Product not found or update failed');
        }
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const deleteProduct = async (req, res) => {
    const { productid } = req.body;
    // Input validation
    if (isNaN(productid)) {
        return res.status(400).json({ error: 'Valid productid is required' });
    }
    try {
        const deletedProduct = await productStore.deleteProduct({ productid });
        if (!deletedProduct) {
            throw new Error('Product not found or delete failed');
        }
        res.status(200).json(deletedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getProductsByCategory = async (req, res) => {
    const { fk_category } = req.body;
    if (isNaN(fk_category)) {
        return res.status(400).json({ error: 'Valid fk_category is required' });
    }
    try {
        const products = await productStore.getProductsByCategory({ fk_category });
        if (!products || products.length === 0) {
            throw new Error('No products found for the specified category');
        }
        res.status(200).json(products);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const productRoute = (router) => {
    router.post('/products/create', verifyToken, authIdentify, createProduct);
    router.get('/products/all', getProducts);
    router.post('/products/all/paginating', getProductsPaginated);
    router.post('/products/specific', getProduct);
    router.post('/products/byCategory', getProductsByCategory);
    router.put('/products/update', verifyToken, authIdentify, updateProduct);
    router.delete('/products/delete', verifyToken, authIdentify, deleteProduct);
}

export default productRoute;