import { ConflictException, Injectable } from '@nestjs/common';
import {
    IRolePermission,
    ROLE_PERMISSION_MODEL_NAME,
} from './role-permission.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RolePermissionRepository {
    constructor(
        @InjectModel(ROLE_PERMISSION_MODEL_NAME)
        private readonly rolePermissionModel: Model<IRolePermission>,
    ) {}

    async assignPermission(
        roleId: string,
        permissionId: string,
    ): Promise<IRolePermission> {
        try {
            const rolePermission = new this.rolePermissionModel({
                roleId,
                permissionId,
                assignedAt: new Date(),
            });
            return await rolePermission.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Role already has this permission');
            }
            throw error;
        }
    }

    async removePermission(
        roleId: string,
        permissionId: string,
    ): Promise<boolean> {
        const result = await this.rolePermissionModel
            .deleteOne({ roleId, permissionId })
            .exec();
        return result.deletedCount > 0;
    }

    async getRolePermissions(roleId: string): Promise<IRolePermission[]> {
        return this.rolePermissionModel
            .find({ roleId })
            .populate('permissionId')
            .exec();
    }

    async assignMultiplePermissions(
        roleId: string,
        permissionIds: string[],
    ): Promise<IRolePermission[]> {
        const rolePermissions = permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
            assignedAt: new Date(),
        }));

        try {
            return await this.rolePermissionModel.insertMany(rolePermissions, {
                ordered: false,
            });
        } catch (error) {
            if (error.code === 11000) {
                // Algunos ya existen, ignorar duplicados
                return [];
            }
            throw error;
        }
    }

    async getRolesWithPermission(
        permissionId: string,
    ): Promise<IRolePermission[]> {
        return this.rolePermissionModel
            .find({ permissionId })
            .populate('roleId')
            .exec();
    }
}
