import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthPermissions } from '../common/decorators/auth-permissions.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ActionType, ResourceType } from './permission/permission.interface';
import { ServiceResponse } from './rbac.response-example';
import { RoleName } from './roles/role.interface';
import { AuthorizationService } from './services/authorization.service';

@Controller('rbac')
export class RbacController {
    constructor(private readonly authorizationService: AuthorizationService) {}

    // Obtener mis propios roles y permisos
    @Get('me')
    @AuthPermissions(ResourceType.ROLES, ActionType.READ, [
        RoleName.ADMIN,
        RoleName.TEACHER,
    ])
    @ApiOperation({
        summary: 'obtain user roles and permissions',
        description:
            'It allows you to obtain the roles and permissions of the user who has the session token.',
    })
    @ApiOkResponse(ServiceResponse.findCurrentPermissions)
    async getMyPermissions(@CurrentUser('userId') userId: string) {
        const [roles, permissions] = await Promise.all([
            this.authorizationService.getUserRoles(userId),
            this.authorizationService.getUserPermissions(userId),
        ]);

        return {
            userId,
            roles: roles.map((r) => r.name),
            permissions: permissions.map((p) => ({
                name: p.name,
                resource: p.resource,
                action: p.action,
            })),
        };
    }
}
