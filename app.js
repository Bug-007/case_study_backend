import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/dbconfig.js';
import cookieParser from 'cookie-parser';
//import upload from './middleware/multerMiddleware.js';

dotenv.config({
    path: './.env'
});

// creating an express app
const app = express()

const PORT = process.env.PORT;
// const corsOrigins = ['http://localhost:3000', 'http://localhost:5173']; // extract and split CORS origins from the environment variable

// middleware configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN, // frontend URI (ReactJS)
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser());
app.use("/api/uploads", express.static('./uploads'))

// importing routes and binding them
import authRoute from './routes/authRoute.js';
import productRoute from './routes/productRoute.js';

app.use("/api/auth", authRoute)
app.use("/api/product", productRoute)

// start server if database is connected
connectDB()
    .then(() => {
        app.listen(PORT || 8800, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
            app.get("/", (req, res) => {
                res.status(201).send("Hi, from app.js ! Your server is running successfully.")
            })
        })
    })
    .catch((error) => {
        console.log("Error starting the server !!", error)
    })
