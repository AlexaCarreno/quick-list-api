import { Schema } from 'mongoose';
import { ActionType, IPermission, ResourceType } from './permission.interface';

export const PermissionSchema = new Schema<IPermission>(
    {
        name: {
            type: String,
            required: [true, 'Permission name is required'],
            unique: true,
            trim: true,
            index: true,
        },
        resource: {
            type: String,
            required: [true, 'Resource is required'],
            enum: Object.values(ResourceType),
            trim: true,
        },
        action: {
            type: String,
            required: [true, 'Action is required'],
            enum: Object.values(ActionType),
            trim: true,
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

// Índice compuesto para búsquedas eficientes
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ name: 1 }, { unique: true });
