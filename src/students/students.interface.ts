import { Schema } from 'mongoose';

export const STUDENT_MODEL_NAME = 'Student';
export const STUDENT_COLLECTION_NAME = 'student';

export interface IStudent {
    _id?: Schema.Types.ObjectId;
    name: string;
    lastName: string;
    email: string;
    documentNumber: string;
    birthday: Date;
    career: string; // programa académico
    semester: number; // semestre actual (1-12)
    phone?: string;
    residentialAddress?: string;
    photo?: string;
    hasFaceProfile: boolean; 
    state: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
