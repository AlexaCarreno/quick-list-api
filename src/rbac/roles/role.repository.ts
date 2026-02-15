import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IRole, ROLE_MODEL_NAME, RoleName } from './role.interface';
import { Model } from 'mongoose';

@Injectable()
export class RoleRepository {
    constructor(
        @InjectModel(ROLE_MODEL_NAME)
        private readonly roleModel: Model<IRole>,
    ) {}

    async findByName(name: RoleName): Promise<IRole | null> {
        return await this.roleModel.findOne({ name }).exec();
    }

    async findById(id: string): Promise<IRole | null> {
        return await this.roleModel.findById(id).exec();
    }

    async create(name: RoleName, description?: string): Promise<IRole> {
        const role = new this.roleModel({ name, description });
        return role.save();
    }

    async findAll(): Promise<IRole[]> {
        return await this.roleModel.find().exec();
    }
}
