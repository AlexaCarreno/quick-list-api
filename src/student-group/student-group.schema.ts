import { Schema } from 'mongoose';
import { GROUP_MODEL_NAME } from '../group/group.interface';
import { STUDENT_MODEL_NAME } from '../students/students.interface';
import { IStudentGroup } from './student-group.interface';

export const StudentGroupSchema = new Schema<IStudentGroup>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: STUDENT_MODEL_NAME,
            required: true,
        },
        groupId: {
            type: Schema.Types.ObjectId,
            ref: GROUP_MODEL_NAME,
            required: true,
        },
        allowed: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

// Índice compuesto para evitar duplicados
// Un estudiante no puede estar dos veces en el mismo grupo
StudentGroupSchema.index({ studentId: 1, groupId: 1 }, { unique: true });
