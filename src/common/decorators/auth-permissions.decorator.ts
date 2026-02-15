import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from '../../rbac/decorators/permission.decorator';
import { Roles } from '../../rbac/decorators/role.decorator';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { RolesGuard } from '../../rbac/guards/roles.guard';
import {
    ActionType,
    ResourceType,
} from '../../rbac/permission/permission.interface';
import { RoleName } from '../../rbac/roles/role.interface';

export function AuthPermissions(
    resource: ResourceType,
    action: ActionType,
    roles: RoleName[] = [],
) {
    return applyDecorators(
        Roles(...roles),
        RequirePermission(resource, action),
        UseGuards(RolesGuard, PermissionsGuard),
        ApiBearerAuth('accessToken'),
    );
}
