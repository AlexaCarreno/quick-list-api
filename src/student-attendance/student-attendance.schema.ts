import { Schema } from 'mongoose';
import {
    AttendanceMethod,
    IStudentAttendance,
    StudentAttendanceStatus,
} from './student-attendance.interface';
import { ATTENDANCE_MODEL_NAME } from '../attendance/attendance.interface';
import { STUDENT_MODEL_NAME } from '../students/students.interface';

export const StudentAttendanceSchema = new Schema<IStudentAttendance>(
    {
        attendanceId: {
            type: Schema.Types.ObjectId,
            ref: ATTENDANCE_MODEL_NAME,
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: STUDENT_MODEL_NAME,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(StudentAttendanceStatus),
            default: StudentAttendanceStatus.ABSENT,
        },
        method: {
            type: String,
            enum: Object.values(AttendanceMethod),
            default: AttendanceMethod.MANUAL,
        },
        recognitionTime: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Índice compuesto — un estudiante no puede tener dos registros en la misma sesión
StudentAttendanceSchema.index(
    { attendanceId: 1, studentId: 1 },
    { unique: true },
);
