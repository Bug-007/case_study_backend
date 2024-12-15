import multer from "multer";
import fs from 'fs';

const storage = multer.diskStorage({
    destination: async (req, file, callback) => {
        try {
            // getting productId from the form data
            const productId = req.body.productId;

            // constructing destination path using productId
            const destination = `./uploads/products/${productId}`;

            // create the directory if it doesn't exist
            await fs.promises.mkdir(destination, { recursive: true });

            callback(null, destination);
        } catch (error) {
            callback(error);
        }
    },

    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

export const multerUpload = multer({ storage: storage }).array('images[]', 4);

