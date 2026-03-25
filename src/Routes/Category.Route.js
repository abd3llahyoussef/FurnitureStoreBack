import express from 'express';
import { CategoryModel } from '../Models/Category.Model.js';
import { verifyToken, authIdentify } from '../Middleware/User.Middleware.js';


const CategoryStore = new CategoryModel();

const createCategory = async(req,res)=>{    
    const{categoryname,description} = req.body;
    // Input validation
    if (!categoryname || categoryname.trim() === '') {
        return res.status(400).json({error: 'categoryname is required'});
    }
    if (!description || description.trim() === '') {
        return res.status(400).json({error: 'description is required'});
    }
    try{

        const newCategory = await CategoryStore.createCategory({categoryname,description});
        if(!newCategory){
            throw new Error('Failed to create category');
        }
        res.status(201).json(newCategory);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

const getCategories = async(req,res)=>{
    try{
        const categories = await CategoryStore.getCategories();
        if(!categories){
            throw new Error('No categories found');
        }
        res.status(200).json(categories);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

const getCategory = async(req,res)=>{
    const{categoryid} = req.body;  
    if(!categoryid && isNaN(categoryid)){
        return res.status(400).json({error: 'categoryid is required'});
    } 
    try{
        const category = await CategoryStore.getCategory({categoryid});
        if(!category){
            throw new Error(`Category with id ${categoryid} not found`);
        }
        res.status(200).json(category);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

const updateCategory = async(req,res)=>{
    const{categoryid,categoryname,description} = req.body;
    if(!categoryid && isNaN(categoryid)){
        return res.status(400).json({error: 'categoryid is required'});
    }
    if (!categoryname || categoryname.trim() === '') {
        return res.status(400).json({error: 'categoryname is required'});
    }
    if (!description || description.trim() === '') {
        return res.status(400).json({error: 'description is required'});
    }    
    try{
        const updatedCategory = await CategoryStore.updateCategory({categoryid,categoryname,description});
        if(!updatedCategory){
            throw new Error('Failed to update category');
        }
        res.status(200).json(updatedCategory);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

const deleteCategory = async(req,res)=>{
    const{categoryid} = req.body;
    if(!categoryid && isNaN(categoryid)){
        return res.status(400).json({error: 'categoryid is required'});
    }   
    try{
        const deletedCategory = await CategoryStore.deleteCategory({categoryid});
        if(!deletedCategory){
            throw new Error('Failed to delete category');
        }
        res.status(200).json(deletedCategory);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

const categoryRoute = (router) =>{
    router.post('/categories/create', verifyToken, authIdentify, createCategory);
    router.get('/categories/all', verifyToken, getCategories);
    router.get('/categories/specific', verifyToken, getCategory);
    router.put('/categories/update', verifyToken, authIdentify, updateCategory);
    router.delete('/categories/delete', verifyToken, authIdentify, deleteCategory);
}

export default categoryRoute;