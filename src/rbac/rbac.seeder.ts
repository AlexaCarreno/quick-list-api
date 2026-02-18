import { Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from './roles/role.repository';
import { PermissionRepository } from './permission/permission.repository';
import { RolePermissionRepository } from './role-permission/role-permission.repository';
import { ActionType, ResourceType } from './permission/permission.interface';
import { RoleName } from './roles/role.interface';

@Injectable()
export class RbacSeeder {
    private readonly logger = new Logger(RbacSeeder.name);

    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly permissionRepository: PermissionRepository,
        private readonly rolePermissionRepository: RolePermissionRepository,
    ) {}

    async seed(): Promise<void> {
        this.logger.log('🌱 Starting RBAC seeding...');

        const permissions = await this.seedPermissions();
        await this.seedRoles();
        await this.assignPermissionsToRoles(permissions);

        this.logger.log('✅ RBAC seeding completed successfully');
    }

    private async seedPermissions() {
        this.logger.log('Creating permissions...');

        const permissionsData = [
            // Users
            {
                name: 'users.access',
                resource: ResourceType.USERS,
                action: ActionType.CREATE,
                description: 'Access user module',
            },
            {
                name: 'users.create',
                resource: ResourceType.USERS,
                action: ActionType.CREATE,
                description: 'Create users',
            },
            {
                name: 'users.read',
                resource: ResourceType.USERS,
                action: ActionType.READ,
                description: 'Read users',
            },
            {
                name: 'users.update',
                resource: ResourceType.USERS,
                action: ActionType.UPDATE,
                description: 'Update users',
            },
            {
                name: 'users.delete',
                resource: ResourceType.USERS,
                action: ActionType.DELETE,
                description: 'Delete users',
            },
            {
                name: 'users.manage',
                resource: ResourceType.USERS,
                action: ActionType.MANAGE,
                description: 'Full user management',
            },

            // Roles
            {
                name: 'roles.access',
                resource: ResourceType.ROLES,
                action: ActionType.ACCESS,
                description: 'Access roles module',
            },
            {
                name: 'roles.create',
                resource: ResourceType.ROLES,
                action: ActionType.CREATE,
                description: 'Create roles',
            },
            {
                name: 'roles.read',
                resource: ResourceType.ROLES,
                action: ActionType.READ,
                description: 'Read roles',
            },
            {
                name: 'roles.update',
                resource: ResourceType.ROLES,
                action: ActionType.UPDATE,
                description: 'Update roles',
            },
            {
                name: 'roles.delete',
                resource: ResourceType.ROLES,
                action: ActionType.DELETE,
                description: 'Delete roles',
            },
            {
                name: 'roles.manage',
                resource: ResourceType.ROLES,
                action: ActionType.MANAGE,
                description: 'Full role management',
            },

            // Groups
            {
                name: 'groups.access',
                resource: ResourceType.GROUPS,
                action: ActionType.ACCESS,
                description: 'Access groups module',
            },
            {
                name: 'groups.create',
                resource: ResourceType.GROUPS,
                action: ActionType.CREATE,
                description: 'Create groups',
            },
            {
                name: 'groups.read',
                resource: ResourceType.GROUPS,
                action: ActionType.READ,
                description: 'Read groups',
            },
            {
                name: 'groups.update',
                resource: ResourceType.GROUPS,
                action: ActionType.UPDATE,
                description: 'Update groups',
            },
            {
                name: 'groups.delete',
                resource: ResourceType.GROUPS,
                action: ActionType.DELETE,
                description: 'Delete groups',
            },
            {
                name: 'groups.manage',
                resource: ResourceType.GROUPS,
                action: ActionType.MANAGE,
                description: 'Full groups management',
            },

            // Students
            {
                name: 'students.access',
                resource: ResourceType.STUDENTS,
                action: ActionType.ACCESS,
                description: 'Access students module',
            },
            {
                name: 'students.create',
                resource: ResourceType.STUDENTS,
                action: ActionType.CREATE,
                description: 'Create students',
            },
            {
                name: 'students.read',
                resource: ResourceType.STUDENTS,
                action: ActionType.READ,
                description: 'Read students',
            },
            {
                name: 'students.update',
                resource: ResourceType.STUDENTS,
                action: ActionType.UPDATE,
                description: 'Update students',
            },
            {
                name: 'students.delete',
                resource: ResourceType.STUDENTS,
                action: ActionType.DELETE,
                description: 'Delete students',
            },
            {
                name: 'students.manage',
                resource: ResourceType.STUDENTS,
                action: ActionType.MANAGE,
                description: 'Full students management',
            },

            // attendance
            {
                name: 'attendance.access',
                resource: ResourceType.ATTENDANCE,
                action: ActionType.ACCESS,
                description: 'Access attendance module',
            },
            {
                name: 'attendance.create',
                resource: ResourceType.ATTENDANCE,
                action: ActionType.CREATE,
                description: 'Create attendance',
            },
            {
                name: 'attendance.read',
                resource: ResourceType.ATTENDANCE,
                action: ActionType.READ,
                description: 'Read attendance',
            },
            {
                name: 'attendance.update',
                resource: ResourceType.ATTENDANCE,
                action: ActionType.UPDATE,
                description: 'Update attendance',
            },
            {
                name: 'attendance.delete',
                resource: ResourceType.ATTENDANCE,
                action: ActionType.DELETE,
                description: 'Delete attendance',
            },
            {
                name: 'attendance.manage',
                resource: ResourceType.ATTENDANCE,
                action: ActionType.MANAGE,
                description: 'Full attendance management',
            },
        ];

        const createdPermissions = new Map();

        for (const perm of permissionsData) {
            const existing = await this.permissionRepository.findByName(
                perm.name,
            );
            if (!existing) {
                const created = await this.permissionRepository.create(
                    perm.name,
                    perm.resource,
                    perm.action,
                    perm.description,
                );
                createdPermissions.set(perm.name, created);
                this.logger.log(`✓ Created permission: ${perm.name}`);
            } else {
                createdPermissions.set(perm.name, existing);
                this.logger.log(`- Permission already exists: ${perm.name}`);
            }
        }

        return createdPermissions;
    }

    private async seedRoles() {
        this.logger.log('Creating roles...');

        const rolesData = [
            {
                name: RoleName.ADMIN,
                description: 'Administrator with full system access',
            },
            {
                name: RoleName.TEACHER,
                description:
                    'Teacher with groups, students, and attendance management',
            },
            // {
            //     name: RoleName.ESTUDIANTE,
            //     description: 'Student with read-only access',
            // },
        ];

        for (const roleData of rolesData) {
            const existing = await this.roleRepository.findByName(
                roleData.name,
            );
            if (!existing) {
                await this.roleRepository.create(
                    roleData.name,
                    roleData.description,
                );
                this.logger.log(`✓ Created role: ${roleData.name}`);
            } else {
                this.logger.log(`- Role already exists: ${roleData.name}`);
            }
        }
    }

    private async assignPermissionsToRoles(permissions: Map<string, any>) {
        this.logger.log('Assigning permissions to roles...');

        // ADMIN - Todos los permisos
        const adminRole = await this.roleRepository.findByName(RoleName.ADMIN);
        if (adminRole) {
            const allPermissionIds = Array.from(permissions.values()).map((p) =>
                p._id.toString(),
            );
            await this.rolePermissionRepository.assignMultiplePermissions(
                adminRole._id,
                allPermissionIds,
            );
            this.logger.log(
                `✓ Assigned ${allPermissionIds.length} permissions to ADMIN`,
            );
        }

        // DOCENTE - Permisos de cursos, calificaciones y contenido
        const docenteRole = await this.roleRepository.findByName(
            RoleName.TEACHER,
        );
        if (docenteRole) {
            const docentePermissions = [
                'users.read',
                'roles.read',
                // 'groups.create',
                'groups.read',
                // 'groups.update',
                // 'groups.delete',
                // 'students.create',
                'students.access',
                'students.read',
                'students.update',
                // 'students.delete',
                'attendance.access',
                'attendance.create',
                'attendance.read',
                'attendance.update',
                // 'attendance.delete',
            ];

            const permissionIds = docentePermissions
                .map((name) => permissions.get(name)?._id.toString())
                .filter(Boolean);

            await this.rolePermissionRepository.assignMultiplePermissions(
                docenteRole._id,
                permissionIds,
            );
            this.logger.log(
                `✓ Assigned ${permissionIds.length} permissions to DOCENTE`,
            );
        }

        // ESTUDIANTE - Solo lectura
        // const estudianteRole = await this.roleRepository.findByName(
        //     RoleName.ESTUDIANTE,
        // );
        // if (estudianteRole) {
        //     const estudiantePermissions = [
        //         'courses.read',
        //         'grades.read',
        //         'content.read',
        //     ];

        //     const permissionIds = estudiantePermissions
        //         .map((name) => permissions.get(name)?._id.toString())
        //         .filter(Boolean);

        //     await this.rolePermissionRepository.assignMultiplePermissions(
        //         estudianteRole._id,
        //         permissionIds,
        //     );
        //     this.logger.log(
        //         `✓ Assigned ${permissionIds.length} permissions to ESTUDIANTE`,
        //     );
        // }
    }
}
