import { Model } from 'mongoose';
import {
    GROUP_MODEL_NAME,
    ICreateGroup,
    IGroup,
    IGroupRepository,
    IUpdateGroup,
} from './group.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupRepository implements IGroupRepository {
    constructor(
        @InjectModel(GROUP_MODEL_NAME)
        private readonly groupModel: Model<IGroup>,
    ) {}

    async create(group: ICreateGroup): Promise<IGroup> {
        const newGroup = new this.groupModel(group);
        await newGroup.save();
        return newGroup;
    }

    async findById(userId: string, groupId: string): Promise<IGroup | null> {
        return await this.groupModel.findOne({
            userId: userId,
            _id: groupId,
        });
    }

    async findAll(userId: string): Promise<IGroup[]> {
        return await this.groupModel.find(
            {
                userId: userId,
            },
            { userId: 0 },
        ).exec();
    }

    async update(params: IUpdateGroup): Promise<IGroup | null> {
        const { groupId, userId, dataToUpdate } = params;
        return await this.groupModel.findOneAndUpdate(
            { _id: groupId, userId },
            dataToUpdate,
            { new: true },
        );
    }
}
