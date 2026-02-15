import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRoleRepository } from '../user-role/user-role.repository';
import { RolePermissionRepository } from '../role-permission/role-permission.repository';
import { RoleRepository } from '../roles/role.repository';
import { PermissionRepository } from '../permission/permission.repository';
import { IRole, RoleName } from '../roles/role.interface';
import { IPermission } from '../permission/permission.interface';

@Injectable()
export class RbacService {
    private readonly logger = new Logger(RbacService.name);

    constructor(
        private readonly userRoleRepo: UserRoleRepository,
        private readonly rolePermissionRepo: RolePermissionRepository,
        private readonly roleRepo: RoleRepository,
        private readonly permissionRepo: PermissionRepository,
    ) {}

    async assignRoleToUser(
        userId: string,
        roleName: RoleName,
        assignedBy?: string,
    ): Promise<void> {
        const role = await this.roleRepo.findByName(roleName);
        if (!role) {
            throw new NotFoundException(`Role ${roleName} not found`);
        }

        await this.userRoleRepo.assignRole(userId, role._id, assignedBy);
        this.logger.log(`Assigned role ${roleName} to user ${userId}`);
    }

    async removeRoleFromUser(
        userId: string,
        roleName: RoleName,
    ): Promise<void> {
        const role = await this.roleRepo.findByName(roleName);
        if (!role) {
            throw new NotFoundException(`Role ${roleName} not found`);
        }

        const removed = await this.userRoleRepo.removeRole(userId, role._id);
        if (removed) {
            this.logger.log(`Removed role ${roleName} from user ${userId}`);
        }
    }

    async getUserRoles(userId: string): Promise<IRole[]> {
        const userRoles = await this.userRoleRepo.getUserRoles(userId);
        return userRoles.map((ur) => ur.roleId as any as IRole);
    }

    async getUserPermissions(userId: string): Promise<IPermission[]> {
        // 1. Obtener roles del usuario
        const userRoles = await this.userRoleRepo.getUserRoles(userId);

        if (userRoles.length === 0) {
            return [];
        }

        // 2. Obtener permisos de cada rol
        const roleIds = userRoles.map((ur) =>
            (ur.roleId as any)._id.toString(),
        );

        const permissionsMap = new Map<string, IPermission>();

        for (const roleId of roleIds) {
            const rolePermissions =
                await this.rolePermissionRepo.getRolePermissions(roleId);

            rolePermissions.forEach((rp) => {
                const permission = rp.permissionId as any as IPermission;
                if (permission && permission._id) {
                    permissionsMap.set(permission._id.toString(), permission);
                }
            });
        }

        return Array.from(permissionsMap.values());
    }

    async assignPermissionToRole(
        roleName: RoleName,
        permissionName: string,
    ): Promise<void> {
        const role = await this.roleRepo.findByName(roleName);
        if (!role) {
            throw new NotFoundException(`Role ${roleName} not found`);
        }

        const permission = await this.permissionRepo.findByName(permissionName);
        if (!permission) {
            throw new NotFoundException(
                `Permission ${permissionName} not found`,
            );
        }

        await this.rolePermissionRepo.assignPermission(
            role._id,
            permission._id,
        );
        this.logger.log(
            `Assigned permission ${permissionName} to role ${roleName}`,
        );
    }

    async getRolePermissions(roleName: RoleName): Promise<IPermission[]> {
        const role = await this.roleRepo.findByName(roleName);
        if (!role) {
            throw new NotFoundException(`Role ${roleName} not found`);
        }

        const rolePermissions =
            await this.rolePermissionRepo.getRolePermissions(role._id);
        return rolePermissions.map(
            (rp) => rp.permissionId as any as IPermission,
        );
    }
}
