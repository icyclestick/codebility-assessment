import { Router } from 'express';
import { WeatherService } from '../services/WeatherService';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/common';

const router = Router();
const weatherService = new WeatherService();

router.get('/city/:cityName', authenticate, asyncHandler(async (req, res) => {
    const { cityName } = req.params;
    const { country } = req.query;

    const weather = await weatherService.getWeatherByCity({
        city: cityName,
        country: country as string,
    });

    const response: ApiResponse = {
        success: true,
        data: weather.toResponse(),
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

router.get('/coordinates', authenticate, asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            success: false,
            message: 'Latitude and longitude are required',
            timestamp: new Date().toISOString(),
        });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (!weatherService.validateCoordinates(latitude, longitude)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid coordinates provided',
            timestamp: new Date().toISOString(),
        });
    }

    const weather = await weatherService.getWeatherByCoordinates(latitude, longitude);
    const response: ApiResponse = {
        success: true,
        data: weather.toResponse(),
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

router.get('/forecast/:cityName', authenticate, asyncHandler(async (req, res) => {
    const { cityName } = req.params;
    const { days } = req.query;

    const forecastDays = days ? parseInt(days as string) : 5;

    if (forecastDays < 1 || forecastDays > 5) {
        return res.status(400).json({
            success: false,
            message: 'Forecast days must be between 1 and 5',
            timestamp: new Date().toISOString(),
        });
    }

    const forecast = await weatherService.getWeatherForecast(cityName, forecastDays);
    const response: ApiResponse = {
        success: true,
        data: forecast.map(weather => weather.toResponse()),
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}));

export { router as weatherRoutes }; 