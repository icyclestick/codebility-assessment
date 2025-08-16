import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { userValidationSchemas } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/common';

const router = Router();
const authService = new AuthService();

router.post('/register', asyncHandler(async (req: any, res: any) => {
    const { error, value } = userValidationSchemas.register.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message,
            })),
            timestamp: new Date().toISOString(),
        });
    }

    const user = await authService.register(value);
    const response: ApiResponse = {
        success: true,
        data: user.toResponse(),
        message: 'User registered successfully',
        timestamp: new Date().toISOString(),
    };

    logger.info(`User registered: ${user.email}`);
    res.status(201).json(response);
}));

router.post('/login', asyncHandler(async (req: any, res: any) => {
    const { error, value } = userValidationSchemas.login.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message,
            })),
            timestamp: new Date().toISOString(),
        });
    }

    const { user, token } = await authService.login(value);
    const response: ApiResponse = {
        success: true,
        data: {
            user: user.toResponse(),
            token,
        },
        message: 'Login successful',
        timestamp: new Date().toISOString(),
    };

    logger.info(`User logged in: ${user.email}`);
    res.status(200).json(response);
}));

router.post('/refresh', asyncHandler(async (req: any, res: any) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required',
            timestamp: new Date().toISOString(),
        });
    }

    const token = await authService.refreshToken(userId);
    const response: ApiResponse = {
        success: true,
        data: { token },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

export { router as authRoutes }; 