import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
    PermissionMetadata,
    PERMISSIONS_KEY,
} from '../decorators/permission.decorator';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authorizationService: AuthorizationService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permission = this.reflector.getAllAndOverride<PermissionMetadata>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!permission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.userId) {
            return false;
        }

        return await this.authorizationService.checkPermission(user.userId, {
            resource: permission.resource,
            action: permission.action,
        });
    }
}
