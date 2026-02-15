import { IBaseEntity } from 'src/common/interfaces/common.interfaces';

export const SESION_MODEL_NAME = 'Session';
export const SESION_COLLECTION_NAME = 'session';

export interface ISesion extends IBaseEntity {
    userId: string;
    ip: string;
    platform?: string;
    os?: string;
    lastUsedAt?: Date;
    expiresAt?: Date;
    isActive?: boolean
    revokedAt?: Date
}

export const REFRESH_TOKEN_MODEL_NAME = 'RefreshToken';
export const REFRESH_TOKEN_COLLECTION_NAME = 'refresh_token';
export interface IRefreshToken extends IBaseEntity {
    userId: string;
    sessionId?: string;
    token?: string;
    prevToken?: string;
    revoked?: boolean
    revokedAt?: Date
}
