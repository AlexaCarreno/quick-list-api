import { ClientSession, UpdateQuery } from 'mongoose';
import { IBaseEntity } from 'src/common/interfaces/common.interfaces';

export const USER_MODEL_NAME = 'User';
export const USER_COLLECTION_NAME = 'user';
export interface IVerification {
    code: string;
    status: boolean;
    updatedAt?: Date;
}

export interface IUser extends IBaseEntity {
    name: string;
    lastName: string;
    birthday: Date;
    email: string;
    password: string;
    phone: string;
    verification?: IVerification;
    state: boolean;
    photo?: string;
    changePassword: boolean;
}

export type ICreateUser = Pick<
    IUser,
    'name' | 'lastName' | 'email' | 'password'
>;

export enum VerificationStatus {
    REQUESTED = 'requested',
    COMPLETED = 'completed',
}

export interface IUpdateUser {
    userId: string;
    dataToUpdate: Partial<IUser | UpdateQuery<IUser>>;
}

export interface IUserRepository {
    create(user: Partial<IUser>, session?: ClientSession): Promise<IUser>;
    findById(userId: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    update(params: IUpdateUser): Promise<IUser | null>;
    getUserInfo(userId: string): Promise<Partial<IUser> | null>;
}

export interface SafeUser {
    _id: string;
    name: string;
    lastName: string;
    email: string;
    photo?: string;
    state?: boolean;
    changePassword?: boolean;
    birthday?: Date;
}
