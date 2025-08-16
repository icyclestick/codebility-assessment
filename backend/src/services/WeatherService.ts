import axios from 'axios';
import { config } from '../config';
import { Weather, IWeatherRequest, IOpenWeatherResponse, IWeatherError } from '../models/Weather';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class WeatherService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor() {
        this.baseUrl = config.externalApis.weather.baseUrl;
        this.apiKey = config.externalApis.weather.apiKey;
    }

    async getWeatherByCity(request: IWeatherRequest): Promise<Weather> {
        try {
            const { city, country } = request;
            const query = country ? `${city},${country}` : city;

            const response = await axios.get<IOpenWeatherResponse>(
                `${this.baseUrl}/weather`,
                {
                    params: {
                        q: query,
                        appid: this.apiKey,
                        units: 'metric',
                    },
                    timeout: 10000,
                }
            );

            const weather = Weather.fromOpenWeatherResponse(response.data);
            logger.info(`Weather data fetched for ${city}`);

            return weather;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    throw new ApiError(404, `City '${request.city}' not found`);
                }
                if (error.response?.status === 401) {
                    throw new ApiError(500, 'Weather service authentication failed');
                }
                if (error.response?.status === 429) {
                    throw new ApiError(429, 'Weather service rate limit exceeded');
                }

                const weatherError = error.response?.data as IWeatherError;
                if (weatherError?.message) {
                    throw new ApiError(400, weatherError.message);
                }
            }

            logger.error('Weather service error:', error);
            throw new ApiError(500, 'Failed to fetch weather data');
        }
    }

    async getWeatherByCoordinates(lat: number, lon: number): Promise<Weather> {
        try {
            const response = await axios.get<IOpenWeatherResponse>(
                `${this.baseUrl}/weather`,
                {
                    params: {
                        lat,
                        lon,
                        appid: this.apiKey,
                        units: 'metric',
                    },
                    timeout: 10000,
                }
            );

            const weather = Weather.fromOpenWeatherResponse(response.data);
            logger.info(`Weather data fetched for coordinates: ${lat}, ${lon}`);

            return weather;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new ApiError(400, 'Invalid coordinates provided');
                }
            }

            logger.error('Weather service error:', error);
            throw new ApiError(500, 'Failed to fetch weather data');
        }
    }

    async getWeatherForecast(city: string, days: number = 5): Promise<Weather[]> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/forecast`,
                {
                    params: {
                        q: city,
                        appid: this.apiKey,
                        units: 'metric',
                        cnt: days,
                    },
                    timeout: 10000,
                }
            );

            const forecast = response.data.list.map((item: any) =>
                Weather.fromOpenWeatherResponse({
                    ...item,
                    name: city,
                    sys: { country: response.data.city.country },
                })
            );

            logger.info(`Weather forecast fetched for ${city} (${days} days)`);
            return forecast;
        } catch (error) {
            logger.error('Weather forecast error:', error);
            throw new ApiError(500, 'Failed to fetch weather forecast');
        }
    }

    validateCoordinates(lat: number, lon: number): boolean {
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }
} 