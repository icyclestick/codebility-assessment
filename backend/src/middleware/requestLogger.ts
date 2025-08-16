import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
    });

    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
        const duration = Date.now() - start;

        logger.info(`Response sent for ${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });

        return originalEnd.call(this, chunk, encoding);
    };

    next();
}; 