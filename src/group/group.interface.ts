import { Schema } from 'mongoose';

export const GROUP_MODEL_NAME = 'Group';
export const GROUP_COLLECTION_NAME = 'group';

export enum GroupStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum Shift {
    AM = 'AM',
    PM = 'PM',
}

export enum DayOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
}

export interface ISchedule {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    shift: Shift;
}

export interface IGroup {
    _id?: Schema.Types.ObjectId;
    referenceCode: string;
    subject: string;
    status: GroupStatus;
    color: string;
    period: string;
    startDate: Date;
    endDate: Date;
    minAttendanceThreshold: number;
    schedules: ISchedule[];
    teacherId?: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGroupWithTeacher extends Omit<IGroup, 'teacherId'> {
    teacherId?: {
        _id: string;
        name: string;
        lastName: string;
        email: string;
    };
}
