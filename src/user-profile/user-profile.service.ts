import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { generateAlphaNumericCode, hashPassword } from '../common/utils/bcrypt';
import { RoleName } from '../rbac/roles/role.interface';
import { RbacService } from '../rbac/services/rbac.service';
import { TeacherService } from '../teacher/teacher.service';
import { StorageService } from '../common/service/storage.service';
import { UserService } from '../user/user.service';
import { CreateTeacherDto } from './user-profile.dto';

@Injectable()
export class UserProfileService {
    constructor(
        private readonly userService: UserService,
        private readonly teacherService: TeacherService,
        private readonly rbacService: RbacService,
        private readonly storageService: StorageService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async createTeacher(data: CreateTeacherDto, file?: Express.Multer.File) {
        const session = await this.connection.startSession();

        try {
            let teacher;

            await session.withTransaction(async () => {
                // hash password
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

                teacher = await this.teacherService.createProfile(
                    user._id,
                    {
                        documentNumber: data.documentNumber,
                        residentialAddress: data.residentialAddress,
                        professionalTitle: data.professionalTitle,
                        professionalLicenseNumber:
                            data.professionalLicenseNumber,
                    },
                    session,
                );

                // asignar rol en rbac
                await this.rbacService.assignRoleToUser(
                    user._id.toString(),
                    RoleName.TEACHER,
                );
            });
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
        } finally {
            await session.endSession();
        }
    }
}
