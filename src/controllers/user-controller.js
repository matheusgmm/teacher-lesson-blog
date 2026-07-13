const { getUserByToken } = require('../utils/Token.util');
const { sanitizeUser } = require('../utils/User.util');
const { CodedApiError } = require('../utils/CodedApiError.util');
const userService = require('../services/user-service');

async function updateUser(req, res, next) {
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


async function deleteUser(req, res, next) {
    try {
        const requester = await getUserByToken(req.headers.authorization?.split(' ')[1]);
        if (!requester) {
            throw new CodedApiError('UNAUTHORIZED', 'Unauthorized', 401);
        }

        const targetId = req.params.id || req.query.id;
        if (!targetId) {
            throw new CodedApiError('USER_ID_REQUIRED', 'User id is required', 400);
        }

        await userService.deleteUser(targetId, requester);

        return res.status(200).json({
            status: 200,
            message: 'User deleted successfully',
            data: null,
        });
    } catch (error) {
        return next(
            error instanceof CodedApiError
                ? error
                : new CodedApiError('DELETE_USER_FAILED', error.message, 500),
        );
    }
}


module.exports = { updateUser, deleteUser };
