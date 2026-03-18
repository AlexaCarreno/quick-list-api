import { Schema } from 'mongoose';
import { AttendanceStatus, IAttendance } from './attendance.interface';
import { GROUP_MODEL_NAME } from '../group/group.interface';

export const AttendanceSchema = new Schema<IAttendance>(
    {
        groupId: {
            type: Schema.Types.ObjectId,
            ref: GROUP_MODEL_NAME,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        shift: {
            type: String,
            enum: ['AM', 'PM'],
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(AttendanceStatus),
            default: AttendanceStatus.OPEN,
        },
        totalExpected: {
            type: Number,
            default: 0,
        },
        totalPresent: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
