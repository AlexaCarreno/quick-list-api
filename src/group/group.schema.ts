import { Schema } from 'mongoose';
import { USER_MODEL_NAME } from '../user/user.interface';
import {
    DayOfWeek,
    GroupStatus,
    IGroup,
    ISchedule,
    Shift,
} from './group.interface';

const ScheduleSchema = new Schema<ISchedule>(
    {
        dayOfWeek: {
            type: String,
            enum: Object.values(DayOfWeek),
            required: true,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        shift: {
            type: String,
            enum: Object.values(Shift),
            required: true,
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    },
);

export const GroupSchema = new Schema<IGroup>(
    {
        referenceCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(GroupStatus),
            default: GroupStatus.ACTIVE,
        },
        color: {
            type: String,
            required: true,
            trim: true,
        },
        period: {
            type: String,
            required: true,
            trim: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        minAttendanceThreshold: {
            type: Number,
            default: 0.8,
            min: 0,
            max: 1,
        },
        schedules: {
            type: [ScheduleSchema],
            default: [],
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required: true,
        },
    },
    { timestamps: true, versionKey: false },
);
