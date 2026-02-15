export namespace ServiceResponse {
    // ------------  Groups reponses ----------------
    export const createGroupSuccess = {
        description: 'Successfully',
        schema: {
            example: {
                success: true,
                data: {
                    _id: '6820df945141f8bbb55cb96d',
                    institutionName: 'Unidades Tecgnologicas de Santander',
                    subject: 'Arquitectura de software',
                    referenceCode: 'E-195',
                    status: 'active',
                    createdAt: '2025-05-11T17:34:12.180Z',
                    updatedAt: '2025-05-11T17:34:12.180Z',
                },
                error: {},
            },
        },
    };

    export const groupBadRequest = {
        description: 'Solicitud inválida: errores de validación',
        schema: {
            example: {
                success: false,
                data: {},
                error: {
                    message: [
                        'referenceCode should not be empty',
                        'referenceCode must be a string',
                    ],
                    details: 'Bad Request',
                },
            },
        },
    };

    export const findOneGroupSuccess = {
        description: 'Successfully',
        schema: {
            example: {
                success: true,
                data: {
                    _id: '6820df945141f8bbb55cb96d',
                    userId: '70ee78bf-40d2-4cd3-8df8-2ac7f44c39fb',
                    institutionName: 'Unidades Tecgnologicas de Santander',
                    subject: 'Arquitectura de software',
                    referenceCode: 'E-195',
                    status: 'active',
                    createdAt: '2025-05-11T17:34:12.180Z',
                    updatedAt: '2025-05-11T17:34:12.180Z',
                },
                error: {},
            },
        },
    };
    export const groupNotFound = {
        description: 'Not Found',
        schema: {
            example: {
                success: false,
                data: {},
                error: {
                    message:
                        "El grupo con Id: '6820df945141f8bbb55cb96f' no fue encontrado.",
                    details: 'Not Found',
                },
            },
        },
    };

    export const getAllGroupsSuccess = {
        description: 'Successfully',
        schema: {
            example: {
                success: true,
                data: [
                    {
                        _id: '6820df945141f8bbb55cb96d',
                        institutionName: 'Unidades Tecgnologicas de Santander',
                        subject: 'Arquitectura de software',
                        referenceCode: 'E-195',
                        status: 'active',
                        createdAt: '2025-05-11T17:34:12.180Z',
                        updatedAt: '2025-05-11T17:34:12.180Z',
                    },
                    {
                        _id: '6820e5c7a720618da9e4d2ff',
                        institutionName: 'Unidades Tecnológicas de Santander',
                        subject: 'Programación web',
                        referenceCode: 'E-111',
                        status: 'active',
                        createdAt: '2025-05-11T18:00:39.685Z',
                        updatedAt: '2025-05-11T18:00:39.685Z',
                    },
                ],
                error: {},
            },
        },
    };

    export const updateGroupSuccess = {
        description: 'Successfuly',
        schema: {
            example: {
                success: true,
                data: {
                    _id: '6820e5c7a720618da9e4d2ff',
                    institutionName: 'Eliseo Pinilla RueDa',
                    subject: 'Matematicas',
                    referenceCode: 'salon 11-B',
                    status: 'archived',
                    createdAt: '2025-05-11T18:00:39.685Z',
                    updatedAt: '2025-05-16T15:19:36.835Z',
                },
                error: {},
            },
        },
    };
}
