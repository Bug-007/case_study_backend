import { Product } from '../models/productModel.js';
import { multerUpload } from '../middleware/multerMiddleware.js';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const addNewProduct = async (req, res) => {
  try {
    multerUpload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error uploading files');
      }

      const { productId, productName, productDescription, productPrice, productSize, productCategory, productTag } = req.body;

      const productCheck = await Product.findOne({ productId });

      if (productCheck) {
        return res.status(400).json({ error: "Product already exists" })
      }

      const product = new Product({
        productId,
        productName,
        productDescription,
        productPrice,
        productSize,
        productCategory,
        productTag
      });

      await product.save();

      const { _id: originalId } = product;
      const imageNames = req?.files?.map(file => file?.originalname);

      await Product.findByIdAndUpdate(originalId, { images: imageNames });

      res.status(200).json({ message: "Uploaded" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


/*--------------------------------------------------------------------*/


export const getProductsByFilter = async (req, res) => {

  const filter = req.body;

  try {
    const fetchedProducts = await Product.find(filter);
    res.status(200).json(fetchedProducts);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


export const deleteProductById = async (req, res) => {
  const { id } = req.params; // Extract product ID from request parameters

  try {
    const deletedProduct = await await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    fs.rm(path.join(path.dirname(__dirname), 'uploads','products',deletedProduct?.productId), { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error deleting directory:', err);
      } else {
        console.log('Directory deleted successfully!');
      }
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
}

export const updateProductById = async (req, res) => {
  const { id } = req.params; // Extract product ID from request parameters
  const updatedProductData = req.body; // Get updated product data from request body

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductData, { new: true }); // Return the updated document;

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
}

export const getCategories = async (_req, res) => {
  try {
    const categories = await Product.distinct('productCategory');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
}