import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ActionType,
    IPermission,
    PERMISSION_MODEL_NAME,
    ResourceType,
} from './permission.interface';
import { Model } from 'mongoose';

@Injectable()
export class PermissionRepository {
    constructor(
        @InjectModel(PERMISSION_MODEL_NAME)
        private readonly permissionModel: Model<IPermission>,
    ) {}

    async findByName(name: string): Promise<IPermission | null> {
        return this.permissionModel.findOne({ name }).exec();
    }

    async findByIds(ids: string[]): Promise<IPermission[]> {
        return this.permissionModel.find({ _id: { $in: ids } }).exec();
    }

    async findByResourceAndAction(
        resource: ResourceType,
        action: ActionType,
    ): Promise<IPermission | null> {
        return this.permissionModel.findOne({ resource, action }).exec();
    }

    async create(
        name: string,
        resource: ResourceType,
        action: ActionType,
        description?: string,
    ): Promise<IPermission> {
        const permission = new this.permissionModel({
            name,
            resource,
            action,
            description,
        });
        return permission.save();
    }

    async findAll(): Promise<IPermission[]> {
        return this.permissionModel.find().exec();
    }
}
