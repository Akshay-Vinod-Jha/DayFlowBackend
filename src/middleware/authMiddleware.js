const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: missing or invalid token.',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: user not found.',
    });
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
