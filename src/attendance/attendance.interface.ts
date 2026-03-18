import { Schema } from 'mongoose';

export const ATTENDANCE_MODEL_NAME = 'Attendance';
export const ATTENDANCE_COLLECTION_NAME = 'attendance';

export enum AttendanceStatus {
    OPEN = 'open',
    CLOSED = 'closed',
}

export interface IAttendance {
    _id?: Schema.Types.ObjectId;
    groupId: Schema.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    shift: string;
    status: AttendanceStatus;
    totalExpected: number;
    totalPresent: number;
    createdBy: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
