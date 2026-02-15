import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ClientSession,
    Model,
    PipelineStage,
    Schema,
    UpdateQuery,
} from 'mongoose';
import { PaginatedResult } from '../common/interfaces/common.interfaces';
import {
    ITeacher,
    TEACHER_MODEL_NAME,
    TeacherWithUser,
} from './teacher.interface';

@Injectable()
export class TeacherRepository {
    constructor(
        @InjectModel(TEACHER_MODEL_NAME)
        private readonly teacherModel: Model<ITeacher>,
    ) {}

    async create(
        data: Partial<ITeacher>,
        session?: ClientSession,
    ): Promise<ITeacher> {
        const teacher = new this.teacherModel({
            ...data,
            userId: this.toObjectId(data.userId),
        });

        return await teacher.save({ session });
    }

    async findByUserId(userId: string): Promise<ITeacher | null> {
        return await this.teacherModel
            .findOne({
                userId: this.toObjectId(userId),
            })
            .exec();
    }

    async updateByUserId(userId: string, dataToUpdate: UpdateQuery<ITeacher>) {
        const teacher = await this.teacherModel
            .findOneAndUpdate(
                { userId: this.toObjectId(userId) },
                dataToUpdate,
                { new: true },
            )
            .exec();

        if (!teacher) {
            throw new NotFoundException('Teacher profile not found');
        }

        return teacher;
    }

    private toObjectId(
        id?: string | Schema.Types.ObjectId,
    ): Schema.Types.ObjectId | undefined {
        if (!id) return undefined;
        return typeof id === 'string' ? new Schema.Types.ObjectId(id) : id;
    }

    async findAllWithUser(query: {
        offset?: number;
        limit?: number;
        email?: string;
        emailContains?: string;
    }): Promise<PaginatedResult<TeacherWithUser>> {
        const { offset = 0, limit = 10, email, emailContains } = query;

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    // join with users
                    from: 'user',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
        ];

        const match = {};

        if (email) {
            match['user.email'] = email;
        }

        if (emailContains) {
            match['user.email'] = {
                $regex: emailContains,
                $options: 'i',
            };
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        pipeline.push({
            $project: {
                _id: 1,
                userId: '$user._id',
                name: '$user.name',
                lastName: '$user.lastName',
                email: '$user.email',
                birthday: '$user.birthday',
                photo: '$user.photo',
                state: '$user.state',
                documentNumber: 1,
                residentialAddress: 1,
                professionalTitle: 1,
                professionalLicenseNumber: 1,
                createdAt: 1,
            },
        });

        pipeline.push({
            $facet: {
                data: [{ $skip: offset }, { $limit: limit }],
                total: [{ $count: 'count' }],
            },
        });

        const result = await this.teacherModel.aggregate(pipeline).exec();

        const data: TeacherWithUser[] = result[0]?.data || [];
        const total: number = result[0]?.total[0]?.count || 0;
        return {
            data,
            total,
            offset,
            limit,
        };
    }
}
