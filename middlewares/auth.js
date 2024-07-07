const jwt = require('jsonwebtoken');

// Import required modules

// Define the authentication middleware function
const authMiddleware = (req, res, next) => {
    // Get the token from cookies
    const token = req.cookies.token;

    // Check if the token exists
    if (!token) {
        return res.status(401).redirect('/login');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'your-secret-key');

        // Attach the decoded user information to the request object
        console.log(decoded.user);
        req.user = decoded.user;

        // Call the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Export the middleware function
module.exports = authMiddleware;