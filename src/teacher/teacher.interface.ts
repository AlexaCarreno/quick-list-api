import { Schema } from 'mongoose';
import { IBaseEntity } from '../common/interfaces/common.interfaces';

export const TEACHER_MODEL_NAME = 'Teacher';
export const TEACHER_COLLECTION_NAME = 'teacher';

export interface ITeacher extends IBaseEntity {
    userId: string | Schema.Types.ObjectId;
    documentNumber: string;
    residentialAddress: string;
    professionalTitle: string;
    professionalLicenseNumber?: string;
}

export interface TeacherWithUser {
    _id: string;
    userId: string;
    name: string;
    lastName: string;
    email: string;
    birthday: Date;
    photo?: string;
    state?: string;
    documentNumber?: string;
    residentialAddress?: string;
    professionalTitle?: string;
    professionalLicenseNumber?: string;
    createdAt: Date;
}
