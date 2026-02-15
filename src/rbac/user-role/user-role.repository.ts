import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRole, USER_ROLE_MODEL_NAME } from './user-role.interface';

@Injectable()
export class UserRoleRepository {
    constructor(
        @InjectModel(USER_ROLE_MODEL_NAME)
        private readonly userRoleModel: Model<IUserRole>,
    ) {}

    async assignRole(
        userId: string,
        roleId: string,
        assignedBy?: string,
    ): Promise<IUserRole> {
        try {
            const userRole = new this.userRoleModel({
                userId,
                roleId,
                assignedBy,
                assignedAt: new Date(),
            });
            return await userRole.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(
                    'User already has this role assigned',
                );
            }
            throw error;
        }
    }

    async removeRole(userId: string, roleId: string): Promise<boolean> {
        const result = await this.userRoleModel
            .deleteOne({ userId, roleId })
            .exec();
        return result.deletedCount > 0;
    }

    async getUserRoles(userId: string): Promise<IUserRole[]> {
        return await this.userRoleModel
            .find({ userId })
            .populate('roleId')
            .exec();
    }

    async findUsersWithRole(roleId: string): Promise<IUserRole[]> {
        return await this.userRoleModel
            .find({ roleId })
            .populate('userId')
            .exec();
    }

    async hasRole(userId: string, roleId: string): Promise<boolean> {
        const count = await this.userRoleModel
            .countDocuments({ userId, roleId })
            .exec();
        return count > 0;
    }

    async removeAllUserRoles(userId: string): Promise<number> {
        const result = await this.userRoleModel.deleteMany({ userId }).exec();
        return result.deletedCount;
    }
}
