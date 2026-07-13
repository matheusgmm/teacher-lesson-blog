const { CodedApiError } = require('../utils/CodedApiError.util');


async function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return new CodedApiError("UNAUTHORIZED", 'Unauthorized', 401).send(res);
        }

        if (!roles.includes(req.user.role)) {
            return new CodedApiError("FORBIDDEN", 'Forbidden', 403).send(res);
        }

    return next();
  };
}

const isAdmin = authorizeRoles('ADMIN');
const isUser = authorizeRoles('USER', 'ADMIN');

module.exports = { authorizeRoles, isAdmin, isUser };
