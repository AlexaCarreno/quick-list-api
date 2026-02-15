import { ApiResponseNoStatusOptions } from '@nestjs/swagger';

export namespace ServiceResponse {
    export const findCurrentPermissions: ApiResponseNoStatusOptions = {
        description: 'Successfully',
        schema: {
            example: {
                success: true,
                data: {
                    userId: '698a4a73450c602f8b794930',
                    roles: ['admin'],
                    permissions: [
                        {
                            name: 'users.create',
                            resource: 'users',
                            action: 'create',
                        },
                        {
                            name: 'users.read',
                            resource: 'users',
                            action: 'read',
                        },
                        {
                            name: 'users.update',
                            resource: 'users',
                            action: 'update',
                        },
                        {
                            name: 'users.delete',
                            resource: 'users',
                            action: 'delete',
                        },
                        {
                            name: 'users.manage',
                            resource: 'users',
                            action: 'manage',
                        },
                    ],
                },
                error: {},
            },
        },
    };
}
