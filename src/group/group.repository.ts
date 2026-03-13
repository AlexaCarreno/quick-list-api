import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { GetGroupsQueryDto } from './group.dto';
import { GROUP_MODEL_NAME, IGroup, IGroupWithTeacher } from './group.interface';

@Injectable()
export class GroupRepository {
    constructor(
        @InjectModel(GROUP_MODEL_NAME)
        private readonly groupModel: Model<IGroup>,
    ) {}

    async create(data: Partial<IGroup>, session?: ClientSession) {
        const [group] = await this.groupModel.create([data], { session });
        return group;
    }

    async findById(id: string): Promise<IGroup | null> {
        return this.groupModel.findById(id).exec();
    }

    async findByIdWithTeacher(id: string): Promise<IGroupWithTeacher | null> {
        return this.groupModel
            .findById(id)
            .populate('teacherId', 'name lastName email')
            .lean()
            .exec() as Promise<IGroupWithTeacher | null>;
    }

    async findByReferenceCode(referenceCode: string): Promise<IGroup | null> {
        return this.groupModel
            .findOne({ referenceCode: referenceCode.toUpperCase() })
            .exec();
    }

    async updateById(
        id: string,
        data: Partial<IGroup>,
        session?: ClientSession,
    ): Promise<IGroup | null> {
        return this.groupModel
            .findByIdAndUpdate(id, { $set: data }, { new: true, session })
            .exec();
    }

    async findAll(query: GetGroupsQueryDto): Promise<{
        groups: IGroupWithTeacher[];
        total: number;
    }> {
        const {
            limit = 10,
            offset = 0,
            referenceCode,
            subject,
            period,
            status,
        } = query;

        const filter: Record<string, any> = {};

        if (referenceCode)
            filter.referenceCode = { $regex: referenceCode, $options: 'i' };
        if (subject) filter.subject = { $regex: subject, $options: 'i' };
        if (period) filter.period = { $regex: period, $options: 'i' };
        if (status) filter.status = status;

        const [groups, total] = await Promise.all([
            this.groupModel
                .find(filter)
                .populate('teacherId', 'name lastName email')
                .skip(offset)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean()
                .exec(),
            this.groupModel.countDocuments(filter).exec(),
        ]);

        return { groups: groups as IGroupWithTeacher[], total };
    }

    async deleteById(id: string, session?: ClientSession): Promise<void> {
        await this.groupModel.findByIdAndDelete(id, { session }).exec();
    }
}
