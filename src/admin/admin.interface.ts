import { Schema } from 'mongoose';
import { IBaseEntity } from '../common/interfaces/common.interfaces';

export const ADMIN_MODEL_NAME = 'Admin';
export const ADMIN_COLLECTION_NAME = 'admin';

export interface IAdmin extends IBaseEntity {
    userId: string | Schema.Types.ObjectId;
    documentNumber?: string;
    residential_address?: string;
    position?: string;
    department?: string;
}

export interface AdminWithUser {
    _id: string;
    userId: string;
    name: string;
    lastName: string;
    email: string;
    birthday: Date;
    photo?: string;
    state?: boolean;
    documentNumber?: string;
    residential_address?: string;
    position?: string;
    department?: string;
    createdAt: Date;
}