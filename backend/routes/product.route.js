import express from 'express';
import { sellerRoute, buyerRoute, protectRoute } from '../middleware/auth.middleware.js';
import {getProduct, getAllProducts, getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct, rateProduct, deleteRating } from '../controllers/product.controller.js';

//apil/products
const router = express.Router();

//Public Access
router.get('/', buyerRoute, getAllProducts);
router.get('/:id', buyerRoute, getProduct);
router.put('/rate/:id', buyerRoute, rateProduct);
router.delete('/rate/:id', buyerRoute, deleteRating);

//Seller Access
router.get('/my-products', protectRoute, sellerRoute, getMyProducts); 
router.post('/create-my-product', protectRoute, sellerRoute, createMyProduct);
router.put('/:id', protectRoute, sellerRoute, updateMyProduct); 
router.delete('/:id', protectRoute, sellerRoute, deleteMyProduct); 

export default router;