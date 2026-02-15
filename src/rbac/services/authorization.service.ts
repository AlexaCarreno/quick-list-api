import { Injectable, Logger } from '@nestjs/common';
import {
    ActionType,
    IPermission,
    IPermissionCheck,
} from '../permission/permission.interface';
import { IRole, RoleName } from '../roles/role.interface';
import { PermissionCacheService } from './permission-cache.service';
import { RbacService } from './rbac.service';

@Injectable()
export class AuthorizationService {
    private readonly logger = new Logger(AuthorizationService.name);

    constructor(
        private readonly rbacService: RbacService,
        private readonly cacheService: PermissionCacheService,
    ) {}

    async checkPermission(
        userId: string,
        check: IPermissionCheck,
    ): Promise<boolean> {
        try {
            const permissions = await this.getUserPermissions(userId);
            return this.evaluatePermissions(permissions, check);
        } catch (error) {
            this.logger.error(
                `Error checking permission: ${error.message}`,
                error.stack,
            );
            return false;
        }
    }

    async hasRole(userId: string, roleName: RoleName): Promise<boolean> {
        const roles = await this.getUserRoles(userId);
        return roles.some((role) => role.name === roleName);
    }

    async hasAnyRole(userId: string, roleNames: RoleName[]): Promise<boolean> {
        const roles = await this.getUserRoles(userId);
        const userRoleNames = roles.map((r) => r.name);
        return roleNames.some((rn) => userRoleNames.includes(rn));
    }

    async getUserPermissions(userId: string): Promise<IPermission[]> {
        const cacheKey = this.cacheService.getUserPermissionsKey(userId);
        let permissions = await this.cacheService.get<IPermission[]>(cacheKey);

        // 🆕 Verificación explícita
        if (!permissions || !Array.isArray(permissions)) {
            console.log(
                `🔄 Cache miss para permisos de usuario ${userId}, consultando BD...`,
            );
            permissions = await this.rbacService.getUserPermissions(userId);

            // 🆕 Guardar en caché incluso si está vacío
            await this.cacheService.set(cacheKey, permissions || []);
        } else {
            console.log(`✅ Cache hit para permisos de usuario ${userId}`);
        }

        return permissions || []; // 🆕 Siempre retornar array
    }

    async getUserRoles(userId: string): Promise<IRole[]> {
        const cacheKey = this.cacheService.getUserRolesKey(userId);
        let roles = await this.cacheService.get<IRole[]>(cacheKey);

        // 🆕 Verificación explícita
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            console.log(
                `Cache miss para roles de usuario ${userId}, consultando BD...`,
            );
            roles = await this.rbacService.getUserRoles(userId);

            // 🆕 Solo guardar en caché si hay roles
            if (roles && roles.length > 0) {
                await this.cacheService.set(cacheKey, roles);
            }
        } else {
            console.log(`✅ Cache hit para roles de usuario ${userId}`);
        }

        return roles || []; // 🆕 Siempre retornar array
    }

    async invalidateUserCache(userId: string): Promise<void> {
        await this.cacheService.invalidateUserCache(userId);
    }

    private evaluatePermissions(
        permissions: IPermission[],
        check: IPermissionCheck,
    ): boolean {
        return permissions.some((permission) => {
            // Exact match
            if (
                permission.resource === check.resource &&
                permission.action === check.action
            ) {
                return true;
            }

            // Wildcard permission (manage = all actions)
            if (
                permission.resource === check.resource &&
                permission.action === ActionType.MANAGE
            ) {
                return true;
            }

            return false;
        });
    }

    async getUserRoleNames(userId: string): Promise<RoleName[]> {
        const roles = await this.getUserRoles(userId);
        return roles.map((role) => role.name);
    }
}
