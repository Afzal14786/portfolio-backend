import {verifyToken, generateAccessToken} from "../utils/token.js"

const refreshAccessToken = (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return res.status(401).json({
            message: "No refresh token provided",
            success: false,
        });
    }

    try {
        const decode = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newToken = generateAccessToken({_id: decode.id});

        res.json ({
            accessToken: newToken
        });
    } catch(err) {
        return res.json({
            message: "Invalid refresh token",
            success: false
        });
    }
}

export default refreshAccessToken;