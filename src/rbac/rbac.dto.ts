import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActionType, ResourceType } from './permission/permission.interface';
import { RoleName } from './roles/role.interface';

export class AssignRoleDto {
    @IsEnum(RoleName)
    roleName: RoleName;
}

export class CheckPermissionDto {
    @IsString()
    userId: string;

    @IsEnum(ResourceType)
    resource: ResourceType;

    @IsEnum(ActionType)
    action: ActionType;

    @IsOptional()
    @IsString()
    resourceId?: string;
}
