import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  login, 
  signup, 
  logout, 
  refreshToken, 
  getProfile,
  verifyReceive,
  verifySend,
  setVerifiedtoFalse,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.post("/verify-send", verifySend);
router.post("/verify-receive", verifyReceive);
router.post("/debug-verify", setVerifiedtoFalse);

export default router;