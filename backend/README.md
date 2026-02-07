# Backend Assessment - Clean Architecture API

A clean, well-structured Express.js API built with TypeScript following best practices and clean architecture principles.

## 🏗️ Architecture Overview

This API follows a layered architecture pattern:

```
src/
├── config/          # Configuration management
├── middleware/      # Express middleware (auth, error handling, logging)
├── models/          # Data models and validation schemas
├── routes/          # API route handlers
├── services/        # Business logic layer
├── types/           # TypeScript interfaces and types
├── utils/           # Shared utilities (logger)
├── app.ts           # Express app configuration
└── index.ts         # Application entry point
```

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **External API Integration**: Weather data from OpenWeatherMap API
- **Input Validation**: Joi schemas for request validation
- **Error Handling**: Centralized error handling with proper logging
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Logging**: Structured logging with Winston
- **TypeScript**: Full type safety and modern ES2020 features

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# External API Configuration
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
WEATHER_API_KEY=your-openweathermap-api-key-here

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

4. Get OpenWeatherMap API key:
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Add your API key to `.env`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:userId` - Get user by ID (admin only)
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users/search` - Search users (admin only)

### Weather
- `GET /api/weather/city/:cityName` - Get weather by city
- `GET /api/weather/coordinates` - Get weather by coordinates
- `GET /api/weather/forecast/:cityName` - Get weather forecast

## 🔐 Sample Users

The system comes with pre-configured users:

**Admin User:**
- Email: `admin@codebility.com`
- Password: `admin123`
- Role: `admin`

**Regular User:**
- Email: `user@codebility.com`
- Password: `user123`
- Role: `user`

## 🧪 Testing the API

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get weather data (with token)
```bash
curl -X GET "http://localhost:3000/api/weather/city/London" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏗️ Design Decisions

### Clean Architecture
- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Direction**: Outer layers depend on inner layers
- **Testability**: Services and models can be easily unit tested
- **Maintainability**: Clear structure makes code easy to navigate

### Security
- **JWT Authentication**: Stateless authentication with configurable expiration
- **Role-Based Access Control**: Admin and user roles with proper authorization
- **Input Validation**: Joi schemas prevent malicious input
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Security Headers**: Helmet provides essential security headers

### Error Handling
- **Centralized Error Handling**: All errors go through a single middleware
- **Structured Logging**: Winston logger with different levels and transports
- **User-Friendly Messages**: Clear error messages without exposing internals
- **HTTP Status Codes**: Proper status codes for different error types

### External API Integration
- **Weather Service**: Demonstrates external API integration
- **Error Handling**: Proper handling of external API errors
- **Timeout Protection**: Prevents hanging requests
- **Data Transformation**: Clean mapping of external data to internal models

## 🚧 Shortcuts Taken

Due to time constraints, the following shortcuts were taken:

1. **In-Memory Storage**: Using Map instead of a real database
2. **Simple Authentication**: Basic JWT implementation without refresh token rotation
3. **Limited Validation**: Basic input validation without advanced sanitization
4. **No Tests**: Unit and integration tests not implemented
5. **Basic Logging**: Simple file and console logging without advanced features

## 🔮 Future Improvements

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Advanced Auth**: Implement refresh token rotation and session management
3. **Caching**: Add Redis for weather data caching
4. **Testing**: Comprehensive test suite with Jest
5. **API Documentation**: Swagger/OpenAPI documentation
6. **Monitoring**: Health checks and metrics collection
7. **Docker**: Containerization for easy deployment

## 📝 License

MIT License - feel free to use this code for your projects! 
