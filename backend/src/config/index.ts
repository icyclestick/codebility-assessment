import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // Database Configuration (for future use)
    database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/codebility-assessment',
    },

    // External API Configuration
    externalApis: {
        weather: {
            baseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5',
            apiKey: process.env.WEATHER_API_KEY || 'your-weather-api-key',
        },
    },

    // Security Configuration
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log',
    },
} as const;

// Type for the config object
export type Config = typeof config; 