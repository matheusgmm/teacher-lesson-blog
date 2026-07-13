const { getUserByToken } = require('../utils/Token.util');
const { sanitizeUser } = require('../utils/User.util');
const { CodedApiError } = require('../utils/CodedApiError.util');
const userService = require('../services/user-service');

async function update(req, res, next) {
    try {
        const data = req.body;

        const requester = await getUserByToken(req.headers.authorization?.split(' ')[1]);
        console.log("Requester: ", requester);
        if (!requester) {
            throw new CodedApiError("UNAUTHORIZED", 'Unauthorized', 401);
        }

        const target = req.params.id || requester.id;
        const user = await userService.updateUser(target, data, requester);
        console.log("User: ", user);

        return res.status(200).json({
            status: 200,
            message: 'User updated successfully',
            data: sanitizeUser(user),
        });

    } catch (error) {
        return next(
            error instanceof CodedApiError
                ? error
                : new CodedApiError('UPDATE_USER_FAILED', error.message, 500),
        );
    }
}

module.exports = { update };
