import express from 'express';
import { sellerRoute, protectRoute } from '../middleware/auth.middleware.js';
import {getProduct, getAllProducts, getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct } from '../controllers/product.controller.js';
import { rate } from "../controllers/ps.controller.js";

//apil/products
const router = express.Router();

//Public Access
router.get('/', getAllProducts);
router.get('/:id', getProduct);

//Protected Acess
router.put('/rate', protectRoute, rate);

//Seller Access
router.get('/my-products', protectRoute, sellerRoute, getMyProducts); 
router.post('/create-my-product', protectRoute, sellerRoute, createMyProduct);
router.put('/:id', protectRoute, sellerRoute, updateMyProduct); 
router.delete('/:id', protectRoute, sellerRoute, deleteMyProduct); 

export default router;