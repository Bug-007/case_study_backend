import jwt from "jsonwebtoken"
import { User } from "../models/userModel.js"

// middleware to verify JWT tokens
export const verifyJWT = async (req, res, next) => {
    try {
        // getting access token from either cookies or user request header authorization
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer", "")
        // decoding access token fetched from cookies or request header
        // console.log("jwt token", token);
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        try {
            // fetching user details from database based on _id decoded from access token
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

            // setting req.user as user fetched
            req.user = user;
            next();
        } catch (error) {
            // console.log(error)
            res.status(401).json({ error: "Invalid Access Token" })
        }

    } catch (error) {
        // console.log(error)
        res.status(401).json({ error: "Unauthorized Request" })
    }
}