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

import { IAdmin } from '../../admin/admin.interface';
import { AdminService } from '../../admin/admin.service';
import { RbacService } from '../../rbac/services/rbac.service';
import { UserService } from '../../user/user.service';
import { CreateAdminInput } from '../inputs/create-admin.input';
import { AccountCreationStrategy } from './account-creation.strategy';

@Injectable()
export class CreateAdminStrategy implements AccountCreationStrategy<
    CreateAdminInput,
    IAdmin
> {
    readonly type = 'admin';

    constructor(
        private readonly userService: UserService,
        private readonly adminService: AdminService,
        private readonly rbacService: RbacService,
        private readonly storageService: StorageService,
    ) {}

    async create(
        input: CreateAdminInput,
        session: ClientSession,
    ): Promise<IAdmin> {
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

            const admin = await this.adminService.createProfile(
                user._id,
                {
                    documentNumber: data.documentNumber,
                    residential_address: data.residentialAddress,
                    position: data.position,
                    department: data.department,
                },
                session,
            );

            await this.rbacService.assignRoleToUser(
                user._id.toString(),
                RoleName.ADMIN,
            );

            return admin;
        } catch (error) {
            if (error.status) throw error;

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

            console.error('Error creando admin:', error);
            throw new InternalServerErrorException(
                'Ocurrió un error al crear el perfil del administrador',
            );
        }
    }
}
