import { Schema } from 'mongoose';

export const USER_ROLE_MODEL_NAME = 'UserRole';
export const USER_ROLE_COLLECTION_NAME = 'user_role';

export interface IUserRole {
    _id: string;
    userId: string | Schema.Types.ObjectId;
    roleId: string | Schema.Types.ObjectId;
    assignedAt: Date;
    assignedBy?: string | Schema.Types.ObjectId; // ID del admin que asignó el rol
}
