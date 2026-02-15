import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import {
    IUpdateUser,
    IUser,
    IUserRepository,
    USER_MODEL_NAME,
} from './user.interface';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(USER_MODEL_NAME)
        private readonly userModel: Model<IUser>,
    ) {}

    async getUserInfo(userId: string): Promise<Partial<IUser> | null> {
        const user: Partial<IUser> | null = await this.userModel
            .findOne({ _id: userId })
            .select('-password -verification')
            .lean()
            .exec();

        return user;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return this.userModel.findOne({ email }).exec();
    }

    public async create(user: Partial<IUser>, session?: ClientSession) {
        const query = this.userModel.findOne({
            email: user.email,
        });

        if (session) query.session(session);

        const existingUser = await query.exec();

        if (existingUser) {
            throw new ConflictException(
                `E-mail '${user.email}' is already registered.`,
            );
        }
        const newUser = new this.userModel(user);

        if (session) {
            return newUser.save({ session });
        }

        return newUser.save();
    }

    public async findById(userId: string): Promise<IUser | null> {
        return await this.userModel.findById(userId).exec();
    }

    public async update(params: IUpdateUser): Promise<IUser | null> {
        const { dataToUpdate, userId } = params;

        // Ahora no filtramos keys, asumimos que dataToUpdate puede contener operadores como $set
        return await this.userModel
            .findOneAndUpdate({ _id: userId }, dataToUpdate, { new: true })
            .exec();
    }
}
