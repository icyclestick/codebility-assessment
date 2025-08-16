export interface IWeatherData {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
    icon: string;
    timestamp: Date;
}

export interface IWeatherRequest {
    city: string;
    country?: string;
}

export interface IOpenWeatherResponse {
    weather: Array<{
        description: string;
        icon: string;
    }>;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
    };
    sys: {
        country: string;
    };
    name: string;
    dt: number;
}

export interface IWeatherError {
    cod: string;
    message: string;
}

export class Weather implements IWeatherData {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
    icon: string;
    timestamp: Date;

    constructor(data: IWeatherData) {
        this.city = data.city;
        this.country = data.country;
        this.temperature = data.temperature;
        this.feelsLike = data.feelsLike;
        this.humidity = data.humidity;
        this.description = data.description;
        this.icon = data.icon;
        this.timestamp = data.timestamp;
    }

    static fromOpenWeatherResponse(response: IOpenWeatherResponse): Weather {
        return new Weather({
            city: response.name,
            country: response.sys.country,
            temperature: response.main.temp,
            feelsLike: response.main.feels_like,
            humidity: response.main.humidity,
            description: response.weather[0]?.description || 'Unknown',
            icon: response.weather[0]?.icon || '01d',
            timestamp: new Date(response.dt * 1000),
        });
    }

    toResponse() {
        return {
            city: this.city,
            country: this.country,
            temperature: this.temperature,
            feelsLike: this.feelsLike,
            humidity: this.humidity,
            description: this.description,
            icon: this.icon,
            timestamp: this.timestamp,
        };
    }
} 