import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

/*---------------------------------------------------------------------*/


// controller function to handle access and refresh token generation
const generateAccessAndRefreshToken = async (userId,res) => {
    try {
        const user = await User.findById(userId);
        // generating access and refresh tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // updating refreshToken of user
        user.refreshToken = refreshToken;

        // saving the refresh token to the database without validation
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong while generating refresh and access tokens" })
    }
}


/*--------------------------------------------------------------------*/


// controller function for user signup
export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            const newUser = new User({ fullname, email, password });
            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        } else {
            res.status(400).json({ error: 'Email already exists' })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


/*--------------------------------------------------------------------*/


// controller function for user login
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Email Not Found' })
        }

        // comparing the password using custom method of User model
        const passwordMatch = await user.comparePassword(password);

        if (passwordMatch) {

            // calling generateAccessTokenAndRefreshTokens and destructuring tokens
            const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id,res);

            const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

            // creating options for cookie configuration
            const options = {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            }

            // setting cookies in the response
            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json({
                    message: 'Login Successful',
                    user: loggedInUser, accessToken, refreshToken
                });

        } else {
            res.status(401).json({ error: "Password Doesn't Matches" })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
}


/*----------------------------------------------------------------------*/


// controller function for user logout
export const logout = async (req, res) => {

    // updating refreshToken of user logging out
    await User.findByIdAndUpdate(
        req.user._id, // fetched from authMiddleware
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    // cookie config options
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    // returning response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "User Logged Out Successfully" })
}


/*----------------------------------------------------------------------*/


export const refreshAccessToken = async (req, res) => {
    try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  
      if (!incomingRefreshToken) {
        return res.status(401).json({ error: "Refresh Token missing" }); 
      }
  
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
  
      const user = await User.findById(decodedToken._id);
  
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
  
      if (incomingRefreshToken !== user.refreshToken) {
        return res.status(401).json({ error: "Refresh Token Expired or Used" });
      }
  
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  
      // Update user's refreshToken in the database
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
  
      // Set cookies (make sure to set appropriate options for secure and HTTP-only)
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'None' });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'None' });
  
      return res.status(200).json({ 
        message: "Token Refreshed", 
        accessToken, 
        refreshToken: refreshToken 
      });
  
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: "Unauthorized Request" });
    }
  };