export namespace ServiceResponse {
    export const loginSuccess = {
        description: 'operation_success',
        schema: {
            example: {
                success: true,
                data: {
                    accessToken: '<access_token>',
                    refreshToken: '<refresh_token>',
                },
                error: {},
            },
        },
    };

    export const refreshTokenUnauthorized = {
        description: 'Unauthorized',
        schema: {
            example: {
                success: false,
                data: {},
                error: {
                    message: 'Refresh token inválido o reutilizado.',
                    details: 'Unauthorized',
                },
            },
        },
    };

    export const logoutSuccess = {
        description: 'Operation_success',
        schema: {
            example: {
                success: true,
                data: {
                    message: 'Sesión finalizada correctamente',
                },
                error: {},
            },
        },
    };
    export const logoutNotFound = {
        description: 'Not_found',
        schema: {
            example: {
                success: false,
                data: {},
                error: {
                    message: 'La sesión no existe o ya fue cerrada.',
                    details: 'Not Found',
                },
            },
        },
    };
}
