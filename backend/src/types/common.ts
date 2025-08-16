export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
    search?: string;
    filters?: Record<string, any>;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RouteConfig {
    method: HttpMethod;
    path: string;
    middleware: any[];
    handler: any;
} 