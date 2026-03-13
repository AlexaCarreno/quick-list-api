import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    IStudentGroup,
    IStudentGroupWithStudent,
    STUDENT_GROUP_MODEL_NAME,
} from './student-group.interface';
import { ClientSession, Model } from 'mongoose';
import { GetGroupStudentsQueryDto } from './student-group.dto';

@Injectable()
export class StudentGroupRepository {
    constructor(
        @InjectModel(STUDENT_GROUP_MODEL_NAME)
        private readonly studentGroupModel: Model<IStudentGroup>,
    ) {}

    async create(
        data: Partial<IStudentGroup>,
        session?: ClientSession,
    ): Promise<IStudentGroup> {
        const [studentGroup] = await this.studentGroupModel.create([data], {
            session,
        });
        return studentGroup;
    }

    async findByStudentAndGroup(
        studentId: string,
        groupId: string,
    ): Promise<IStudentGroup | null> {
        return this.studentGroupModel.findOne({ studentId, groupId }).exec();
    }

    async findByGroupId(
        groupId: string,
        query: GetGroupStudentsQueryDto,
    ): Promise<{ students: IStudentGroupWithStudent[]; total: number }> {
        const { limit = 10, offset = 0, name, documentNumber, career } = query;

        const matchStage: Record<string, any> = {
            groupId: new (require('mongoose').Types.ObjectId)(groupId),
        };

        const studentFilter: Record<string, any> = {};
        if (name)
            studentFilter['studentId.name'] = { $regex: name, $options: 'i' };
        if (documentNumber)
            studentFilter['studentId.documentNumber'] = {
                $regex: documentNumber,
                $options: 'i',
            };
        if (career)
            studentFilter['studentId.career'] = {
                $regex: career,
                $options: 'i',
            };

        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'student',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentId',
                },
            },
            { $unwind: '$studentId' },
            ...(Object.keys(studentFilter).length > 0
                ? [{ $match: studentFilter }]
                : []),
            {
                $facet: {
                    data: [
                        { $skip: offset },
                        { $limit: limit },
                        { $sort: { createdAt: -1 } },
                    ],
                    total: [{ $count: 'count' }],
                },
            },
        ];

        const [result] = await this.studentGroupModel
            .aggregate(pipeline)
            .exec();

        return {
            students: result.data as IStudentGroupWithStudent[],
            total: result.total[0]?.count ?? 0,
        };
    }

    async updateById(
        id: string,
        data: Partial<IStudentGroup>,
        session?: ClientSession,
    ): Promise<IStudentGroup | null> {
        return this.studentGroupModel
            .findByIdAndUpdate(id, { $set: data }, { new: true, session })
            .exec();
    }

    async deleteById(id: string, session?: ClientSession): Promise<void> {
        await this.studentGroupModel.findByIdAndDelete(id, { session }).exec();
    }

    async countByGroupId(groupId: string): Promise<number> {
        return this.studentGroupModel.countDocuments({ groupId }).exec();
    }

    async existsByGroupId(groupId: string): Promise<boolean> {
        const count = await this.countByGroupId(groupId);
        return count > 0;
    }
}
