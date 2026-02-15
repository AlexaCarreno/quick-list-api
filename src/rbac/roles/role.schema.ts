import { Schema } from 'mongoose';
import { IRole, RoleName } from './role.interface';

export const RoleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            enum: Object.values(RoleName),
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

RoleSchema.index({ name: 1 }, { unique: true });
