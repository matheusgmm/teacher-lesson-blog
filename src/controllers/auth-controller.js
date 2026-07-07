const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user-repository');
const { CodedApiError } = require('../utils/CodedApiErrors.util');
const authTokenRepository = require('../repositories/auth-token-repository');
const { sanitizeUser } = require('../utils/User.util');

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new CodedApiError('Invalid request body', 400);
        }

        const emailExists = await userRepository.findByEmail(email);

        if (emailExists) {
            throw new CodedApiError('Email already exists', 400);
        }

        const user = await userRepository.createUser({ name, email, password });

        return res.status(201).json({
            status: 201,
            message: 'User created successfully',
            data: sanitizeUser(user)
        });


    } catch (error) {
        return next(new CodedApiError(error.message, error.statusCode || 500));
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new CodedApiError('Invalid login credentials', 400);
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new CodedApiError('User not found', 404);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new CodedApiError('Invalid login credentials', 400);
        }

        const token = await authTokenRepository.createAuthToken(user.id, user.role);


        return res.status(200).json({
            status: 200,
            message: 'Login successful',
            data: {
                user: sanitizeUser(user),
                token: token.token,
            },
        });
    } catch (error) {
        return next(new CodedApiError(error.message, error.statusCode || 500));
    }
}

async function logout(req, res, next) {
    try {
        const { token } = req.body;
        if (!token) {
            throw new CodedApiError('Token is required', 400);
        }
        await authTokenRepository.deleteAuthToken(token);
        return res.status(200).json({
            status: 200,
            message: 'Logout successful',
        });
    } catch (error) {
        return next(new CodedApiError(error.message, error.statusCode || 500));
    }
}



module.exports = { register, login, logout };