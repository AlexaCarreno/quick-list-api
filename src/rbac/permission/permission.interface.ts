export const PERMISSION_MODEL_NAME = 'Permission';
export const PERMISSION_COLLECTION_NAME = 'rbac-permission';

export enum ResourceType {
    USERS = 'users',
    ROLES = 'roles',
    GROUPS = 'groups',
    STUDENTS = 'students',
    ATTENDANCE = 'attendance',
    REPORTS = 'reports',
    ANALYTICS = 'analytics',
}

export enum ActionType {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage',
}

export interface IPermission {
    _id: string;
    name: string;
    resource: ResourceType;
    action: ActionType;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPermissionCheck {
    resource: ResourceType;
    action: ActionType;
    resourceId?: string;
}
