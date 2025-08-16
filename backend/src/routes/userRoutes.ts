import { Router } from 'express';
import { UserService } from '../services/UserService';
import { userValidationSchemas } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/common';

const router = Router();
const userService = new UserService();

router.get('/', authenticate, authorize('admin'), asyncHandler(async (req: any, res: any) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const query = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
    };

    const users = await userService.getAllUsers(query);
    res.status(200).json(users);
}));

router.get('/search', authenticate, authorize('admin'), asyncHandler(async (req: any, res: any) => {
    const { q, page, limit } = req.query;
    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required',
            timestamp: new Date().toISOString(),
        });
    }

    const query = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
    };

    const users = await userService.searchUsers(q as string, query);
    res.status(200).json(users);
}));

router.get('/profile', authenticate, asyncHandler(async (req: any, res: any) => {
    const user = await userService.getUserById(req.user!.id);
    const response: ApiResponse = {
        success: true,
        data: user.toResponse(),
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

router.get('/:userId', authenticate, authorize('admin'), asyncHandler(async (req: any, res: any) => {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    const response: ApiResponse = {
        success: true,
        data: user.toResponse(),
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

router.put('/:userId', authenticate, asyncHandler(async (req: any, res: any) => {
    const { userId } = req.params;
    const { error, value } = userValidationSchemas.update.validate(req.body);

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

    const updatedUser = await userService.updateUser(userId, value, req.user!);
    const response: ApiResponse = {
        success: true,
        data: updatedUser.toResponse(),
        message: 'User updated successfully',
        timestamp: new Date().toISOString(),
    };

    logger.info(`User updated: ${updatedUser.email}`);
    res.status(200).json(response);
}));

router.delete('/:userId', authenticate, asyncHandler(async (req: any, res: any) => {
    const { userId } = req.params;
    await userService.deleteUser(userId, req.user!);

    const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

export { router as userRoutes }; 