import { Schema } from 'mongoose';
import { IStudentGroup } from './student-group.interface';

export const StudentGroupSchema = new Schema<IStudentGroup>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        groupId: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
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
