import { Schema } from 'mongoose';
import { IStudent } from './students.interface';

export const StudentSchema = new Schema<IStudent>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        documentNumber: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        birthday: {
            type: Date,
            required: true,
        },
        career: {
            type: String,
            required: true,
            trim: true,
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        phone: {
            type: String,
            trim: true,
        },
        residentialAddress: {
            type: String,
            trim: true,
        },
        photo: {
            type: String,
        },
        faceProfileId: {
            type: String,
            default: null,
        },
        state: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
