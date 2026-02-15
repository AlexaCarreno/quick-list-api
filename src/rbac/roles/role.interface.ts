export const ROLE_MODEL_NAME = 'Role';
export const ROLE_COLLECTION_NAME = 'rbac-roles';

export enum RoleName {
    ADMIN = 'admin',
    TEACHER = 'teacher',
    // ESTUDIANTE = 'estudiante',
}

export interface IRole {
    _id: string;
    name: RoleName;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
