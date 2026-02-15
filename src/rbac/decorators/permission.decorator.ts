import { SetMetadata } from '@nestjs/common';
import { ActionType, ResourceType } from '../permission/permission.interface';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionMetadata {
    resource: ResourceType;
    action: ActionType;
}

export const RequirePermission = (resource: ResourceType, action: ActionType) =>
    SetMetadata(PERMISSIONS_KEY, { resource, action } as PermissionMetadata);
