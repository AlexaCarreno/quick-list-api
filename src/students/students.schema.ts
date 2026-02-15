import { Schema } from 'mongoose';
import { IStudent } from './students.interface';

export const StudentSchema = new Schema<IStudent>(
    {
        groupId: { type: String, required: true },
        dni: { type: String, required: true },
        name: { type: String, required: true },
        lastName: { type: String, required: true },
        birthday: { type: Date, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        image: { type: String, required: false, default: null },
        face_encodings: {
            type: [Number],
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { versionKey: false, timestamps: true },
);
