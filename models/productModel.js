import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true,
    },
    productSize: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL'],
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    productCategory: {
        type: String,
        required: true,
    },
    productTag: {
        type: String,
        default: "Normal"
    },
    images: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);