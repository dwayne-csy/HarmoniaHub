const User = require('../models/UserModels');
const jwt = require("jsonwebtoken")

exports.isAuthenticatedUser = async (req, res, next) => {

    const token = req.header('Authorization').split(' ')[1];
    console.log(token)


    if (!token) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);

    next()
};

