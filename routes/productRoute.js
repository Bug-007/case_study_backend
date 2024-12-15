import express from "express";
import { addNewProduct, getProductsByFilter, deleteProductById, updateProductById, getCategories } from "../controllers/productControl.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/addnewproduct", addNewProduct);
router.get("/getproducts", getProductsByFilter);
router.delete("/deleteproduct/:id", deleteProductById);
router.put("/updateproduct/:id",updateProductById );
// Route to fetch distinct categories
router.get('/getcategories', getCategories);

export default router;