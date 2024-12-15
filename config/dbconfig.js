// setting up mongodb connection with mongoose
import mongoose from 'mongoose';

// connecting to mongodb atlas database 
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`\nMongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error !", error);
        process.exit(1);
    }
}

export default connectDB;
