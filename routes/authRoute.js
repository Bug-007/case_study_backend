import express from "express";
import { login, logout, refreshAccessToken, signup } from "../controllers/authControl.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// secured routes
router.get("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshAccessToken)

export default router;