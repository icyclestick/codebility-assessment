import winston from 'winston';
import { config } from '../config';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
    const env = config.nodeEnv || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Define different log formats
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define transports
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: config.logging.file,
        level: 'error',
    }),
    new winston.transports.File({ filename: config.logging.file }),
];

// Create the logger
export const logger = winston.createLogger({
    level: level(),
    levels,
    format: logFormat,
    transports,
});

// Create a stream object for Morgan (HTTP request logging)
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
}; 