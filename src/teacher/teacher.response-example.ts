import { ApiResponseNoStatusOptions } from '@nestjs/swagger';

export namespace ServiceResponse {
    export const findAllTeacherSuccess: ApiResponseNoStatusOptions = {
        description: 'Successfully',
        schema: {
            example: {
                success: true,
                data: {
                    metadata: {
                        total: 1,
                        limit: 10,
                        offset: 0,
                    },
                    teachers: [
                        {
                            _id: '698a5a2663b79cc7ea5b0b10',
                            userId: '698a5a2663b79cc7ea5b0b0d',
                            name: 'Angie Alexandra',
                            lastName: 'Carreño Bayona',
                            email: 'correo@gmail.com',
                            birthday: '2004-04-12T00:00:00.000Z',
                            photo: '/storage/users/8ee0fc51-8fdb-49f9-869d-a291fa65821f.jpeg',
                            documentNumber: '1007438902',
                            residentialAddress: 'Cra 15 #16-05',
                            professionalTitle: 'Ingeniería de Sistemas',
                            professionalLicenseNumber: '1234643135',
                            state: true,
                            createdAt: '2026-02-09T22:05:26.542Z',
                        },
                    ],
                },
                error: {},
            },
        },
    };
}
