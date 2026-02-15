import { Schema } from 'mongoose';
import { IRolePermission } from './role-permission.interface';
import { ROLE_MODEL_NAME } from '../roles/role.interface';
import { PERMISSION_MODEL_NAME } from '../permission/permission.interface';

export const RolePermissionSchema = new Schema<IRolePermission>(
    {
        roleId: {
            type: Schema.Types.ObjectId,
            ref: ROLE_MODEL_NAME,
            required: true,
            index: true,
        },
        permissionId: {
            type: Schema.Types.ObjectId,
            ref: PERMISSION_MODEL_NAME,
            required: true,
            index: true,
        },
        assignedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

// Índice compuesto único para evitar duplicados
RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });
