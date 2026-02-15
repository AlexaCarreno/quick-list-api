import { Schema } from 'mongoose';
import { IRefreshToken, ISesion } from './session.interfaces';

const SessionSchema = new Schema<ISesion>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
        },
        ip: {
            type: String,
            required: false,
        },
        platform: {
            type: String,
            required: false,
        },
        os: {
            type: String,
            required: false,
        },
        lastUsedAt: {
            type: Date,
            required: false,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 },
        },
        isActive: { type: Boolean, default: true },
        revokedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false },
);

SessionSchema.index({ userId: 1 });

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        sessionId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        prevToken: {
            type: String,
            required: false,
            trim: true,
            index: true,
        },
        revoked: { type: Boolean, default: false },
        revokedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false },
);

export { RefreshTokenSchema, SessionSchema };
