import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UserRepository } from '../user/user.repository';
import { StorageService } from '../common/service/storage.service';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { IAdmin } from './admin.interface';
import { GetAdminsQueryDto, UpdateAdminDto } from './admin.dto';

@Injectable()
export class AdminService {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly userRepository: UserRepository,
        private readonly storageService: StorageService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    /* --------------------------------------------------
     * CREATE PROFILE
     * -------------------------------------------------- */
    async createProfile(
        userId: string,
        profile: Partial<IAdmin>,
        session?: ClientSession,
    ) {
        const existingProfile = await this.adminRepository.findByUserId(userId);

        if (existingProfile) {
            throw new BadRequestException(
                `Admin profile already exists. '${existingProfile._id}'`,
            );
        }

        return await this.adminRepository.create(
            { userId, ...profile },
            session,
        );
    }

    /* --------------------------------------------------
     * FIND ALL
     * -------------------------------------------------- */
    async findAll(query: GetAdminsQueryDto) {
        const result = await this.adminRepository.findAllWithUser(query);
        const { data, limit, offset, total } = result;

        return {
            metadata: { total, limit, offset },
            admins: data.map((a) => ({
                _id: a._id,
                userId: a.userId,
                name: a.name,
                lastName: a.lastName,
                email: a.email,
                birthday: a.birthday,
                photo: a.photo,
                documentNumber: a.documentNumber,
                residentialAddress: a.residential_address,
                position: a.position,
                department: a.department,
                state: a.state,
                createdAt: a.createdAt,
            })),
        };
    }

    /* --------------------------------------------------
     * UPDATE ADMIN
     * -------------------------------------------------- */
    async updateAdmin(
        adminId: string,
        dto: UpdateAdminDto,
        file?: Express.Multer.File,
    ) {
        const admin = await this.adminRepository.findById(adminId);
        if (!admin) throw new NotFoundException('Admin not found');

        const user = await this.userRepository.findById(
            admin.userId.toString(),
        );
        if (!user) throw new NotFoundException('User not found');

        const session = await this.connection.startSession();
        let newPhotoUrl: string | null = null;

        try {
            return await session.withTransaction(async () => {
                const userUpdate: Record<string, any> = {};

                // Foto
                if (file) {
                    const { url } = await this.storageService.replaceFile(
                        user.photo ?? '',
                        file,
                        'users',
                    );
                    newPhotoUrl = url;
                    userUpdate.photo = url;
                } else if (dto.removePhoto) {
                    if (user.photo) {
                        await this.storageService.deleteFile(user.photo);
                    }
                    userUpdate.photo = '';
                }

                // Campos del User
                if (dto.name) userUpdate.name = dto.name;
                if (dto.lastName) userUpdate.lastName = dto.lastName;
                if (dto.email) userUpdate.email = dto.email;
                if (dto.birthday) userUpdate.birthday = new Date(dto.birthday);

                if (dto.changePassword && dto.password) {
                    const bcrypt = await import('bcrypt');
                    userUpdate.password = await bcrypt.hash(dto.password, 10);
                }

                if (Object.keys(userUpdate).length > 0) {
                    await this.userRepository.updateById(
                        admin.userId.toString(),
                        userUpdate,
                        session,
                    );
                }

                // Campos del Admin
                const adminUpdate: Record<string, any> = {};
                if (dto.documentNumber)
                    adminUpdate.documentNumber = dto.documentNumber;
                if (dto.residentialAddress)
                    adminUpdate.residential_address = dto.residentialAddress;
                if (dto.position) adminUpdate.position = dto.position;
                if (dto.department !== undefined)
                    adminUpdate.department = dto.department;

                const updated = await this.adminRepository.updateById(
                    adminId,
                    adminUpdate,
                    session,
                );

                return { success: true, adminId: updated._id };
            });
        } catch (error) {
            if (newPhotoUrl) {
                await this.storageService.deleteFile(newPhotoUrl);
            }
            throw error;
        } finally {
            await session.endSession();
        }
    }

    /* --------------------------------------------------
     * TOGGLE STATE (activar / desactivar)
     * -------------------------------------------------- */
    async toggleState(adminId: string) {
        const admin = await this.adminRepository.findById(adminId);
        if (!admin) throw new NotFoundException('Admin not found');

        const user = await this.userRepository.findById(
            admin.userId.toString(),
        );
        if (!user) throw new NotFoundException('User not found');

        await this.userRepository.updateById(admin.userId.toString(), {
            state: !user.state,
        });

        return { success: true, state: !user.state };
    }
}
