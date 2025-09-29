const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not authenticated.',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization.',
      });
    }
  };
};

// Specific role middlewares for common use cases
const requireAdmin = authorize('admin');
const requireUser = authorize('user', 'admin');
const requireStoreOwner = authorize('store_owner', 'admin');
const requireUserOrStoreOwner = authorize('user', 'store_owner', 'admin');

module.exports = {
  authorize,
  requireAdmin,
  requireUser,
  requireStoreOwner,
  requireUserOrStoreOwner,
};