import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface IUser {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserResponse {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IUserRegister {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export class User implements IUser {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<IUser>) {
        this.id = data.id || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.role = data.role || UserRole.USER;
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    async hashPassword(): Promise<void> {
        this.password = await bcrypt.hash(this.password, config.security.bcryptRounds);
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }

    toResponse(): IUserResponse {
        return {
            id: this.id,
            email: this.email,
            role: this.role,
            firstName: this.firstName,
            lastName: this.lastName,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export const userValidationSchemas = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    update: Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50),
        email: Joi.string().email(),
    }),
}; 