import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from './errorHandler';
import { logger } from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Access token required');
        }

        const token = authHeader.substring(7); 

        if (!token) {
            throw new ApiError(401, 'Access token required');
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;

        if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
            throw new ApiError(401, 'Invalid token payload');
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        logger.debug(`User authenticated: ${decoded.email} (${decoded.role})`);
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(401, 'Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError(401, 'Token expired'));
        } else {
            logger.error('Authentication error:', error);
            next(new ApiError(500, 'Authentication failed'));
        }
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            logger.warn(`Access denied for user ${req.user.email} (${req.user.role}) to ${req.originalUrl}`);
            return next(new ApiError(403, 'Insufficient permissions'));
        }

        logger.debug(`Access granted for user ${req.user.email} (${req.user.role}) to ${req.originalUrl}`);
        next();
    };
}; 