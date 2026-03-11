import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { StorageService } from '../../common/service/storage.service';
import {
    generateAlphaNumericCode,
    hashPassword,
} from '../../common/utils/bcrypt';
import { RoleName } from '../../rbac/roles/role.interface';
import { RbacService } from '../../rbac/services/rbac.service';
import { ITeacher } from '../../teacher/teacher.interface';
import { TeacherService } from '../../teacher/teacher.service';
import { UserService } from '../../user/user.service';
import { CreateTeacherInput } from '../inputs/create-teacher.input';
import { AccountCreationStrategy } from './account-creation.strategy';

@Injectable()
export class CreateTeacherStrategy implements AccountCreationStrategy<
    CreateTeacherInput,
    ITeacher
> {

    readonly type = 'teacher'

    constructor(
        private readonly userService: UserService,
        private readonly teacherService: TeacherService,
        private readonly rbacService: RbacService,
        private readonly storageService: StorageService,
    ) {}
    async create(
        input: CreateTeacherInput,
        session: ClientSession,
    ): Promise<ITeacher> {
        const { data, file } = input;

        try {
            const encryptedPassword = await hashPassword(data.password);

            let photoUrl = '';

            if (file) {
                const uploaded = await this.storageService.saveFile(
                    file,
                    'users',
                );
                photoUrl = uploaded.url;
            }

            // crear usuario base
            const user = await this.userService.createUser(
                {
                    name: data.name,
                    lastName: data.lastName,
                    birthday: new Date(data.birthday),
                    email: data.email,
                    password: encryptedPassword,
                    photo: photoUrl,
                    state: true,
                    verification: {
                        status: true,
                        code: generateAlphaNumericCode(6),
                        updatedAt: new Date(),
                    },
                    changePassword: data.changePassword,
                },
                session,
            );

            // create teacher profile
            const teacher = await this.teacherService.createProfile(
                user._id,
                {
                    documentNumber: data.documentNumber,
                    residentialAddress: data.residentialAddress,
                    professionalTitle: data.professionalTitle,
                    professionalLicenseNumber: data.professionalLicenseNumber,
                },
                session,
            );

            // asignar rol en rbac
            await this.rbacService.assignRoleToUser(
                user._id.toString(),
                RoleName.TEACHER,
            );

            return teacher;
        } catch (error) {
            if (error.status) {
                throw error;
            }

            // Errores específicos de MongoDB
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern || {})[0] || 'campo';
                throw new ConflictException(
                    `El ${field} ya está registrado en el sistema`,
                );
            }

            if (error.name === 'ValidationError') {
                throw new BadRequestException(
                    `Datos inválidos: ${error.message}`,
                );
            }

            // Error genérico - loguear para debugging
            console.error('Error creando teacher:', error);
            throw new InternalServerErrorException(
                'Ocurrió un error al crear el perfil del docente',
            );
        }
    }
}
