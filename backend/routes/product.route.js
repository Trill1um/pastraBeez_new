import { protectRoute } from '../middleware/auth.middleware.js';
import express from 'express';
import {getProduct, getAllProducts, getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct } from '../controllers/product.controller.js';

//apil/products
const router = express.Router();

//Public Access
router.get('/', getAllProducts);

//Seller Access
router.get('/my-products', protectRoute, getMyProducts); 
router.post('/create-my-product', protectRoute, createMyProduct);

router.put('/:id', protectRoute, updateMyProduct); 

router.delete('/:id', protectRoute, deleteMyProduct); 

router.get('/:id', getProduct);

export default router;