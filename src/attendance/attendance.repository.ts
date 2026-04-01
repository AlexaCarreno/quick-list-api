import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GetAttendancesQueryDto } from './attendance.dto';
import {
    ATTENDANCE_MODEL_NAME,
    AttendanceStatus,
    IAttendance,
} from './attendance.interface';

@Injectable()
export class AttendanceRepository {
    constructor(
        @InjectModel(ATTENDANCE_MODEL_NAME)
        private readonly attendanceModel: Model<IAttendance>,
    ) {}

    async create(
        data: Partial<IAttendance>,
        session?: ClientSession,
    ): Promise<IAttendance> {
        const [attendance] = await this.attendanceModel.create([data], {
            session,
        });
        return attendance;
    }

    async findById(id: string): Promise<IAttendance | null> {
        return this.attendanceModel.findById(id).exec();
    }

    async updateById(
        id: string,
        data: Partial<IAttendance>,
        session?: ClientSession,
    ): Promise<IAttendance | null> {
        return this.attendanceModel
            .findByIdAndUpdate(id, { $set: data }, { new: true, session })
            .exec();
    }

    async findByGroupId(
        groupId: string,
        query: GetAttendancesQueryDto,
    ): Promise<{ attendances: IAttendance[]; total: number }> {
        const { limit = 10, offset = 0, status } = query;

        const filter: Record<string, any> = { groupId };
        if (status) filter.status = status;

        const [attendances, total] = await Promise.all([
            this.attendanceModel
                .find(filter)
                .skip(offset)
                .limit(limit)
                .sort({ date: -1, createdAt: -1 })
                .exec(),
            this.attendanceModel.countDocuments(filter).exec(),
        ]);

        return { attendances, total };
    }

    async existsOpenForGroup(groupId: string): Promise<boolean> {
        const doc = await this.attendanceModel
            .findOne({
                groupId,
                status: 'open',
            })
            .exec();
        return !!doc;
    }

    async deleteById(id: string, session?: ClientSession): Promise<void> {
        await this.attendanceModel.findByIdAndDelete(id, { session }).exec();
    }

    async findByGroupIdForReport(
        groupId: string,
        dateFilter: Record<string, Date>,
    ): Promise<{ attendances: IAttendance[] }> {
        const filter: Record<string, any> = {
            groupId: new Types.ObjectId(groupId),
            status: AttendanceStatus.CLOSED,
        };

        if (Object.keys(dateFilter).length > 0) {
            filter.date = dateFilter;
        }

        const attendances = await this.attendanceModel
            .find(filter)
            .sort({ date: 1 })
            .lean()
            .exec();

        return { attendances };
    }

    async findClosedByGroupId(groupId: string): Promise<IAttendance[]> {
        return this.attendanceModel
            .find({
                groupId: new Types.ObjectId(groupId),
                status: AttendanceStatus.CLOSED,
            })
            .lean()
            .exec();
    }
}
