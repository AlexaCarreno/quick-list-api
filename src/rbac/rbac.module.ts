import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import {
    PERMISSION_COLLECTION_NAME,
    PERMISSION_MODEL_NAME,
} from './permission/permission.interface';
import { PermissionRepository } from './permission/permission.repository';
import { PermissionSchema } from './permission/permission.schema';
import { RbacController } from './rbac.controller';
import { RbacSeeder } from './rbac.seeder';
import {
    ROLE_PERMISSION_COLLECTION_NAME,
    ROLE_PERMISSION_MODEL_NAME,
} from './role-permission/role-permission.interface';
import { RolePermissionRepository } from './role-permission/role-permission.repository';
import { RolePermissionSchema } from './role-permission/role-permission.schema';
import { ROLE_COLLECTION_NAME, ROLE_MODEL_NAME } from './roles/role.interface';
import { RoleRepository } from './roles/role.repository';
import { RoleSchema } from './roles/role.schema';
import { AuthorizationService } from './services/authorization.service';
import { PermissionCacheService } from './services/permission-cache.service';
import { RbacService } from './services/rbac.service';
import {
    USER_ROLE_COLLECTION_NAME,
    USER_ROLE_MODEL_NAME,
} from './user-role/user-role.interface';
import { UserRoleRepository } from './user-role/user-role.repository';
import { UserRoleSchema } from './user-role/user-role.schema';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ROLE_MODEL_NAME,
                schema: RoleSchema,
                collection: ROLE_COLLECTION_NAME,
            },
            {
                name: PERMISSION_MODEL_NAME,
                schema: PermissionSchema,
                collection: PERMISSION_COLLECTION_NAME,
            },
            {
                name: USER_ROLE_MODEL_NAME,
                schema: UserRoleSchema,
                collection: USER_ROLE_COLLECTION_NAME,
            },
            {
                name: ROLE_PERMISSION_MODEL_NAME,
                schema: RolePermissionSchema,
                collection: ROLE_PERMISSION_COLLECTION_NAME,
            },
        ]),
        CacheModule.register({
            ttl: 300,
        }),
    ],
    controllers: [RbacController],
    providers: [
        // Repositories
        RoleRepository,
        PermissionRepository,
        UserRoleRepository,
        RolePermissionRepository,

        // Services
        RbacService,
        AuthorizationService,
        PermissionCacheService,

        // Guards
        RolesGuard,
        PermissionsGuard,

        // seed
        RbacSeeder,
    ],
    exports: [
        RbacService,
        AuthorizationService,
        RoleRepository,
        PermissionRepository,
        RolePermissionRepository,
        RolesGuard,
        PermissionsGuard,
        RbacSeeder,
    ],
})
export class RBACModule {}
