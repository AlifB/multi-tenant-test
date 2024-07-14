const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from cookies
    const token = req.cookies.token;

    // Check if the token exists
    if (!token) {
        return res.status(401).redirect('/login');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        if(!req.user.verified) {
            return res.status(401).render('notverified', { 
                title: 'Not Verified', 
                stylePaths: [], 
                mailtext: encodeURIComponent(`Username: ${req.user.name}\nEmail: ${req.user.email}\n\nPlease verify the user.`),
            });
        }else {
            next();
        }
    } catch (error) {
        return res.status(401).redirect('/login');
    }
};

module.exports = authMiddleware;