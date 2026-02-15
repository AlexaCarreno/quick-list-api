export namespace ServiceResponse {
    export const signupStepOneSuccess = {
        description: '',
        schema: {
            example: {
                success: true,
                data: {
                    newUser: {
                        _id: '682bb97d962fe2751faea59a',
                        roleId: '682ba674657c18d8a5f6a25e',
                        name: 'ANDRES FELIPE',
                        lastName: 'GALVIS PEREIRA',
                        birthday: '2000-08-30T00:00:00.000Z',
                        email: 'afgalvispereira@gmail.com',
                        createdAt: '2025-05-19T23:06:37.256Z',
                        photo: '',
                        state: true,
                    },
                },
                error: {},
            },
        },
    };

    export const signupStepOneConflict = {
        description: 'Conflict',
        schema: {
            example: {
                success: false,
                data: {},
                error: {
                    message:
                        "E-mail 'afgalvispereira@gmail.com' is already registered.",
                    details: 'Conflict',
                },
            },
        },
    };

    export const signupSteoTwoSuccess = {
        description: 'operation_success',
        schema: {
            example: {
                success: true,
                data: {
                    message: 'Verificación completada exitosamente.',
                    tokens: {
                        accessToken:
                            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODJiYjk3ZDk2MmZlMjc1MWZhZWE1OWEiLCJyb2xlIjoiY29tbW9uIiwiaWF0IjoxNzQ3Njk2MjE2LCJleHAiOjE3NDc2OTcxMTYsImlzcyI6InF1aWNrTGlzdCJ9.Owuv6jA1SYzW6PN5LUdpes09_zJlJqyWUyR8AwbboDclx9Bv3OgPhlVO0ZUvdTzPehryo8hTKAm7xIpILSmksT-QtMPxHw-VRe0wiSc_bG7ov2ZqO3Bm9liv3aoLT40f9-PleAku0T9C3LSxheNkDYrWZXZU6ylw498BKM9zgjMGGZcvC8W7Yhzr4kDuQdrqWTs_CY-pHoj7ZBdlduhWNQG6mceecCiKTC6QqOmazXZHa3I5gMrmL55bIMKcKslhKU6rJn5xT8UeLVeCJiRm4CCLrmpe6B6pz2HIZL6waw4OtdS9rTtpBjHD2gOhoohzmu20kmiknG_T1VVEaFVNmQ',
                        refreshToken:
                            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODJiYjk3ZDk2MmZlMjc1MWZhZWE1OWEiLCJzZXNzaW9uSWQiOiI2ODJiYmE1ODNlYmZiYzIwY2RkNzJhMjciLCJpYXQiOjE3NDc2OTYyMTYsImV4cCI6MTc0NzY5NzExNiwiaXNzIjoicXVpY2tMaXN0In0.WM95maqIMZpjkWpp3rJ9WsgvsyPPQQzKXU4X08qUVYg',
                    },
                },
                error: {},
            },
        },
    };

    export const resendCodeSuccess = {
        description: 'operation_success',
        schema: {
            example: {
                success: true,
                data: {
                    message: 'code_sent_successfully',
                },
                error: {},
            },
        },
    };
    export const resendCodeBadRequest = {
        description: 'BadRequest',
        schema: {
            example: {
                success: false,
                data: {},
                error: {
                    message: 'El usuario ya se encuentra verificado.',
                    details: 'Bad Request',
                },
            },
        },
    };
}
