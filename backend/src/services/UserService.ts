import { v4 as uuidv4 } from 'uuid';
import { User, IUser, UserRole } from '../models/User';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PaginationQuery, PaginatedResponse } from '../types/common';

export class UserService {
    private users: Map<string, IUser> = new Map();

    constructor() {
        this.initializeUsers();
    }

    private initializeUsers(): void {
        const users = [
            {
                id: uuidv4(),
                email: 'admin@codebility.com',
                password: 'admin123',
                role: UserRole.ADMIN,
                firstName: 'Admin',
                lastName: 'User',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                email: 'user@codebility.com',
                password: 'user123',
                role: UserRole.USER,
                firstName: 'Regular',
                lastName: 'User',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        users.forEach(async (userData) => {
            const user = new User(userData);
            await user.hashPassword();
            this.users.set(user.id, user);
        });

        logger.info('Sample users initialized');
    }

    async getAllUsers(query: PaginationQuery): Promise<PaginatedResponse<IUser>> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

        const usersArray = Array.from(this.users.values());

        const sortedUsers = usersArray.sort((a, b) => {
            const aValue = a[sortBy as keyof IUser];
            const bValue = b[sortBy as keyof IUser];

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

        const total = usersArray.length;
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: paginatedUsers.map(user => user.toResponse()),
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            timestamp: new Date().toISOString(),
        };
    }

    async getUserById(userId: string): Promise<IUser> {
        const user = this.users.get(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user;
    }

    async updateUser(userId: string, updateData: Partial<IUser>, currentUser: IUser): Promise<IUser> {
        if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
            throw new ApiError(403, 'You can only update your own profile');
        }

        const user = this.users.get(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const updatedUser = new User({
            ...user,
            ...updateData,
            updatedAt: new Date(),
        });

        this.users.set(userId, updatedUser);
        logger.info(`User updated: ${updatedUser.email}`);

        return updatedUser;
    }

    async deleteUser(userId: string, currentUser: IUser): Promise<void> {
        if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
            throw new ApiError(403, 'You can only delete your own profile');
        }

        const user = this.users.get(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (user.role === UserRole.ADMIN) {
            throw new ApiError(400, 'Cannot delete admin users');
        }

        this.users.delete(userId);
        logger.info(`User deleted: ${user.email}`);
    }

    async searchUsers(searchTerm: string, query: PaginationQuery): Promise<PaginatedResponse<IUser>> {
        const { page = 1, limit = 10 } = query;

        const usersArray = Array.from(this.users.values());
        const filteredUsers = usersArray.filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: paginatedUsers.map(user => user.toResponse()),
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            timestamp: new Date().toISOString(),
        };
    }
} 