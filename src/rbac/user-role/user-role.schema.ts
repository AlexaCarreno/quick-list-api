import { Schema } from 'mongoose';
import { IUserRole } from './user-role.interface';
import { USER_MODEL_NAME } from '../../user/user.interface';
import { ROLE_MODEL_NAME } from '../roles/role.interface';

export const UserRoleSchema = new Schema<IUserRole>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required: true,
            index: true,
        },
        roleId: {
            type: Schema.Types.ObjectId,
            ref: ROLE_MODEL_NAME,
            required: true,
            index: true,
        },
        assignedAt: {
            type: Date,
            default: Date.now,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required: false,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

// Índice compuesto único para evitar duplicados
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
