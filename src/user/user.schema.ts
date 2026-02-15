import { Schema } from 'mongoose';
import { IUser, IVerification } from './user.interface';

const VerificationSchema = new Schema<IVerification>(
    {
        code: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            required: true,
            type: Boolean,
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        _id: false,
        timestamps: false,
        versionKey: false,
    },
);

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'lastName is required'],
            trim: true,
        },
        birthday: {
            type: Date,
            default: Date.now(),
            required: true,
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'password is required'],
            trim: true,
        },
        verification: {
            type: VerificationSchema,
            required: false,
        },
        state: {
            type: Boolean,
            required: true,
            default: true,
        },
        photo: {
            type: String,
            required: false,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            required: false,
        },
        changePassword: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, versionKey: false },
);

UserSchema.index({ email: 1 }, { unique: true });

export { UserSchema, VerificationSchema };
