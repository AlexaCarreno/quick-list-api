import { Schema } from 'mongoose';

export const STUDENT_ATTENDANCE_MODEL_NAME = 'StudentAttendance';
export const STUDENT_ATTENDANCE_COLLECTION_NAME = 'student_attendance';

export enum StudentAttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    EXCUSED = 'excused',
}

export enum AttendanceMethod {
    FACIAL = 'facial',
    MANUAL = 'manual',
}

export interface IStudentAttendance {
    _id?: Schema.Types.ObjectId;
    attendanceId: Schema.Types.ObjectId;
    studentId: Schema.Types.ObjectId;
    status: StudentAttendanceStatus;
    method: AttendanceMethod;
    recognitionTime?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Para respuestas con datos del estudiante populados
export interface IStudentAttendanceWithStudent extends Omit<
    IStudentAttendance,
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
        photo?: string;
    };
}
