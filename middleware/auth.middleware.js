const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
        const decoded = jwt.verify(token, process.env.secretKey);
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        req.body.loggedInUserId = decoded.userId;
        next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    auth
};
