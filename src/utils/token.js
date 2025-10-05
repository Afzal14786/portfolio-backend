import jwt from "jsonwebtoken"

// generate refresh token
export const generateAccessToken = (user)=> {
    return jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || "15m"}
    )
}

// generate a refresh token for the next 7 days
export const generateRefreshToken = (user)=> {
    return jwt.sign(
        {id: user._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"}
    )
}

// verify the token
export const verifyToken = (token, secret = process.env.JWT_SECRET)=> {
    return jwt.verify(token, secret);
}