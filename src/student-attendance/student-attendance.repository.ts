import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GetStudentAttendancesQueryDto } from './student-attendance.dto';
import {
    IStudentAttendance,
    IStudentAttendanceWithStudent,
    STUDENT_ATTENDANCE_MODEL_NAME,
} from './student-attendance.interface';

@Injectable()
export class StudentAttendanceRepository {
    constructor(
        @InjectModel(STUDENT_ATTENDANCE_MODEL_NAME)
        private readonly studentAttendanceModel: Model<IStudentAttendance>,
    ) {}

    async create(
        data: Partial<IStudentAttendance>,
        session?: ClientSession,
    ): Promise<IStudentAttendance> {
        const [studentAttendance] = await this.studentAttendanceModel.create(
            [data],
            { session },
        );
        return studentAttendance;
    }

    async insertMany(
        data: Partial<IStudentAttendance>[],
        session?: ClientSession,
    ): Promise<IStudentAttendance[]> {
        return await this.studentAttendanceModel.insertMany(data, { session });
    }

    async findById(id: string): Promise<IStudentAttendance | null> {
        return this.studentAttendanceModel.findById(id).exec();
    }

    async findByAttendanceAndStudent(
        attendanceId: string,
        studentId: string,
    ): Promise<IStudentAttendance | null> {
        return this.studentAttendanceModel
            .findOne({ attendanceId, studentId })
            .exec();
    }

    async updateById(
        id: string,
        data: Partial<IStudentAttendance>,
        session?: ClientSession,
    ): Promise<IStudentAttendance | null> {
        return this.studentAttendanceModel
            .findByIdAndUpdate(id, { $set: data }, { new: true, session })
            .exec();
    }

    async findByAttendanceId(
        attendanceId: string,
        query: GetStudentAttendancesQueryDto,
    ): Promise<{
        students: IStudentAttendanceWithStudent[];
        total: number;
    }> {
        const { limit = 10, offset = 0, name, status } = query;

        const matchStage: Record<string, any> = {
            attendanceId: new Types.ObjectId(attendanceId),
        };

        const studentFilter: Record<string, any> = {};
        if (name)
            studentFilter['studentId.name'] = { $regex: name, $options: 'i' };
        if (status) matchStage.status = status;

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
                        { $sort: { 'studentId.name': 1 } },
                        { $skip: offset },
                        { $limit: limit },
                    ],
                    total: [{ $count: 'count' }],
                },
            },
        ];

        const [result] = await this.studentAttendanceModel
            .aggregate(pipeline)
            .exec();

        return {
            students: result.data as IStudentAttendanceWithStudent[],
            total: result.total[0]?.count ?? 0,
        };
    }

    async countPresentByAttendanceId(attendanceId: string): Promise<number> {
        return this.studentAttendanceModel
            .countDocuments({
                attendanceId,
                status: { $in: ['present', 'late'] },
            })
            .exec();
    }

    async existsByAttendanceId(attendanceId: string): Promise<boolean> {
        const count = await this.studentAttendanceModel
            .countDocuments({
                attendanceId,
            })
            .exec();
        return count > 0;
    }

    async deleteByAttendanceId(
        attendanceId: string,
        session?: ClientSession,
    ): Promise<void> {
        await this.studentAttendanceModel
            .deleteMany({ attendanceId }, { session })
            .exec();
    }

    async findByAttendanceIds(
        attendanceIds: string[],
    ): Promise<IStudentAttendance[]> {
        return this.studentAttendanceModel
            .find({
                attendanceId: {
                    $in: attendanceIds.map((id) => new Types.ObjectId(id)),
                },
            })
            .lean()
            .exec();
    }

    async findByStudentAndAttendanceIds(
        studentId: string,
        attendanceIds: string[],
    ): Promise<IStudentAttendance[]> {
        return this.studentAttendanceModel
            .find({
                studentId: new Types.ObjectId(studentId),
                attendanceId: {
                    $in: attendanceIds.map((id) => new Types.ObjectId(id)),
                },
            })
            .lean()
            .exec();
    }
}
