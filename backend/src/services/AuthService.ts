import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { User, IUser, IUserLogin, IUserRegister, UserRole } from '../models/User';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { JwtPayload } from '../types/common';

export class AuthService {
    private users: Map<string, IUser> = new Map();

    constructor() {
        this.initializeAdminUser();
    }

    private initializeAdminUser(): void {
        const adminUser = new User({
            id: uuidv4(),
            email: 'admin@codebility.com',
            password: 'admin123',
            role: UserRole.ADMIN,
            firstName: 'Admin',
            lastName: 'User',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        adminUser.hashPassword().then(() => {
            this.users.set(adminUser.id, adminUser);
            logger.info('Admin user initialized');
        });
    }

    async register(userData: IUserRegister): Promise<IUser> {
        const existingUser = Array.from(this.users.values()).find(
            user => user.email === userData.email
        );

        if (existingUser) {
            throw new ApiError(409, 'User with this email already exists');
        }

        const user = new User({
            id: uuidv4(),
            ...userData,
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await user.hashPassword();
        this.users.set(user.id, user);

        logger.info(`New user registered: ${user.email}`);
        return user;
    }

    async login(credentials: IUserLogin): Promise<{ user: IUser; token: string }> {
        const user = Array.from(this.users.values()).find(
            u => u.email === credentials.email
        );

        if (!user) {
            throw new ApiError(401, 'Invalid credentials');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid credentials');
        }

        const token = this.generateToken(user);
        logger.info(`User logged in: ${user.email}`);

        return { user, token };
    }

    private generateToken(user: IUser): string {
        const payload: JwtPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
    }

    async refreshToken(userId: string): Promise<string> {
        const user = this.users.get(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const token = this.generateToken(user);
        logger.info(`Token refreshed for user: ${user.email}`);

        return token;
    }

    async getUserById(userId: string): Promise<IUser | null> {
        return this.users.get(userId) || null;
    }

    async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
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
} 