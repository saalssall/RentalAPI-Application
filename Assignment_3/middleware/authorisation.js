import jwt from 'jsonwebtoken';

// Decodes a token from an Authorization header.
// Returns the payload, null (no header), or a string error code.
export const decodeToken = (authHeader) => {
    if (!authHeader) return null;
    if (!authHeader.match(/^Bearer /)) return "malformed";
    try {
        return jwt.verify(authHeader.replace(/^Bearer /, ""), process.env.JWT_SECRET);
    } catch (e) {
        return e.name === "TokenExpiredError" ? "expired" : "invalid";
    }
};

const authorisation = (req, res, next) => {
    const decoded = decodeToken(req.headers.authorization);

    if (!decoded) {
        return res.status(401).json({
            error: true,
            message: "Authorization header ('Bearer token') not found"
        });
    }
    if (typeof decoded === "string") {
        const message = decoded === "expired" ? "JWT token has expired" : "Invalid JWT token";
        return res.status(401).json({ error: true, message });
    }

    req.user = decoded;
    next();
};

export default authorisation;