import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { IUpdateUser, IUser, SafeUser } from './user.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async createUser(user: Partial<IUser>, session?: ClientSession) {
        const userSaved = await this.userRepository.create(user, session);

        if (!userSaved) {
            throw new BadRequestException('User could not be created');
        }

        return this.sanitizeUser(userSaved);
    }

    private sanitizeUser(user: IUser): SafeUser {
        if (!user._id) {
            throw new Error('User _id is missing');
        }

        return {
            _id: user._id,
            name: user.name ?? '',
            lastName: user.lastName ?? '',
            email: user.email ?? '',
            photo: user.photo,
            state: user.state ?? true,
            changePassword: user.changePassword ?? false,
            birthday: user.birthday,
        };
    }

    async getUserInfoById(userId: string) {
        const user = await this.userRepository.getUserInfo(userId);
        if (!user) {
            throw new NotFoundException(
                `User by id: '${userId}' was not found.`,
            );
        }

        return { user };
    }

    async findById(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(
                `User by id: '${userId}' was not found.`,
            );
        }

        return user;
    }

    async findByEmail(email: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException(`User was not found`);
        }
        return user;
    }

    async updateVerification(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(
                `User by id: '${userId}' was not found.`,
            );
        }

        const params: IUpdateUser = {
            userId,
            dataToUpdate: {
                $set: {
                    'verification.status': true,
                    'verification.updatedAt': new Date(),
                },
            },
        };

        const updatedUser = await this.userRepository.update(params);
        return updatedUser;
    }

    async updateVerificationCode(userId: string, code: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(
                `User by id: '${userId}' was not found.`,
            );
        }

        const params: IUpdateUser = {
            userId,
            dataToUpdate: {
                $set: {
                    'verification.status': false,
                    'verification.code': code,
                    'verification.updatedAt': new Date(),
                },
            },
        };

        const updatedUser = await this.userRepository.update(params);
        return updatedUser;
    }
}
