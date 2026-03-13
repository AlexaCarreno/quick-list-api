import { Schema } from 'mongoose';

export const STUDENT_GROUP_MODEL_NAME = 'StudentGroup';
export const STUDENT_GROUP_COLLECTION_NAME = 'student_group';

export interface IStudentGroup {
    _id?: Schema.Types.ObjectId;
    studentId: Schema.Types.ObjectId;
    groupId: Schema.Types.ObjectId;
    allowed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Para respuestas con datos del estudiante populados
export interface IStudentGroupWithStudent extends Omit<
    IStudentGroup,
    'studentId'
> {
    studentId: {
        _id: string;
        name: string;
        lastName: string;
        email: string;
        documentNumber: string;
        birthday: Date;
        career: string;
        semester: number;
        photo?: string;
        state: boolean;
        createdAt: Date;
    };
}
