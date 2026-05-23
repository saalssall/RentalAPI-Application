import jwt from 'jsonwebtoken';

// authorisation middleware (guardrail) to protect routes that require authentication
const authorisation = (req, res, next) => {
    // 1. Check authorization header exists and start with 'Bearer'

    if (!("authorization" in req.headers) || !req.headers.authorization.match(/^Bearer /)) {
        res.status(401).json({ 
            error: true,
            message: "Authorization header ('Bearer token') not found" 
        });

        return;
    }

    // 2. Strip 'Bearer 'prefix from the header to get the raw token
    const token = req.headers.authorization.replace(/^Bearer /, "");
    // 3. Verify the token signature and expiry using the secret key
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        // 4. If valid, call next() to proceed to the route handler
    } catch (error) {
        console.log("Authorization failed:", error.message);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                error: true,
                message: "JWT token has expired"
            });
        } else {
            res.status(401).json({
                error: true,
                message: "Invalid JWT token"
            });
        }
        return;     
    }

    console.log("Authorization successful");
    next();
}

export default authorisation;